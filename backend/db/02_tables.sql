-- Tables

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Photos
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  storage_url text not null,
  status text not null default 'developing',
  reveal_at timestamptz,
  created_at timestamptz default now()
);

-- Reports
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  reported_by uuid references users(id) on delete cascade,
  reason text,
  ai_flag boolean default false,
  ai_reason text,
  created_at timestamptz default now()
);

-- Friends (optional mutuals)
create table if not exists friends (
  user_id uuid references users(id) on delete cascade,
  friend_id uuid references users(id) on delete cascade,
  status text not null default 'accepted',
  created_at timestamptz default now(),
  primary key (user_id, friend_id)
);
