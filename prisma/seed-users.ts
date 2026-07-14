import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env') })

import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

const USERS = [
  { pseudo: 'sofia-m',     name: 'Sofia',     date: '2026-04-03' },
  { pseudo: 'karim-b',     name: 'Karim',     date: '2026-04-07' },
  { pseudo: 'lea-r',       name: 'Léa',       date: '2026-04-10' },
  { pseudo: 'hugo-d',      name: 'Hugo',      date: '2026-04-14' },
  { pseudo: 'ines-t',      name: 'Inès',      date: '2026-04-19' },
  { pseudo: 'theo-v',      name: 'Théo',      date: '2026-04-22' },
  { pseudo: 'emma-c',      name: 'Emma',      date: '2026-04-27' },
  { pseudo: 'nour-a',      name: 'Nour',      date: '2026-04-30' },
  { pseudo: 'jules-k',     name: 'Jules',     date: '2026-05-04' },
  { pseudo: 'amina-s',     name: 'Amina',     date: '2026-05-11' },
  { pseudo: 'luca-f',      name: 'Luca',      date: '2026-05-18' },
  { pseudo: 'chloe-n',     name: 'Chloé',     date: '2026-06-01' },
  { pseudo: 'adam-z',      name: 'Adam',      date: '2026-06-15' },
  { pseudo: 'manon-p',     name: 'Manon',     date: '2026-07-04' },
  { pseudo: 'rayan-h',     name: 'Rayan',     date: '2026-07-20' },
  { pseudo: 'jade-l',      name: 'Jade',      date: '2026-08-08' },
  { pseudo: 'alexis-g',    name: 'Alexis',    date: '2026-09-12' },
  { pseudo: 'yasmine-b',   name: 'Yasmine',   date: '2026-10-03' },
  { pseudo: 'nathan-w',    name: 'Nathan',    date: '2026-11-17' },
  { pseudo: 'camille-d',   name: 'Camille',   date: '2026-12-24' },
]

const MESSAGES: Record<string, { content: string; authorName: string }[]> = {
  'sofia-m': [
    { content: 'Sofia tu es la lumière de notre groupe, joyeux annif !', authorName: 'Maman' },
    { content: 'Meilleure amie du monde. Que cette année soit incroyable.', authorName: 'Leila' },
    { content: 'On a trop de souvenirs ensemble, vivement les prochains !', authorName: 'Tom' },
  ],
  'karim-b': [
    { content: 'Karim, tu mérites tout le bonheur du monde. Joyeux anniversaire !', authorName: 'Papa' },
    { content: 'Mon frère, fier de toi chaque jour qui passe.', authorName: 'Younes' },
  ],
  'lea-r': [
    { content: 'Léa t\'es la meilleure pâtissière que je connaisse, happy birthday !', authorName: 'Juliette' },
    { content: 'Belle journée pour une belle personne.', authorName: 'Marc' },
    { content: 'Que du bonheur pour toi cette année ✨', authorName: 'Maman' },
  ],
  'hugo-d': [
    { content: 'Hugo mon pote, grosse journée aujourd\'hui ! On fête ça ce soir.', authorName: 'Raph' },
  ],
  'emma-c': [
    { content: 'Tu rayonnes Emma, joyeux anniversaire de tout cœur.', authorName: 'Grand-mère' },
    { content: 'Meilleure coloc qu\'on ait jamais eu. Bon annif !', authorName: 'Sarah' },
    { content: 'Que tes rêves deviennent réalité cette année.', authorName: 'Paul' },
  ],
  'nour-a': [
    { content: 'Nour, tu apportes de la douceur partout où tu passes.', authorName: 'Lina' },
    { content: 'Joyeux anniversaire à ma petite sœur préférée !', authorName: 'Sami' },
  ],
}

async function main() {
  const hashedCode = await bcrypt.hash('1234', 10)

  let created = 0
  let skipped = 0

  for (const u of USERS) {
    const existing = await prisma.user.findUnique({ where: { pseudo: u.pseudo } })
    if (existing) { skipped++; continue }

    const user = await prisma.user.create({
      data: { pseudo: u.pseudo, name: u.name, code: hashedCode },
    })

    const wall = await prisma.wall.create({
      data: {
        slug: `${u.pseudo}-birthday`,
        title: `Anniversaire de ${u.name}`,
        date: new Date(u.date),
        userId: user.id,
        isActive: true,
      },
    })

    const msgs = MESSAGES[u.pseudo] ?? []
    for (const m of msgs) {
      await prisma.message.create({
        data: { wallId: wall.id, content: m.content, authorName: m.authorName },
      })
    }

    console.log(`✓ @${u.pseudo} · ${u.date} · ${msgs.length} messages`)
    created++
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped. Code for all: 1234`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
