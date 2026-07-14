// Attribution invité→créateur.
// Le détour OAuth Google efface le referrer et les query params : on porte donc
// le slug du wall d'origine dans sessionStorage, posé au moment où l'invité clique
// "créer mon wall", relu à la création du wall de signup (cf. onboarding).
export const REF_WALL_KEY = 'hbd_ref_wall'

export function captureRefWall(slug: string) {
  if (typeof window === 'undefined' || !slug) return
  try {
    sessionStorage.setItem(REF_WALL_KEY, slug)
  } catch {
    // sessionStorage indisponible (mode privé strict) — l'attribution retombe sur Umami
  }
}
