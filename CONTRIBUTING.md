# Contribuer à HBDWall

Merci de vouloir contribuer ! Ce document décrit comment participer proprement au projet.

## Avant de coder

- **Ouvre une issue** pour tout changement non trivial (nouvelle fonctionnalité, refactor conséquent, changement de dépendance). Ça évite de coder quelque chose qui ne sera pas mergé.
- Pour un bug, décris comment le reproduire.
- Les petites corrections (typo, doc, fix évident) peuvent aller directement en PR.

## Mise en route

Prérequis : Node.js 22+ et pnpm. Voir le [README](README.md) pour l'installation complète.

```bash
pnpm install
cp .env.production.example .env   # remplis les valeurs
npx prisma dev                    # base Postgres locale
npx prisma db push && npx prisma generate
pnpm seed
pnpm dev
```

## Standards de code

Ces règles reprennent celles du projet ([CLAUDE.md](CLAUDE.md)) :

- **Simplicité d'abord.** Le minimum de code qui résout le problème. Pas d'abstraction spéculative, pas de configurabilité non demandée.
- **Changements chirurgicaux.** Ne touche que ce qui est nécessaire. Ne « refactore » pas le code adjacent, ne reformate pas ce qui n'a pas de rapport avec ta PR.
- **Respecte le style existant.** Design system **Sable** (CSS custom, tokens partagés) — **pas de Tailwind**. La personnalité vient de SVG/doodles custom et d'icônes lucide, **jamais d'emoji dans l'UI**.
- **Accessibilité.** WCAG AA minimum, `prefers-reduced-motion` honoré, focus visible au clavier. Voir [PRODUCT.md](PRODUCT.md) et [DESIGN.md](DESIGN.md).
- **i18n.** Toute chaîne visible passe par next-intl (`fr` / `en`), jamais de texte en dur.

## Pull requests

1. Fork + branche depuis `main` (`feat/...`, `fix/...`).
2. Garde la PR **ciblée** : un sujet par PR.
3. Vérifie que le projet build (`pnpm build`) avant de pousser.
4. Décris le quoi et le pourquoi dans la description ; référence l'issue liée.

## Licence des contributions

En soumettant une contribution, tu acceptes qu'elle soit distribuée sous la licence du projet, **GNU AGPL-3.0** (voir [LICENSE](LICENSE)).
