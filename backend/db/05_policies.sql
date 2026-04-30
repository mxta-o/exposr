-- Optional RLS policies (skip for hackathon if using service role)
-- Uncomment if you want to enable RLS later.

-- alter table users enable row level security;
-- alter table photos enable row level security;
-- alter table reports enable row level security;
-- alter table friends enable row level security;

-- Users can read their own row
-- create policy "users_select_own" on users
--   for select using (auth.uid() = id);

-- Users can insert their own row
-- create policy "users_insert_own" on users
--   for insert with check (auth.uid() = id);

-- Photos: users can read ready photos
-- create policy "photos_select_ready" on photos
--   for select using (status = 'ready');

-- Photos: users can insert their own
-- create policy "photos_insert_own" on photos
--   for insert with check (auth.uid() = user_id);

-- Reports: users can insert their own reports
-- create policy "reports_insert_own" on reports
--   for insert with check (auth.uid() = reported_by);
