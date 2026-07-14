# Système de notifications push

## Architecture

Les notifications push reposent sur l'API Web Push (VAPID). Les clés sont stockées dans les variables d'environnement `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_MAILTO`. Le wrapper se trouve dans `lib/webpush.ts`.

Les abonnements sont stockés dans le modèle `PushSubscription` (Prisma). Chaque abonnement est lié à un utilisateur et contient `endpoint`, `p256dh`, `auth`. Un utilisateur peut avoir plusieurs abonnements (plusieurs appareils).

Le service worker est dans `public/sw.js`. Il gère la réception des événements push et l'ouverture de l'URL au clic.

## Déclencheurs de notifications

### 1. Anniversaire (cron)
**Route :** `app/api/cron/birthday/route.ts`

Déclenché automatiquement chaque jour. Envoie :
- La veille : "Ton anniversaire c'est demain"
- Le jour J : "C'est ton anniversaire"

Protégé par un header `x-cron-secret`.

### 2. Nouveau message sur un mur
**Route :** `app/api/walls/[slug]/messages/route.ts`

Déclenché à chaque POST de message. Envoie une notification au propriétaire du mur :
- Titre : "Nouveau message sur ton mur"
- Corps : `${authorName} t'a laissé un message`
- URL : `/wall/${slug}`

Si l'auteur est anonyme, le nom affiché est "Quelqu'un".

### 3. Envoi manuel admin
**Route :** `app/api/admin/push/route.ts`

Accessible uniquement aux admins. Accepte :
- `title`, `body` — contenu de la notification
- `target` — label pour l'historique (`all`, `birthday_week`, `users`)
- `userId` — cibler un seul utilisateur (optionnel)
- `userIds` — cibler plusieurs utilisateurs (optionnel)

Si aucun `userId`/`userIds` n'est fourni, la notification est envoyée à tous les abonnés.

Chaque envoi crée une entrée dans `NotificationLog`.

## Page admin `/admin/notifications`

**Fichiers :**
- `app/[locale]/admin/notifications/page.tsx` — server component
- `components/AdminNotifSender.tsx` — client component

### Fonctionnalités

**Sélection des destinataires :**
- `Tous` — tous les abonnés actifs
- `Anniv cette semaine` — abonnés dont l'anniversaire tombe dans les 7 prochains jours
- `Sélection manuelle` — liste de cases à cocher avec recherche, "Tout cocher / Tout décocher"

**Résultat d'envoi :** affiche le nombre d'appareils touchés et le nombre d'échecs.

**Historique :** les 20 derniers envois avec titre, corps, cible, compteurs et date.

**Liste des abonnés :** chaque abonné avec son nombre d'appareils et le compte à rebours J-X jusqu'à son anniversaire.

## Nettoyage des abonnements invalides

Dans tous les endroits où `webpush.sendNotification` est appelé, un échec entraîne la suppression automatique de l'abonnement en base (`prisma.pushSubscription.delete`). Cela couvre les tokens expirés ou révoqués par l'utilisateur.

## Modèle NotificationLog

```prisma
model NotificationLog {
  id        String   @id @default(cuid())
  title     String
  body      String
  target    String
  sent      Int
  failed    Int
  createdAt DateTime @default(now())
}
```

Créé uniquement pour les envois manuels admin, pas pour les notifications automatiques (cron, nouveau message).
