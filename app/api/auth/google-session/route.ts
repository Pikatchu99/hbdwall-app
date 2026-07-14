import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST() {
  const oauthSession = await auth()

  if (!oauthSession?.user?.email) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: oauthSession.user.email },
    include: { walls: { take: 1 } },
  })

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  const session = await getSession()
  session.userId = user.id
  session.pseudo = user.pseudo
  session.name = user.name
  await session.save()

  return NextResponse.json({
    pseudo: user.pseudo,
    name: user.name,
    isNewUser: user.walls.length === 0,
  })
}
