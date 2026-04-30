-- Indexes
create index if not exists idx_photos_user_id on photos(user_id);
create index if not exists idx_photos_created_at on photos(created_at);
create index if not exists idx_photos_status on photos(status);
create index if not exists idx_reports_created_at on reports(created_at);
