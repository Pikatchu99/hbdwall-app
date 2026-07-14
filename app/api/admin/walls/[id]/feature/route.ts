import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (!me?.isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id } = await params

  // Unfeature all, then feature this one
  await prisma.wall.updateMany({ data: { featured: false } })
  const wall = await prisma.wall.update({ where: { id }, data: { featured: true } })

  return NextResponse.json({ slug: wall.slug, featured: wall.featured })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (!me?.isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id } = await params
  const wall = await prisma.wall.update({ where: { id }, data: { featured: false } })

  return NextResponse.json({ slug: wall.slug, featured: wall.featured })
}
