import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { getCurrentEdition } from '@/lib/edition'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const wall = await prisma.wall.findUnique({ where: { slug } })
  if (!wall) {
    return NextResponse.json({ error: 'Wall introuvable' }, { status: 404 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (wall.userId !== session.userId && !user?.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const existing = await prisma.renderJob.findFirst({
    where: { wallId: wall.id, status: { in: ['pending', 'rendering'] } },
    orderBy: { createdAt: 'desc' },
  })
  if (existing) {
    return NextResponse.json({ error: 'RENDER_IN_PROGRESS', job: existing }, { status: 409 })
  }

  const edition = await getCurrentEdition(wall.id)
  const job = await prisma.renderJob.create({
    data: {
      wallId: wall.id,
      editionId: edition.id,
      requestedById: session.userId,
    },
  })

  return NextResponse.json(job, { status: 201 })
}
