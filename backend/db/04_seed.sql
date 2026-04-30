-- Seed data (safe to delete later)
insert into users (username, email, password_hash)
values
  ('ari', 'ari@exposr.com', 'hashed_pw_1'),
  ('zj', 'zj@exposr.com', 'hashed_pw_2'),
  ('jarlan', 'jarlan@exposr.com', 'hashed_pw_3')
on conflict do nothing;

insert into photos (user_id, storage_url, status, reveal_at)
select id, 'https://example.com/photo-1.jpg', 'ready', now() from users where username = 'ari'
union all
select id, 'https://example.com/photo-2.jpg', 'developing', now() + interval '1 hour' from users where username = 'zj'
union all
select id, 'https://example.com/photo-3.jpg', 'ready', now() from users where username = 'jarlan'
;

insert into reports (photo_id, reported_by, reason, ai_flag, ai_reason)
select p.id, u.id, 'test report', false, 'seed'
from photos p
join users u on u.username = 'ari'
where p.storage_url = 'https://example.com/photo-2.jpg'
limit 1;
