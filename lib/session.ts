import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: string
  pseudo?: string
  name?: string
  pendingLink?: string
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'hbdwall_secret_key_min_32_chars_long!!',
  cookieName: 'bw_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
