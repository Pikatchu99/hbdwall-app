import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { currentPin, newPin } = await request.json()

  if (!currentPin || !newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    return NextResponse.json({ error: 'PIN invalide' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const valid = await bcrypt.compare(currentPin, user.code)
  if (!valid) return NextResponse.json({ error: 'Code actuel incorrect' }, { status: 400 })

  const hashed = await bcrypt.hash(newPin, 10)
  await prisma.user.update({ where: { id: session.userId }, data: { code: hashed } })

  return NextResponse.json({ ok: true })
}
