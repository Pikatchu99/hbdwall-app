# Système "Quoi de neuf" (What's New)

## Vue d'ensemble

Quand une mise à jour importante sort, les utilisateurs existants voient un modal au premier chargement du dashboard. Ils peuvent lire le résumé dans le modal ou aller sur la page dédiée `/nouveautes` pour le détail complet. Un lien vers la page est aussi présent dans le footer de la landing.

## Fichiers impliqués

| Fichier | Rôle |
|---|---|
| `lib/whats-new.ts` | Version courante + contenu des cartes du modal |
| `components/WhatsNewModal.tsx` | Modal one-shot affiché sur le dashboard |
| `app/[locale]/nouveautes/page.tsx` | Page détaillée bilingue (FR/EN) |
| `public/nouveautes/` | Screenshots et images référencées dans la page |

## Comment fonctionne le modal

- Au mount, `WhatsNewModal` lit `localStorage.getItem('seen_whats_new_vN')`.
- Si absent → modal ouvert. Au dismiss → clé écrite, modal fermé pour toujours.
- La clé est `seen_whats_new_v${WHATS_NEW_VERSION}` — bumper la version suffit à le réafficher pour tous les utilisateurs existants.
- La langue est détectée via `useLocale()` (next-intl) — le modal s'affiche en FR ou EN selon la locale de l'URL.

## Comment fonctionne la page `/nouveautes`

- Server component — `getLocale()` sélectionne le bloc de contenu (`fr` ou `en`) depuis l'objet `CONTENT` en tête de fichier.
- Structure fixe (sections, images, collapsibles iOS) — seul le texte change entre les locales.
- Images chargées depuis `/public/nouveautes/` via le composant `ImageSlot` (affiche un placeholder si le fichier est absent).

## Checklist pour une nouvelle release

**1. Bumper la version** — `lib/whats-new.ts`
```ts
export const WHATS_NEW_VERSION = 2  // était 1
```
Le localStorage key devient `seen_whats_new_v2` → le modal se réaffiche pour tout le monde.

**2. Mettre à jour les cartes du modal** — `lib/whats-new.ts`
```ts
export const WHATS_NEW_FEATURES: WhatsNewFeature[] = [
  {
    icon: SomeLucideIcon,
    title: 'Titre en français',
    titleEn: 'Title in English',
    desc: 'Description courte FR.',
    descEn: 'Short description EN.',
    highlight: true,  // mettre sur la feature principale uniquement
  },
  // ...
]
```

**3. Mettre à jour la page complète** — `app/[locale]/nouveautes/page.tsx`

Éditer l'objet `CONTENT` — les clés `fr` et `en` doivent toujours être synchronisées.

Mettre à jour le badge de date :
```ts
badge: 'MISE À JOUR · JUIN 2026',   // fr
badge: 'UPDATE · JUNE 2026',        // en
```

Ajouter les nouvelles sections ou modifier les existantes directement dans le JSX.

**4. Ajouter les images**

Déposer les fichiers dans `public/nouveautes/` et les référencer via `ImageSlot` :
```tsx
<ImageSlot src="/nouveautes/ma-feature.png" alt="Description" />
```
Si le fichier est absent, `ImageSlot` affiche un placeholder — pas de crash.

## Contenu de la release v1 (mai 2026)

- Mise en avant Instagram & TikTok — ajout des champs `instagramHandle` / `tiktokHandle` sur le profil
- Connexion Google — liaison d'un compte Google pour se connecter sans PIN
- Notifications push — abonnement web push, instructions iOS avec captures
- CGU & Politique de confidentialité — pages `/cgu` et `/privacy`
