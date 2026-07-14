import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

async function requireAdmin() {
  const session = await getSession()
  if (!session.userId) return null
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  return user?.isAdmin ? session.userId : null
}

export async function GET() {
  const posts = await prisma.instagramPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { walls: { select: { slug: true, title: true, user: { select: { pseudo: true, name: true } } } } },
  })
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { url } = await request.json()
  if (!url?.includes('instagram.com')) return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
  const post = await prisma.instagramPost.upsert({
    where: { url },
    create: { url },
    update: {},
  })
  return NextResponse.json(post, { status: 201 })
}
