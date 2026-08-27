import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import webpush from '@/lib/webpush'

async function sendToSubs(subs: { id: string; endpoint: string; p256dh: string; auth: string }[], payload: object) {
  let sent = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
      sent++
    } catch {
      await prisma.pushSubscription.delete({ where: { id: sub.id } })
    }
  }
  return sent
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // Demain
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowMonth = tomorrow.getMonth() + 1
  const tomorrowDay = tomorrow.getDate()

  const walls = await prisma.wall.findMany({
    where: { user: { pushSubscriptions: { some: {} } } },
    include: {
      user: { include: { pushSubscriptions: true } },
    },
  })

  let sent = 0

  for (const wall of walls) {
    const d = new Date(wall.date)
    const bMonth = d.getMonth() + 1
    const bDay = d.getDate()

    // Le destinataire n'a pas forcément de compte (c'est souvent le créateur qui
    // reçoit la notif pour un wall fait pour quelqu'un d'autre) — le texte doit
    // donc parler de son anniversaire à LUI, pas prétendre que c'est le nôtre.
    const isForSomeoneElse = !!wall.recipientName && wall.recipientName.trim().toLowerCase() !== wall.user.name.trim().toLowerCase()
    const recipientName = wall.recipientName || wall.user.name

    // Jour J
    if (bMonth === month && bDay === day) {
      sent += await sendToSubs(wall.user.pushSubscriptions, {
        title: isForSomeoneElse ? `🎉 C'est l'anniversaire de ${recipientName} !` : `🎉 C'est ton anniversaire !`,
        body: isForSomeoneElse
          ? `Va voir les messages laissés sur son wall — ou laisse le tien !`
          : `Joyeux anniversaire ! 🎊 Tes proches t'ont laissé des messages sur ton wall.`,
        url: `/wall/${wall.slug}`,
      })
    }

    // Veille
    if (bMonth === tomorrowMonth && bDay === tomorrowDay) {
      sent += await sendToSubs(wall.user.pushSubscriptions, {
        title: isForSomeoneElse ? `🔔 L'anniversaire de ${recipientName} c'est demain !` : `🔔 Ton anniversaire c'est demain !`,
        body: isForSomeoneElse
          ? `Partage son wall pour qu'on lui laisse des messages.`
          : `Partage ton wall pour recevoir des messages de tes proches.`,
        url: `/wall/${wall.slug}`,
      })
    }
  }

  return NextResponse.json({ ok: true, sent })
}
