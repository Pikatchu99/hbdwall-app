import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { getWallSeedMessage } from '@/lib/birthday-messages'
import { getCurrentEdition } from '@/lib/edition'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { date, locale, pseudo, name, referrerWallSlug } = await request.json()
  if (!date) {
    return NextResponse.json({ error: 'Date manquante' }, { status: 400 })
  }

  let user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  const updates: Record<string, string> = {}
  if (name && name.trim() && name.trim() !== user.name) updates.name = name.trim()
  if (pseudo && pseudo !== user.pseudo) {
    const taken = await prisma.user.findUnique({ where: { pseudo } })
    if (taken) {
      return NextResponse.json({ error: 'Ce pseudo est déjà pris' }, { status: 400 })
    }
    updates.pseudo = pseudo
  }
  if (Object.keys(updates).length > 0) {
    user = await prisma.user.update({ where: { id: user.id }, data: updates })
    session.pseudo = user.pseudo
    session.name = user.name
    await session.save()
  }

  let wallSlug = `${user.pseudo}-birthday`
  const slugExists = await prisma.wall.findUnique({ where: { slug: wallSlug } })
  if (slugExists) wallSlug = `${user.pseudo}-birthday-${Date.now().toString(36)}`

  const wallDate = new Date(date)
  const wall = await prisma.wall.create({
    data: {
      slug: wallSlug,
      title: `Anniversaire de ${user.name}`,
      recipientName: user.name,
      date: wallDate,
      userId: user.id,
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

  // Attribution invité→créateur : best-effort, ne doit jamais casser l'inscription.
  // Si la colonne referrerWallSlug n'est pas encore poussée en base (prisma db push),
  // l'update échoue silencieusement et l'inscription aboutit quand même.
  if (referrerWallSlug && typeof referrerWallSlug === 'string' && referrerWallSlug !== wall.slug) {
    try {
      const ref = await prisma.wall.findUnique({ where: { slug: referrerWallSlug }, select: { slug: true } })
      if (ref) {
        await prisma.wall.update({ where: { id: wall.id }, data: { referrerWallSlug: ref.slug } })
      }
    } catch {
      // colonne absente ou autre — on ignore, l'attribution reste côté Umami
    }
  }

  return NextResponse.json({ wallSlug: wall.slug })
}
