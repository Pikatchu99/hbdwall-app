import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

// Vérifie que l'utilisateur possède le wall ET que l'item appartient bien à ce wall.
async function requireOwnedItem(slug: string, itemId: string) {
  const session = await getSession()
  if (!session.userId) {
    return { error: NextResponse.json({ error: 'Non connecté' }, { status: 401 }) }
  }
  const wall = await prisma.wall.findUnique({ where: { slug } })
  if (!wall) {
    return { error: NextResponse.json({ error: 'Wall introuvable' }, { status: 404 }) }
  }
  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (wall.userId !== session.userId && !me?.isAdmin) {
    return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) }
  }
  const item = await prisma.wishlistItem.findUnique({
    where: { id: itemId },
    include: { edition: { select: { wallId: true } } },
  })
  if (!item || item.edition.wallId !== wall.id) {
    return { error: NextResponse.json({ error: 'Item introuvable' }, { status: 404 }) }
  }
  return { item }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  const { error } = await requireOwnedItem(slug, id)
  if (error) return error

  const { title, url, price } = await request.json()
  if (title !== undefined && !title?.trim()) {
    return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  }

  const updated = await prisma.wishlistItem.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(url !== undefined && { url: url?.trim() || null }),
      ...(price !== undefined && { price: price?.trim() || null }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  const { error } = await requireOwnedItem(slug, id)
  if (error) return error

  await prisma.wishlistItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
