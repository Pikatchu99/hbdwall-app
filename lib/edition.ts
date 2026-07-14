import { prisma } from '@/lib/db'

/**
 * Édition courante d'un wall = celle de l'année calendaire en cours.
 *
 * Find-or-create : si l'année a basculé depuis le dernier message, la nouvelle
 * édition naît toute seule au premier appel — pas de cron de bascule.
 *
 * Limitation v1 assumée : la clé est l'année calendaire, pas le cycle
 * d'anniversaire. Pour un anniversaire le 31 décembre, les messages de fin
 * décembre et début janvier tombent dans deux éditions. Cas rare, traité en v2.
 */
export function currentYear() {
  return new Date().getFullYear()
}

export async function getCurrentEdition(wallId: string) {
  const year = currentYear()
  return prisma.edition.upsert({
    where: { wallId_year: { wallId, year } },
    create: { wallId, year },
    update: {},
  })
}

/** Lecture seule — ne crée rien (à utiliser dans les GET / le rendu de page). */
export function findEdition(wallId: string, year: number) {
  return prisma.edition.findUnique({
    where: { wallId_year: { wallId, year } },
  })
}
