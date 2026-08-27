import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

// GET /api/admin/birthdays?date=YYYY-MM-DD — super-admin only.
// Renvoie les walls dont l'anniversaire tombe à cette date (mois/jour, sans
// tenir compte de l'année — un anniversaire revient chaque année), avec leurs
// messages et photos. Pratique pour transmettre le contexte à une IA.
//
// Deux façons de s'authentifier :
// - header x-admin-api-key: <ADMIN_API_SECRET> — pour un appel API externe
//   (script, IA) sans session navigateur, même principe que CRON_SECRET.
// - session admin classique — pour tester depuis le navigateur.
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-admin-api-key')
  const viaApiKey = !!process.env.ADMIN_API_SECRET && apiKey === process.env.ADMIN_API_SECRET

  if (!viaApiKey) {
    const session = await getSession()
    if (!session.userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
    if (!me?.isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const dateParam = req.nextUrl.searchParams.get('date')
  const target = dateParam ? new Date(dateParam) : new Date()
  if (isNaN(target.getTime())) {
    return NextResponse.json({ error: 'Date invalide (format attendu : YYYY-MM-DD)' }, { status: 400 })
  }
  const targetMonth = target.getMonth() + 1
  const targetDay = target.getDate()

  const walls = await prisma.wall.findMany({
    include: {
      user: { select: { pseudo: true, name: true } },
      messages: {
        where: { isHidden: false, fromPlatform: false },
        orderBy: { createdAt: 'desc' },
        select: { authorName: true, content: true, photoUrl: true, createdAt: true },
      },
    },
  })

  const matches = walls.filter(w => {
    const d = new Date(w.date)
    return d.getMonth() + 1 === targetMonth && d.getDate() === targetDay
  })

  return NextResponse.json({
    date: `${target.getFullYear()}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`,
    count: matches.length,
    walls: matches.map(w => ({
      slug: w.slug,
      title: w.title,
      recipientName: w.recipientName ?? w.user.name,
      birthDate: w.date,
      createdBy: w.user.pseudo,
      messages: w.messages.map(m => ({
        authorName: m.authorName,
        content: m.content,
        photoUrl: m.photoUrl,
        createdAt: m.createdAt,
      })),
    })),
  })
}
