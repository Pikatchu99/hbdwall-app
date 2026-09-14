import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Une bougie soufflée pour ce mur : on incrémente le compteur, sans compte ni
// identité (le geste est anonyme, comme un vœu).
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const wall = await prisma.wall.findUnique({ where: { slug }, select: { id: true, isActive: true } })
  if (!wall || !wall.isActive) {
    return NextResponse.json({ error: 'Wall introuvable ou inactif' }, { status: 404 })
  }
  const updated = await prisma.wall.update({
    where: { id: wall.id },
    data: { candlesBlown: { increment: 1 } },
    select: { candlesBlown: true },
  })
  return NextResponse.json({ count: updated.candlesBlown })
}
