import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; jobId: string }> }
) {
  const { slug, jobId } = await params
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const wall = await prisma.wall.findUnique({ where: { slug } })
  if (!wall) {
    return NextResponse.json({ error: 'Wall introuvable' }, { status: 404 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (wall.userId !== session.userId && !user?.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const job = await prisma.renderJob.findUnique({ where: { id: jobId } })
  if (!job || job.wallId !== wall.id) {
    return NextResponse.json({ error: 'Rendu introuvable' }, { status: 404 })
  }

  return NextResponse.json(job)
}
