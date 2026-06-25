create table if not exists programs (
  id text primary key,
  title text not null,
  station text not null,
  genre text not null,
  created_at timestamptz default now()
);

create table if not exists episodes (
  id text primary key,
  program_id text references programs(id) on delete cascade,
  date date not null,
  time text not null,
  title text not null,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  program_id text references programs(id) on delete cascade,
  episode_id text references episodes(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  tag text not null,
  spoiler boolean default false,
  comment text not null,
  likes int default 0,
  author_name text default '匿名ユーザー',
  created_at timestamptz default now()
);

alter table programs enable row level security;
alter table episodes enable row level security;
alter table reviews enable row level security;

create policy "programs select all" on programs for select using (true);
create policy "episodes select all" on episodes for select using (true);
create policy "reviews select all" on reviews for select using (true);
create policy "reviews insert all" on reviews for insert with check (true);
create policy "reviews update likes all" on reviews for update using (true);

create policy "programs insert all" on programs for insert with check (true);
create policy "episodes insert all" on episodes for insert with check (true);
