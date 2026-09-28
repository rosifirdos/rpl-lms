-- Enforce the business invariant that at most one KRS period is open at a time.
-- A partial unique index is used because Prisma schema cannot represent it.
CREATE UNIQUE INDEX "periode_krs_single_active_key"
ON "periode_krs" (("is_aktif"))
WHERE "is_aktif" = true;
