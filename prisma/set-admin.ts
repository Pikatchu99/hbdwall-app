import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env') })

import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const pseudo = process.env.ADMIN_PSEUDO || 'demo'
  const u = await prisma.user.update({
    where: { pseudo },
    data: { isAdmin: true },
  })
  console.log(`@${u.pseudo} isAdmin: ${u.isAdmin}`)
}

main().finally(() => prisma.$disconnect())
