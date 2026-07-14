import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

const attempts = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(req: NextRequest, pseudo: string) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  return `${ip}:${pseudo}`
}

export async function POST(request: NextRequest) {
  const { pseudo, code } = await request.json()

  if (!pseudo || !code) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const key = getRateLimitKey(request, pseudo)
  const now = Date.now()
  const entry = attempts.get(key)

  if (entry && now < entry.resetAt && entry.count >= MAX_ATTEMPTS) {
    const minutes = Math.ceil((entry.resetAt - now) / 60000)
    return NextResponse.json(
      { error: `Trop de tentatives. Réessaie dans ${minutes} min.` },
      { status: 429 }
    )
  }

  const user = await prisma.user.findUnique({ where: { pseudo } })
  const valid = user ? await compare(code, user.code) : false

  if (!user || !valid) {
    const current = entry && now < entry.resetAt ? entry : { count: 0, resetAt: now + WINDOW_MS }
    attempts.set(key, { count: current.count + 1, resetAt: current.resetAt })
    return NextResponse.json({ error: 'Pseudo ou code incorrect' }, { status: 401 })
  }

  attempts.delete(key)

  const session = await getSession()
  session.userId = user.id
  session.pseudo = user.pseudo
  session.name = user.name
  await session.save()

  return NextResponse.json({ pseudo: user.pseudo, name: user.name, isAdmin: user.isAdmin })
}
