import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export default async function KeystaticLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user?.isAdmin) redirect('/dashboard')

  return <>{children}</>
}
