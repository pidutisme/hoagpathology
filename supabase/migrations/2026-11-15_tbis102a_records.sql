create table if not exists public.tbis102a_records (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tbis102a_records_created_at_idx on public.tbis102a_records (created_at desc);
create index if not exists tbis102a_records_updated_at_idx on public.tbis102a_records (updated_at desc);

comment on table public.tbis102a_records is 'TBIS102A microbiology fluorescence microscopy registration records. Server API uses the service role; browser clients do not access this table directly.';
