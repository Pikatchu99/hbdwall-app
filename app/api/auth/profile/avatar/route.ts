import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { auth } from '@/auth'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'

async function resolveUserId(): Promise<string | undefined> {
  const session = await getSession()
  if (session.userId) return session.userId
  const oauthSession = await auth()
  if (oauthSession?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: oauthSession.user.email }, select: { id: true } })
    return user?.id
  }
}

export async function POST(request: NextRequest) {
  const userId = await resolveUserId()
  if (!userId) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('avatar') as File | null
  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Fichier image requis' }, { status: 400 })
  }

  const current = await prisma.user.findUnique({ where: { id: userId }, select: { image: true } })

  const url = await uploadToR2(file)
  await prisma.user.update({ where: { id: userId }, data: { image: url } })

  if (current?.image) {
    deleteFromR2(current.image).catch(() => {})
  }

  return NextResponse.json({ image: url })
}

export async function DELETE() {
  const userId = await resolveUserId()
  if (!userId) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const current = await prisma.user.findUnique({ where: { id: userId }, select: { image: true } })
  await prisma.user.update({ where: { id: userId }, data: { image: null } })

  if (current?.image) {
    deleteFromR2(current.image).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
