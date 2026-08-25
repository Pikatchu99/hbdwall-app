import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { uploadToR2, InvalidFileError } from '@/lib/r2'
import { getSession } from '@/lib/session'
import webpush from '@/lib/webpush'
import { getCurrentEdition } from '@/lib/edition'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const wall = await prisma.wall.findUnique({ where: { slug } })
  if (!wall) {
    return NextResponse.json({ error: 'Wall introuvable' }, { status: 404 })
  }
  const messages = await prisma.message.findMany({
    where: { wallId: wall.id, isHidden: false },
    orderBy: [
      { fromPlatform: 'desc' },
      { isPinned: 'desc' },
      { pinnedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  })
  return NextResponse.json(messages)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const wall = await prisma.wall.findUnique({ where: { slug, isActive: true } })
  if (!wall) {
    return NextResponse.json({ error: 'Wall introuvable ou inactif' }, { status: 404 })
  }

  const formData = await request.formData()
  const content = formData.get('content') as string
  const authorName = formData.get('authorName') as string | null
  const photo = formData.get('photo') as File | null

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Message vide' }, { status: 400 })
  }

  let photoUrl: string | null = null
  if (photo && photo.size > 0) {
    try {
      photoUrl = await uploadToR2(photo)
    } catch (error) {
      if (error instanceof InvalidFileError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }
  }

  const session = await getSession()
  let fromPlatform = false
  if (session.userId) {
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
    fromPlatform = user?.isAdmin ?? false
  }

  const edition = await getCurrentEdition(wall.id)
  const message = await prisma.message.create({
    data: {
      wallId: wall.id,
      editionId: edition.id,
      content: content.trim(),
      authorName: authorName?.trim() || null,
      photoUrl,
      fromPlatform,
    },
  })

  // Notify wall owner if they have push subscriptions
  const subs = await prisma.pushSubscription.findMany({ where: { userId: wall.userId } })
  if (subs.length > 0) {
    const author = authorName?.trim() || 'Quelqu\'un'
    const payload = JSON.stringify({
      title: 'Nouveau message sur ton mur',
      body: `${author} t'a laissé un message`,
      url: `/wall/${slug}`,
    })
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      } catch {
        await prisma.pushSubscription.delete({ where: { id: sub.id } })
      }
    }
  }

  return NextResponse.json(message, { status: 201 })
}
