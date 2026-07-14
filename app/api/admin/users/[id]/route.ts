import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!me?.isAdmin) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const { id } = await params

  if (id === session.userId) {
    return NextResponse.json({ error: 'Tu ne peux pas supprimer ton propre compte' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
