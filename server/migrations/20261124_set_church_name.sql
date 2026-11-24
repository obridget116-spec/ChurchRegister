-- Keep custom church names intact; only replace the previous default.
UPDATE settings
SET value = 'COP - New Road District',
    updated_at = now()
WHERE key = 'church_name'
  AND value = 'COP Agona Ahanta';
