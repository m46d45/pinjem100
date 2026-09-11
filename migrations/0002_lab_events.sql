create table if not exists lab_events (
  id serial primary key,
  kind text not null,
  path text,
  zone text,
  preset text,
  mode text,
  created_at timestamptz not null default now()
);
create index if not exists lab_events_kind_idx on lab_events (kind);
