-- Puerta 18 · Álbum Digital — telemetry schema (PostgreSQL 13+, e.g. Neon / Vercel Postgres)
--
-- One row per first-time unlock of a stand by an anonymous visitor.
-- user_id is the random UUID the app keeps in localStorage (no personal data).
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS scans (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID        NOT NULL,
  stand_id    VARCHAR(64) NOT NULL,
  scanned_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scans_stand_id ON scans (stand_id);
CREATE INDEX IF NOT EXISTS idx_scans_user_id  ON scans (user_id);

-- ---------------------------------------------------------------------------
-- Analytical queries
-- The client only reports first unlocks, but COUNT(DISTINCT ...) keeps the
-- numbers honest even if a visitor reset their album or a request was retried.
-- ---------------------------------------------------------------------------

-- 1) Popularity: scans and unique visitors per stand.
-- SELECT stand_id,
--        COUNT(*)                AS total_scans,
--        COUNT(DISTINCT user_id) AS unique_visitors
-- FROM scans
-- GROUP BY stand_id
-- ORDER BY unique_visitors DESC;

-- 2) Reach: unique visitors who unlocked at least one sticker.
-- SELECT COUNT(DISTINCT user_id) AS unique_visitors FROM scans;

-- 3) Drop-off: how many stickers each visitor collected, with the share of
--    visitors at each level and how many got at least that far.
--    Replace 3 with the number of stands to read the last row as the
--    completion rate.
-- WITH per_user AS (
--   SELECT user_id, COUNT(DISTINCT stand_id) AS stickers
--   FROM scans
--   GROUP BY user_id
-- )
-- SELECT stickers,
--        COUNT(*) AS visitors,
--        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_of_visitors,
--        SUM(COUNT(*)) OVER (ORDER BY stickers DESC)        AS reached_at_least
-- FROM per_user
-- GROUP BY stickers
-- ORDER BY stickers;

-- 4) Traffic by hour (Buenos Aires time) to staff the stands and Informes.
-- SELECT date_trunc('hour', scanned_at AT TIME ZONE 'America/Argentina/Buenos_Aires') AS hour,
--        COUNT(*)                AS scans,
--        COUNT(DISTINCT user_id) AS active_visitors
-- FROM scans
-- GROUP BY 1
-- ORDER BY 1;

-- 5) Route: which stand visitors unlock first (entry points of the expo).
-- SELECT stand_id, COUNT(*) AS first_unlocks
-- FROM (
--   SELECT DISTINCT ON (user_id) user_id, stand_id
--   FROM scans
--   ORDER BY user_id, scanned_at
-- ) AS firsts
-- GROUP BY stand_id
-- ORDER BY first_unlocks DESC;
