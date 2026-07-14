import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { getWallSeedMessage } from '@/lib/birthday-messages'
import { getCurrentEdition } from '@/lib/edition'

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }
  const walls = await prisma.wall.findMany({
    where: { userId: session.userId },
    include: { _count: { select: { messages: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(walls)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const { title, date, description, recipientName, locale } = await request.json()
  if (!title || !date || !recipientName) {
    return NextResponse.json({ error: 'Titre, date et prénom requis' }, { status: 400 })
  }

  let slug = `${session.pseudo}-${slugify(recipientName)}-${slugify(title)}`
  const existing = await prisma.wall.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const wallDate = new Date(date)
  const wall = await prisma.wall.create({
    data: {
      slug,
      title: `${title} de ${recipientName}`,
      recipientName,
      isBirthday: title === 'Anniversaire',
      date: wallDate,
      description: description || null,
      userId: session.userId,
    },
  })

  const edition = await getCurrentEdition(wall.id)
  const seed = getWallSeedMessage(wallDate, locale || 'fr')
  await prisma.message.create({
    data: {
      wallId: wall.id,
      editionId: edition.id,
      content: seed.content,
      authorName: seed.authorName,
      fromPlatform: true,
    },
  })

  return NextResponse.json(wall, { status: 201 })
}
