import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env') })

import { readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { uploadBufferToR2 } from '../lib/r2'
import { buildWallReplayInputProps } from '../lib/wallReplay'
import type { WallReplayInputProps } from '../remotion/types'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

const POLL_INTERVAL_MS = 5000

async function claimNextJob() {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    UPDATE "RenderJob"
    SET status = 'rendering', "startedAt" = now()
    WHERE id = (
      SELECT id FROM "RenderJob"
      WHERE status = 'pending'
      ORDER BY "createdAt" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id
  `
  return rows[0]?.id ?? null
}

async function buildInputProps(jobId: string): Promise<{ inputProps: WallReplayInputProps; wallSlug: string }> {
  const job = await prisma.renderJob.findUniqueOrThrow({ where: { id: jobId } })
  const wall = await prisma.wall.findUniqueOrThrow({ where: { id: job.wallId } })

  const [messages, allMessages] = await Promise.all([
    prisma.message.findMany({
      where: { wallId: wall.id, isHidden: false },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      select: { id: true, authorName: true, content: true, photoUrl: true },
    }),
    prisma.message.findMany({
      where: { wallId: wall.id, isHidden: false },
      orderBy: { createdAt: 'desc' },
      select: { id: true, authorName: true, photoUrl: true, content: true },
    }),
  ])

  const inputProps = buildWallReplayInputProps(wall, messages, allMessages)

  return { inputProps, wallSlug: wall.slug }
}

async function renderJob(jobId: string) {
  const { inputProps, wallSlug } = await buildInputProps(jobId)

  const serveUrl = await bundle({ entryPoint: resolve(__dirname, '../remotion/index.ts') })
  const composition = await selectComposition({
    serveUrl,
    id: 'WallReplay',
    inputProps,
    timeoutInMilliseconds: 120000,
  })

  const outputPath = join(tmpdir(), `wall-replay-${jobId}.mp4`)
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
    timeoutInMilliseconds: 120000,
  })

  const buffer = await readFile(outputPath)
  const videoUrl = await uploadBufferToR2(buffer, {
    key: `renders/${wallSlug}-${jobId}.mp4`,
    contentType: 'video/mp4',
  })
  await unlink(outputPath).catch(() => {})

  await prisma.renderJob.update({
    where: { id: jobId },
    data: { status: 'done', videoUrl, finishedAt: new Date() },
  })
}

async function loop() {
  console.log('[render-worker] démarré, en attente de jobs...')
  while (true) {
    const jobId = await claimNextJob().catch(error => {
      console.error('[render-worker] erreur en réclamant un job', error)
      return null
    })

    if (!jobId) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
      continue
    }

    console.log(`[render-worker] job ${jobId} pris en charge`)
    try {
      await renderJob(jobId)
      console.log(`[render-worker] job ${jobId} terminé`)
    } catch (error) {
      console.error(`[render-worker] job ${jobId} a échoué`, error)
      await prisma.renderJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          errorMessage: String(error instanceof Error ? error.message : error).slice(0, 500),
          finishedAt: new Date(),
        },
      }).catch(updateError => console.error('[render-worker] impossible de marquer le job en échec', updateError))
    }
  }
}

loop()
