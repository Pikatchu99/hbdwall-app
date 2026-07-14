import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!me?.isAdmin) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const { id } = await params
  const { pin } = await request.json()

  const newPin = pin || '0000'
  if (!/^\d{4}$/.test(newPin)) return NextResponse.json({ error: 'PIN invalide' }, { status: 400 })

  const hashed = await bcrypt.hash(newPin, 10)
  await prisma.user.update({ where: { id }, data: { code: hashed } })

  return NextResponse.json({ ok: true, pin: newPin })
}
