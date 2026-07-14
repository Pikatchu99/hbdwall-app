-- Backfill éditions — tourne automatiquement au déploiement (cf. docker-compose.yml,
-- service "migrate", juste après `prisma db push`). Idempotent : rejouable sans danger.
--
-- 1. Crée une édition 2026 pour chaque wall qui n'en a pas encore.
-- 2. Rattache tous les messages orphelins (editionId NULL) à l'édition 2026 de leur wall.
--
-- Lancement manuel possible :
--   npx prisma db execute --schema=prisma/schema.prisma --url="$DIRECT_DATABASE_URL" --file=prisma/backfill-editions.sql

INSERT INTO "Edition" (id, "wallId", year, "openedAt", "createdAt")
SELECT gen_random_uuid()::text, w.id, 2026, now(), now()
FROM "Wall" w
WHERE NOT EXISTS (
  SELECT 1 FROM "Edition" e WHERE e."wallId" = w.id AND e.year = 2026
);

UPDATE "Message" m
SET "editionId" = e.id
FROM "Edition" e
WHERE e."wallId" = m."wallId"
  AND e.year = 2026
  AND m."editionId" IS NULL;
