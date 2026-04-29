-- 06_triggers.sql
-- Reset and increment weekly photo counters + trigger binding
-- NOTE: The pg_cron scheduling call is provided but commented out.
-- If your Supabase project does not support pg_cron, run the functions via
-- the backend scheduler (backend/services/developTimer.js) instead.

CREATE OR REPLACE FUNCTION reset_photo_counts()
RETURNS VOID AS $$
BEGIN
    UPDATE weeklyphotos SET weeklyphoto_count = 0;
    RAISE NOTICE 'photo_count reset at %', NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_photo_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE weeklyphotos
    SET weeklyphoto_count = weeklyphoto_count + 1
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment a user's weekly count after a photo is inserted
DROP TRIGGER IF EXISTS trg_increment_photo_count ON photos;
CREATE TRIGGER trg_increment_photo_count
AFTER INSERT ON photos
FOR EACH ROW
EXECUTE FUNCTION increment_photo_count();

-- Optional: schedule the reset via pg_cron (commented out)
-- Uncomment and run if your Postgres host supports the pg_cron extension.
-- Make sure the extension is enabled and you have the required privileges.
--
-- SELECT cron.schedule(
--     'reset-photo-counts',       -- job name
--     '0 0 * * 1',                -- cron: midnight every Monday
--     'SELECT reset_photo_counts();'
-- );

-- Helpful queries (uncomment to use for debugging):
-- -- View all scheduled jobs
-- -- SELECT * FROM cron.job;
-- -- View recent run history
-- -- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
-- -- Remove a job
-- -- SELECT cron.unschedule('reset-photo-counts');
