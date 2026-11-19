-- The decision figures (RUNBOOK.md), per week of first use, for weeks whose travellers have all
-- passed day 7, with two more days for phones that report late.
SELECT
  strftime('%Y-%W', day) AS week,
  SUM(CASE WHEN name = 'new' THEN n ELSE 0 END) AS travellers,
  ROUND(100.0 * SUM(CASE WHEN name = 'day1' THEN n ELSE 0 END) / SUM(CASE WHEN name = 'new' THEN n ELSE 0 END), 1) AS day1_pct,
  ROUND(100.0 * SUM(CASE WHEN name = 'day7' THEN n ELSE 0 END) / SUM(CASE WHEN name = 'new' THEN n ELSE 0 END), 1) AS day7_pct,
  ROUND(100.0 * SUM(CASE WHEN name = 'installed' THEN n ELSE 0 END) / SUM(CASE WHEN name = 'new' THEN n ELSE 0 END), 1) AS installed_pct
FROM counts
WHERE day <= date('now', '-9 days')
GROUP BY week
HAVING travellers > 0
ORDER BY week;

-- Per link travellers first came through (src/counts-api.ts), same weeks: '' is a direct visit,
-- `carte` a shared survival card, `page` a page beside the app.
SELECT
  source,
  SUM(CASE WHEN name = 'new' THEN n ELSE 0 END) AS travellers,
  ROUND(100.0 * SUM(CASE WHEN name = 'day7' THEN n ELSE 0 END) / SUM(CASE WHEN name = 'new' THEN n ELSE 0 END), 1) AS day7_pct,
  ROUND(100.0 * SUM(CASE WHEN name = 'installed' THEN n ELSE 0 END) / SUM(CASE WHEN name = 'new' THEN n ELSE 0 END), 1) AS installed_pct,
  ROUND(100.0 * SUM(CASE WHEN name = 'shared' THEN n ELSE 0 END) / SUM(CASE WHEN name = 'new' THEN n ELSE 0 END), 1) AS shared_pct
FROM counts
WHERE day <= date('now', '-9 days')
GROUP BY source
HAVING travellers > 0
ORDER BY travellers DESC;

-- Sessions finished before the first departure, all weeks together.
SELECT value AS sessions, SUM(n) AS travellers
FROM counts
WHERE name = 'departure'
GROUP BY value
ORDER BY CASE value WHEN '0' THEN 0 WHEN '1' THEN 1 WHEN '2-4' THEN 2 WHEN '5-9' THEN 3 ELSE 4 END;
