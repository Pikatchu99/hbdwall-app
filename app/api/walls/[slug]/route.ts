import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const wall = await prisma.wall.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, pseudo: true } },
      _count: { select: { messages: true } },
    },
  })
  if (!wall) {
    return NextResponse.json({ error: 'Wall introuvable' }, { status: 404 })
  }
  return NextResponse.json(wall)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }
  const { slug } = await params
  const [wall, me] = await Promise.all([
    prisma.wall.findUnique({ where: { slug } }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } }),
  ])
  if (!wall || (wall.userId !== session.userId && !me?.isAdmin)) {
    return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  }
  const body = await request.json()
  const { description, date, recipientName } = body

  if (date !== undefined) {
    const todayStr = new Date().toISOString().slice(0, 10)
    if (!date || date.slice(0, 10) < todayStr) {
      return NextResponse.json({ error: 'Date invalide ou dans le passé' }, { status: 400 })
    }
  }

  const data: Record<string, unknown> = {
    ...(description !== undefined && { description: description ?? null }),
    ...(date !== undefined && { date: new Date(date) }),
    ...(recipientName !== undefined && { recipientName: recipientName || null }),
  }
  if ('instagramPostId' in body && me?.isAdmin) data.instagramPostId = body.instagramPostId ?? null
  if ('instagramPostUrl' in body && me?.isAdmin) {
    const url = typeof body.instagramPostUrl === 'string' ? body.instagramPostUrl.trim() : ''
    if (!url) {
      data.instagramPostId = null
    } else {
      if (!url.includes('instagram.com')) {
        return NextResponse.json({ error: 'URL Instagram invalide' }, { status: 400 })
      }
      const post = await prisma.instagramPost.upsert({
        where: { url },
        create: { url },
        update: {},
      })
      data.instagramPostId = post.id
    }
  }

  const updated = await prisma.wall.update({ where: { slug }, data })
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }
  const { slug } = await params
  const [wall, me] = await Promise.all([
    prisma.wall.findUnique({ where: { slug } }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } }),
  ])
  if (!wall || (wall.userId !== session.userId && !me?.isAdmin)) {
    return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  }
  await prisma.wall.delete({ where: { slug } })
  return NextResponse.json({ ok: true })
}
