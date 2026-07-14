import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const tiktokHandle = body.tiktokHandle?.trim().replace(/^@/, '') || undefined

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      wantsFeature: !user.wantsFeature,
      ...(tiktokHandle ? { tiktokHandle } : {}),
    },
  })

  return NextResponse.json({ wantsFeature: updated.wantsFeature })
}
