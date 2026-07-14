import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

const AUTHJS_COOKIE = process.env.NODE_ENV === 'production'
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

export async function POST() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(AUTHJS_COOKIE)?.value

  if (sessionToken) {
    await prisma.session.deleteMany({ where: { sessionToken } }).catch(() => null)
  }

  const session = await getSession()
  session.destroy()

  const response = NextResponse.json({ ok: true })
  response.cookies.delete(AUTHJS_COOKIE)
  return response
}
