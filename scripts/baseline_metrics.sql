-- HBDWall — Baseline & weekly-review metrics (Postgres / Prisma schema)
-- Tables are PascalCase and case-sensitive → keep the double quotes.
-- North Star = walls created / week. Health metric = K (needs Umami events for the
-- guest→creator rate; everything below is computable from Postgres alone, today).

-- A. North Star — walls created this week
SELECT COUNT(*) AS walls_this_week
FROM "Wall"
WHERE "createdAt" >= date_trunc('week', now())
  AND "createdAt" <  date_trunc('week', now()) + interval '1 week';

-- A2. North Star trend — last 8 weeks
SELECT date_trunc('week', "createdAt") AS week, COUNT(*) AS walls
FROM "Wall"
WHERE "createdAt" >= now() - interval '8 weeks'
GROUP BY 1 ORDER BY 1;

-- B. New users this week
SELECT COUNT(*) AS new_users_this_week
FROM "User"
WHERE "createdAt" >= date_trunc('week', now())
  AND "createdAt" <  date_trunc('week', now()) + interval '1 week';

-- C. Messages per wall (this week's walls, real messages only)
SELECT
  COUNT(DISTINCT w.id)                                              AS walls,
  COUNT(m.id)                                                       AS messages,
  ROUND(COUNT(m.id)::numeric / NULLIF(COUNT(DISTINCT w.id), 0), 1)  AS msgs_per_wall
FROM "Wall" w
LEFT JOIN "Message" m
  ON m."wallId" = w.id AND m."isHidden" = false AND m."fromPlatform" = false
WHERE w."createdAt" >= date_trunc('week', now());

-- D. Dead-wall rate — walls with zero real messages (last 30 days)
SELECT
  COUNT(*)                                              AS walls,
  COUNT(*) FILTER (WHERE msg_count = 0)                 AS dead_walls,
  ROUND(100.0 * COUNT(*) FILTER (WHERE msg_count = 0) / NULLIF(COUNT(*), 0), 1) AS dead_pct
FROM (
  SELECT w.id,
         COUNT(m.id) FILTER (WHERE m."isHidden" = false AND m."fromPlatform" = false) AS msg_count
  FROM "Wall" w
  LEFT JOIN "Message" m ON m."wallId" = w.id
  WHERE w."createdAt" >= now() - interval '30 days'
  GROUP BY w.id
) t;

-- E. Time-to-first-message — median hours (last 30 days of walls)
SELECT percentile_cont(0.5) WITHIN GROUP (
         ORDER BY EXTRACT(EPOCH FROM (first_msg - w."createdAt")) / 3600
       ) AS median_hours_to_first_msg
FROM "Wall" w
JOIN LATERAL (
  SELECT MIN(m."createdAt") AS first_msg
  FROM "Message" m
  WHERE m."wallId" = w.id AND m."fromPlatform" = false
) fm ON true
WHERE w."createdAt" >= now() - interval '30 days'
  AND fm.first_msg IS NOT NULL;

-- F. Walls-per-creator distribution (early loop signal)
SELECT walls_per_user, COUNT(*) AS num_users
FROM (
  SELECT "userId", COUNT(*) AS walls_per_user
  FROM "Wall" GROUP BY "userId"
) t
GROUP BY walls_per_user ORDER BY walls_per_user;

-- G. Ground-truth K numerator — guest→creator (only meaningful AFTER `prisma db push`
--    adds Wall."referrerWallSlug" and some attributed signups exist)
SELECT
  COUNT(*)                                                  AS walls_created,
  COUNT(*) FILTER (WHERE "referrerWallSlug" IS NOT NULL)    AS from_a_guest,
  ROUND(100.0 * COUNT(*) FILTER (WHERE "referrerWallSlug" IS NOT NULL)
        / NULLIF(COUNT(*), 0), 1)                           AS guest_to_creator_pct
FROM "Wall"
WHERE "createdAt" >= now() - interval '30 days';
