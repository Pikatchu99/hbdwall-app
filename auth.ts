import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import type { Adapter } from 'next-auth/adapters'

async function generatePseudo(email: string): Promise<string> {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-')
  let pseudo = base
  let suffix = 1
  while (await prisma.user.findUnique({ where: { pseudo } })) {
    pseudo = `${base}-${suffix++}`
  }
  return pseudo
}

function buildAdapter(): Adapter {
  const adapter = PrismaAdapter(prisma)
  return {
    ...adapter,
    async getUserByEmail(email) {
      const session = await getSession()
      // When linking, force Auth.js to call createUser instead of detecting OAuthAccountNotLinked
      if (session.pendingLink) return null
      return adapter.getUserByEmail!(email)
    },
    async createUser(data) {
      const session = await getSession()

      if (session.pendingLink) {
        const existing = await prisma.user.findUnique({ where: { id: session.pendingLink } })
        if (existing) {
          const updated = await prisma.user.update({
            where: { id: existing.id },
            data: { email: data.email ?? existing.email, image: data.image ?? null, authProvider: 'google' },
          })
          session.pendingLink = undefined
          await session.save()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return { ...updated, emailVerified: null } as any
        }
        session.pendingLink = undefined
        await session.save()
      }

      const pseudo = await generatePseudo(data.email!)
      const user = await prisma.user.create({
        data: {
          name: data.name ?? pseudo,
          email: data.email,
          image: data.image ?? null,
          pseudo,
          authProvider: 'google',
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...user, emailVerified: null } as any
    },
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: buildAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
  },
})
