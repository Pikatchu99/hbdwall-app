import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env') })

import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Identifiants du compte de démo — configurables via .env (jamais en dur).
  const pseudo = process.env.SEED_PSEUDO || 'demo'
  const code = process.env.SEED_CODE || '0000'
  const name = process.env.SEED_NAME || 'Demo'
  const slug = process.env.SEED_SLUG || 'demo-birthday'

  const existing = await prisma.user.findUnique({ where: { pseudo } })
  if (existing) {
    console.log(`Wall @${pseudo} already exists - skipping seed.`)
    return
  }

  const hashedCode = await bcrypt.hash(code, 10)

  const user = await prisma.user.create({
    data: {
      pseudo,
      name,
      code: hashedCode,
      isAdmin: true,
    },
  })

  await prisma.wall.create({
    data: {
      slug,
      title: `Happy Birthday ${name}`,
      date: new Date('2026-04-19'),
      description: 'Laisse moi un petit mot !',
      userId: user.id,
    },
  })

  console.log(`Seeded: @${pseudo} · wall/${slug} (code défini via SEED_CODE)`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
