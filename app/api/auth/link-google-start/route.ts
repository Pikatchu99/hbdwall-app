import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }
  session.pendingLink = session.userId
  await session.save()
  return NextResponse.json({ ok: true })
}
