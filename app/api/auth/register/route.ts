import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { getWallSeedMessage } from '@/lib/birthday-messages'

export async function POST(request: NextRequest) {
  const { pseudo, name, code, date, locale } = await request.json()

  if (!pseudo || !code || !date) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }
  if (!/^\d{4}$/.test(code)) {
    return NextResponse.json({ error: 'Le code doit être 4 chiffres' }, { status: 400 })
  }
  if (!/^[a-z0-9-]+$/.test(pseudo)) {
    return NextResponse.json({ error: 'Pseudo invalide (minuscules, chiffres, tirets)' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { pseudo } })
  if (existing) {
    return NextResponse.json({ error: 'Ce pseudo est déjà pris' }, { status: 400 })
  }

  const displayName = name?.trim() || pseudo
  const hashedCode = await hash(code, 10)
  const user = await prisma.user.create({
    data: { pseudo, name: displayName, code: hashedCode },
  })

  let wallSlug = `${pseudo}-birthday`
  const slugExists = await prisma.wall.findUnique({ where: { slug: wallSlug } })
  if (slugExists) wallSlug = `${pseudo}-birthday-${Date.now().toString(36)}`

  const wallDate = new Date(date)
  const wall = await prisma.wall.create({
    data: {
      slug: wallSlug,
      title: `Anniversaire de ${displayName}`,
      recipientName: displayName,
      date: wallDate,
      userId: user.id,
    },
  })

  const seed = getWallSeedMessage(wallDate, locale || 'fr')
  await prisma.message.create({
    data: {
      wallId: wall.id,
      content: seed.content,
      authorName: seed.authorName,
      fromPlatform: true,
    },
  })

  const session = await getSession()
  session.userId = user.id
  session.pseudo = user.pseudo
  session.name = user.name
  await session.save()

  return NextResponse.json({ pseudo: user.pseudo, name: user.name, wallSlug: wall.slug })
}
