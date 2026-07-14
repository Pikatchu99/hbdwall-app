import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env') })

import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

const MESSAGES = [
  { author: 'Sophie', content: 'Joyeux anniversaire ! Tu mérites tout le bonheur du monde.' },
  { author: 'Lucas', content: 'Heureux anniversaire mon pote. Une autre année de folie qui commence !' },
  { author: 'Amina', content: 'Que cette nouvelle année t\'apporte plein de surprises et de belles rencontres.' },
  { author: 'Thomas', content: 'Joyeux anniversaire ! C\'est toujours un plaisir de te croiser.' },
  { author: 'Léa', content: 'Je te souhaite le meilleur pour cette nouvelle année de vie. Profite bien !' },
  { author: null, content: 'Bon anniversaire ! (Tu sais qui c\'est lol)' },
  { author: 'Kévin', content: 'Passe une excellente journée et profite à fond.' },
  { author: 'Inès', content: 'Joyeux anniversaire ! Que tes rêves se réalisent un par un cette année.' },
  { author: 'Maxime', content: 'Heureux anniversaire ! T\'as vieilli mais t\'as toujours pas grandi haha.' },
  { author: 'Camille', content: 'Un grand jour aujourd\'hui ! Je pense fort à toi.' },
  { author: 'Yasmine', content: 'Bon anniv\' ! On va fêter ça comme il se doit.' },
  { author: 'Julien', content: 'Meilleurs voeux pour cette nouvelle année. Santé et succès !' },
  { author: null, content: 'Joyeux anniversaire de la part de toute la team !' },
  { author: 'Sarah', content: 'Que du bonheur, que de l\'amour, que du succès. Joyeux anniversaire !' },
  { author: 'Noa', content: 'Trop content de te connaitre. Passe un super anniversaire !' },
  { author: 'Rania', content: 'Joyeux anniversaire ! Tu vas tout déchirer cette année, j\'en suis sûre.' },
  { author: 'Baptiste', content: 'Une autre bougie mais toujours aussi jeune dans ta tête. Bon anniv !' },
  { author: 'Fatou', content: 'Que cette journée soit à ton image : brillante et chaleureuse.' },
  { author: 'Arthur', content: 'Joyeux anniversaire mon frère. Longue vie et plein de succès !' },
  { author: 'Jade', content: 'Je t\'envoie pleins de bons vibes pour ton anniversaire et pour l\'année à venir.' },
  { author: 'Nathan', content: 'Bon anniversaire ! On se retrouve bientôt pour fêter ça pour de vrai.' },
  { author: 'Emma', content: 'Tu grandis en sagesse chaque année. Joyeux anniversaire !' },
  { author: 'Amine', content: 'Que du bon pour toi cette année. Bon anniversaire !' },
  { author: null, content: 'Passe une excellente journée. Tu le mérites vraiment.' },
  { author: 'Clara', content: 'Un an de plus, une vie plus belle. Joyeux anniversaire !' },
  { author: 'Hugo', content: 'Heureux de faire partie de ta vie. Passe un super anniversaire !' },
  { author: 'Melissa', content: 'Que cette année soit pleine de projets qui aboutissent et de moments inoubliables.' },
  { author: 'Karim', content: 'Joyeux anniversaire ! Continue d\'avancer comme tu le fais, t\'es inspirant.' },
  { author: 'Chloé', content: 'Bon anniversaire ! La fête peut commencer maintenant.' },
  { author: 'Dylan', content: 'Que du beau pour toi cette année. Profite de chaque seconde.' },
  { author: 'Marine', content: 'Joyeux anniversaire ! Toujours là pour toi quoi qu\'il arrive.' },
  { author: 'Samy', content: 'T\'as encore vieilli mais bon, personne n\'est parfait haha. Bon anniv !' },
  { author: 'Lola', content: 'Que cette journée soit aussi belle que toi. Joyeux anniversaire !' },
  { author: 'Théo', content: 'Meilleur anniversaire à l\'un des meilleurs. Continue comme ça.' },
  { author: null, content: 'Un petit mot pour te dire qu\'on pense à toi aujourd\'hui. Bon anniversaire !' },
  { author: 'Axel', content: 'Joyeux anniversaire ! Le monde a de la chance de t\'avoir.' },
  { author: 'Zoé', content: 'Que ton année soit remplie de bonnes nouvelles et de belles surprises.' },
  { author: 'Ilyes', content: 'Bon anniversaire mon gars. On se fait ça bientôt irl !' },
  { author: 'Manon', content: 'Joyeux anniversaire ! Tu mérites tout ce que la vie a de meilleur.' },
  { author: 'Quentin', content: 'Une pensée pour toi en ce jour spécial. Bon anniversaire !' },
  { author: 'Eva', content: 'T\'es quelqu\'un de bien et ça se voit. Passe un super anniversaire.' },
  { author: 'Raphaël', content: 'Joyeux anniversaire ! Que cette nouvelle année t\'apporte tout ce que tu espères.' },
  { author: 'Lucie', content: 'Bon anniv\' ! On est fiers de toi et de tout ce que tu accomplis.' },
  { author: 'Mehdi', content: 'Que du positif pour toi cette année. Joyeux anniversaire !' },
  { author: null, content: 'La vie est belle et toi aussi. Joyeux anniversaire !' },
  { author: 'Julie', content: 'Joyeux anniversaire ! J\'espère que tu passes une journée mémorable.' },
  { author: 'Simon', content: 'Une autre année qui commence. Que celle-ci soit la meilleure jusqu\'ici !' },
  { author: 'Aïcha', content: 'Plein de bonheur, de santé et de succès pour cette nouvelle année de vie.' },
  { author: 'Pierre', content: 'Joyeux anniversaire ! C\'est un honneur de te connaitre.' },
  { author: 'Anaïs', content: 'Que cette journée soit parfaite et que l\'année qui commence soit exceptionnelle.' },
]

async function main() {
  const pseudo = process.env.SEED_PSEUDO || 'demo'
  const user = await prisma.user.findUnique({ where: { pseudo } })
  if (!user) {
    console.error(`User @${pseudo} not found.`)
    process.exit(1)
  }

  const wall = await prisma.wall.findFirst({ where: { userId: user.id } })
  if (!wall) {
    console.error(`No wall found for @${pseudo}.`)
    process.exit(1)
  }

  console.log(`Found wall: ${wall.slug} (${wall.title})`)

  const shuffled = [...MESSAGES].sort(() => Math.random() - 0.5)

  await prisma.message.createMany({
    data: shuffled.map(m => ({
      wallId: wall.id,
      authorName: m.author,
      content: m.content,
    })),
  })

  console.log(`Created ${MESSAGES.length} messages on wall "${wall.title}"`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
