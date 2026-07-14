import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { auth } from '@/auth'

export async function PATCH(request: NextRequest) {
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

  const { name, email, tiktokHandle, instagramHandle } = await request.json()

  const data: { name?: string; email?: string; tiktokHandle?: string; instagramHandle?: string } = {}
  if (name?.trim()) data.name = name.trim()
  if (email?.trim()) data.email = email.trim()
  if (tiktokHandle !== undefined) data.tiktokHandle = tiktokHandle.replace(/^@/, '') || null as unknown as string
  if (instagramHandle !== undefined) data.instagramHandle = instagramHandle.replace(/^@/, '') || null as unknown as string

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: true })
  }

  let user
  try {
    user = await prisma.user.update({
      where: { id: userId },
      data,
    })
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Cet email est déjà utilisé par un autre compte.' }, { status: 409 })
    }
    throw err
  }

  if (data.name && user) {
    await prisma.wall.updateMany({
      where: { userId },
      data: {
        title: `Anniversaire de ${data.name}`,
        recipientName: data.name,
      },
    })
    session.name = user.name
    await session.save()
  }

  return NextResponse.json({ ok: true })
}
