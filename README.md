# HBDWall

Crée une page pour un anniversaire. Partage le lien. Les invités laissent un mot et une photo, sans compte. Le créateur génère un collage souvenir exportable — et ses invités sont invités à créer le leur.

→ [hbdwall.xyz](https://hbdwall.xyz)

---

## Ce que ça fait

### Côté créateur
- **Création de wall** — inscription par pseudo + code 4 chiffres **ou** Google. Titre, date, destinataire, presets de thème.
- **Page admin du wall** — modère les messages : épingle (`isPinned`), masque (`isHidden`) avec traçabilité (qui / quel rôle), supprime, voit les photos en lightbox.
- **Personnalisation** — thème et image de couverture configurables par wall (`/wall/[slug]/customize`).
- **Collage exportable** — image PNG en 3 formats (carré 1:1, portrait 9:16, paysage 16:9). Styles : épuré, coloré, confetti, poster. Sélection des messages à inclure, N&B ou couleur. Export côté client (`html2canvas` / `html-to-image`).
- **Dashboard** — vue de ses walls et de leurs messages.

### Côté invité → boucle virale
- **Page publique** — les invités laissent un message (texte + photo optionnelle) sans créer de compte.
- **Attribution invité→créateur** — quand un invité clique « créer mon wall », le slug d'origine est porté dans `sessionStorage` (résiste au détour OAuth Google) puis attribué à la création (`referrerWallSlug`). C'est le levier de croissance central. Cf. [lib/referral.ts](lib/referral.ts).

### Engagement & contenu
- **Push notifications** — abonnement Web Push, rappels d'anniversaire envoyés via le cron (`/api/cron/birthday`), journalisés (`NotificationLog`).
- **Blog** — articles éditables via **Keystatic** (CMS Git-based), routes `/blog` et `/blog/[slug]`.
- **Page Nouveautés** (`/nouveautes`) — changelog produit.
- **Intégration Instagram** — walls reliés à des posts Instagram, preview et génération d'image côté admin.

### Administration plateforme (`isAdmin`)
- Vue globale de tous les walls et utilisateurs, reset de PIN, walls mis en avant (`featured`) sur la landing, envoi de notifications, gestion des posts Instagram.

### Internationalisation
- **next-intl** — locales `fr` (défaut) et `en`, routing `/[locale]`.

## Stack

- **Next.js 16** + React 19 (App Router, Webpack)
- **Prisma 7** + PostgreSQL
- **Auth double** — `next-auth 5` (Google OAuth, sessions en base) **+** `iron-session 8` (pseudo + code 4 chiffres, legacy)
- **Cloudflare R2** — stockage des photos uploadées (`@aws-sdk/client-s3`)
- **web-push** — notifications (clés VAPID)
- **Keystatic** — CMS du blog
- **next-intl** — i18n (fr / en)
- **html2canvas** / **html-to-image** — export PNG côté client
- **framer-motion**, **canvas-confetti** — animations
- **Sable Design System** — CSS custom (Inter 900 + Space Mono, pas de Tailwind)

---

## Développement

### Prérequis

- Node.js 22+
- pnpm

### Installation

```bash
git clone https://github.com/Pikatchu99/hbdwall-app.git
cd hbdwall-app
pnpm install
```

### Variables d'environnement

```bash
cp .env.production.example .env
```

Remplis `.env` (toutes les valeurs sensibles sont à fournir toi-même, rien n'est committé) :

```env
# Base de données
DATABASE_URL=prisma+postgres://localhost:51213/?api_key=...
DIRECT_DATABASE_URL=postgres://postgres:postgres@localhost:51214/template1

# Sessions
SESSION_SECRET=une_chaine_aleatoire_32_chars_min   # iron-session (pseudo + code)
AUTH_SECRET=une_autre_chaine_aleatoire             # next-auth

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudflare R2 (photos)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Web Push (clés VAPID)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_MAILTO=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=   # même valeur que VAPID_PUBLIC_KEY

# Cron (rappels anniversaire)
CRON_SECRET=

# Seed (compte de démo local — mets tes propres valeurs)
SEED_PSEUDO=demo
SEED_CODE=0000
SEED_NAME=Demo
SEED_SLUG=demo-birthday
```

> Génère les clés VAPID avec `npx web-push generate-vapid-keys`.

### Base de données

```bash
# Lance le serveur PostgreSQL local
npx prisma dev

# Dans un autre terminal
npx prisma db push
npx prisma generate

# Seed — crée un compte de démo à partir des variables SEED_* du .env
pnpm seed
```

### Démarrer

```bash
pnpm dev
# → http://localhost:3000
```

---

## Production (VPS + Docker)

### Prérequis

- Docker + Docker Compose
- Nginx
- Certbot pour le SSL

### 1. Clone et configure

```bash
git clone https://github.com/Pikatchu99/hbdwall-app.git
cd hbdwall-app
cp .env.production.example .env
nano .env  # remplis toutes les valeurs (DB, auth, R2, VAPID, cron)
```

### 2. Nginx + SSL

```bash
sudo cp nginx/example.conf /etc/nginx/sites-available/ton-domaine
sudo ln -s /etc/nginx/sites-available/ton-domaine /etc/nginx/sites-enabled/
sudo certbot --nginx -d ton-domaine
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Lancer les containers

```bash
docker compose up -d --build
```

### 4. Initialiser la base de données

```bash
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts
```

### Cron — rappels d'anniversaire

L'endpoint `/api/cron/birthday` est protégé par `CRON_SECRET`. Déclenche-le quotidiennement (cron système / planificateur) :

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://ton-domaine/api/cron/birthday
```

### Mise à jour

```bash
git pull
docker compose up -d --build
```

---

## Backups

Un container `backup` exécute un `pg_dump` quotidien uploadé sur Cloudflare R2.

---

## Contribuer

Les contributions sont les bienvenues — voir [CONTRIBUTING.md](CONTRIBUTING.md). Ouvre une issue pour tout changement conséquent, garde les PR ciblées, et respecte le style existant (design system Sable, pas de Tailwind).

## Licence

Projet publié sous licence **GNU AGPL-3.0**. Voir [LICENSE](LICENSE). En clair : tu peux lire, utiliser, modifier et redistribuer le code, mais si tu déploies une version modifiée comme service en ligne, tu dois en publier le code source sous la même licence.

---

by [@yemalin](https://yemalin-modeste.netlify.app)
