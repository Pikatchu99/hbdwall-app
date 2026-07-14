import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

type MessageAction = 'pin' | 'unpin' | 'hide' | 'unhide'

async function getAuthorizedMessage(id: string) {
  const session = await getSession()
  if (!session.userId) {
    return { error: NextResponse.json({ error: 'Non connecté' }, { status: 401 }) }
  }

  const message = await prisma.message.findUnique({
    where: { id },
    include: { wall: { select: { userId: true } } },
  })
  if (!message) {
    return { error: NextResponse.json({ error: 'Message introuvable' }, { status: 404 }) }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isAdmin: true },
  })

  if (message.wall.userId !== session.userId && !user?.isAdmin) {
    return { error: NextResponse.json({ error: 'Non autorisé' }, { status: 403 }) }
  }

  return { message, user, session }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authorized = await getAuthorizedMessage(id)
  if (authorized.error) return authorized.error

  const { message, user, session } = authorized
  const body = await request.json().catch(() => ({}))
  const action = body.action as MessageAction | undefined

  if (!action || !['pin', 'unpin', 'hide', 'unhide'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  if ((action === 'hide' || action === 'unhide') && message.fromPlatform && !user?.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  if (action === 'pin') {
    if (message.fromPlatform) {
      return NextResponse.json({ error: 'Message HBDWall déjà prioritaire' }, { status: 400 })
    }

    const updated = await prisma.$transaction(async tx => {
      const pinnedCount = await tx.message.count({
        where: {
          wallId: message.wallId,
          isPinned: true,
          fromPlatform: false,
          id: { not: message.id },
        },
      })
      if (pinnedCount >= 3) throw new Error('PIN_LIMIT_REACHED')

      return tx.message.update({
        where: { id: message.id },
        data: { isPinned: true, pinnedAt: new Date() },
      })
    }).catch(error => {
      if (error instanceof Error && error.message === 'PIN_LIMIT_REACHED') {
        return null
      }
      throw error
    })
    if (!updated) {
      return NextResponse.json({ error: 'Tu peux épingler 3 messages maximum' }, { status: 400 })
    }
    return NextResponse.json(updated)
  }

  if (action === 'unpin') {
    const updated = await prisma.message.update({
      where: { id: message.id },
      data: { isPinned: false, pinnedAt: null },
    })
    return NextResponse.json(updated)
  }

  if (action === 'hide') {
    const updated = await prisma.message.update({
      where: { id: message.id },
      data: {
        isHidden: true,
        hiddenAt: new Date(),
        hiddenById: session.userId,
        hiddenByRole: user?.isAdmin ? 'admin' : 'owner',
      },
    })
    return NextResponse.json(updated)
  }

  const updated = await prisma.message.update({
    where: { id: message.id },
    data: {
      isHidden: false,
      hiddenAt: null,
      hiddenById: null,
      hiddenByRole: null,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authorized = await getAuthorizedMessage(id)
  if (authorized.error) return authorized.error
  const { message, user } = authorized

  if (message.fromPlatform && !user?.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  await prisma.message.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
