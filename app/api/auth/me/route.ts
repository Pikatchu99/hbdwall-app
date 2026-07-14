import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { auth } from '@/auth'

export async function GET() {
  const session = await getSession()
  let userId = session.userId

  if (!userId) {
    const oauthSession = await auth()
    if (oauthSession?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: oauthSession.user.email }, select: { id: true } })
      userId = user?.id
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  let email: string | null = null
  let tiktokHandle: string | null = null
  let instagramHandle: string | null = null
  let authProvider = 'pin'
  let image: string | null = null
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, tiktokHandle: true, instagramHandle: true, authProvider: true, image: true },
    })
    email = user?.email ?? null
    tiktokHandle = user?.tiktokHandle ?? null
    instagramHandle = user?.instagramHandle ?? null
    authProvider = user?.authProvider ?? 'pin'
    image = user?.image ?? null
  } catch {}

  return NextResponse.json({
    userId: session.userId,
    pseudo: session.pseudo,
    name: session.name,
    email,
    tiktokHandle,
    instagramHandle,
    authProvider,
    image,
  })
}
