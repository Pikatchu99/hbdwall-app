import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

async function requireAdmin() {
  const session = await getSession()
  if (!session.userId) return false
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  return user?.isAdmin ?? false
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { id } = await params
  await prisma.wall.updateMany({ where: { instagramPostId: id }, data: { instagramPostId: null } })
  await prisma.instagramPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { id } = await params
  const { wallSlugs } = await request.json()
  // Unlink walls previously linked to this post
  await prisma.wall.updateMany({ where: { instagramPostId: id }, data: { instagramPostId: null } })
  // Link selected walls
  if (wallSlugs?.length) {
    await prisma.wall.updateMany({ where: { slug: { in: wallSlugs } }, data: { instagramPostId: id } })
  }
  return NextResponse.json({ ok: true })
}
