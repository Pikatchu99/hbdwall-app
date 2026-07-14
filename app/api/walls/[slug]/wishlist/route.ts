import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { getCurrentEdition, findEdition, currentYear } from '@/lib/edition'

// Owner ou admin uniquement — renvoie le wall si autorisé, sinon une réponse d'erreur.
async function requireOwner(slug: string) {
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
  return { wall }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const wall = await prisma.wall.findUnique({ where: { slug } })
  if (!wall) {
    return NextResponse.json({ error: 'Wall introuvable' }, { status: 404 })
  }
  const edition = await findEdition(wall.id, currentYear())
  if (!edition) return NextResponse.json([])
  const items = await prisma.wishlistItem.findMany({
    where: { editionId: edition.id },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(items)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { wall, error } = await requireOwner(slug)
  if (error) return error

  const { title, url, price } = await request.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  }

  const edition = await getCurrentEdition(wall!.id)
  const count = await prisma.wishlistItem.count({ where: { editionId: edition.id } })
  const item = await prisma.wishlistItem.create({
    data: {
      editionId: edition.id,
      title: title.trim(),
      url: url?.trim() || null,
      price: price?.trim() || null,
      position: count,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
