import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import webpush from '@/lib/webpush'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (!me?.isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { title, body, url: customUrl, userId, userIds, target = 'all' } = await req.json()
  if (!title || !body) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const subs = await prisma.pushSubscription.findMany({
    where: userId ? { userId } : userIds?.length ? { userId: { in: userIds } } : undefined,
    include: {
      user: { include: { walls: { select: { slug: true }, take: 1 } } },
    },
  })

  let sent = 0
  let failed = 0
  for (const sub of subs) {
    const slug = sub.user.walls[0]?.slug
    const url = customUrl || (slug ? `/wall/${slug}` : '/')
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url })
      )
      sent++
    } catch {
      failed++
      await prisma.pushSubscription.delete({ where: { id: sub.id } })
    }
  }

  await prisma.notificationLog.create({
    data: { title, body, target, sent, failed },
  })

  return NextResponse.json({ ok: true, sent, failed })
}
