-- HOAG Pathology: atomic date-level roster merge
-- Run this once in Supabase SQL Editor before deploying the V7 application.
-- Each save locks the shared app_roster row and changes only the dates edited
-- by that client. Concurrent edits to different dates are therefore preserved.

create or replace function public.merge_team_roster_dates(
  p_roster jsonb,
  p_dates text[],
  p_user_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.app_roster%rowtype;
  v_roster jsonb;
  v_date text;
begin
  insert into public.app_roster (id, version, updated_by, saved_keys, updated_at, roster)
  values ('team', 0, 'SYSTEM', 0, now(), '{}'::jsonb)
  on conflict (id) do nothing;

  select * into v_row
  from public.app_roster
  where id = 'team'
  for update;

  v_roster := coalesce(v_row.roster, '{}'::jsonb);

  foreach v_date in array coalesce(p_dates, array[]::text[]) loop
    if v_date !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      continue;
    end if;

    if coalesce(p_roster, '{}'::jsonb) ? v_date then
      v_roster := jsonb_set(v_roster, array[v_date], p_roster -> v_date, true);
    else
      v_roster := v_roster - v_date;
    end if;
  end loop;

  update public.app_roster
  set
    version = coalesce(version, 0) + 1,
    updated_by = left(coalesce(p_user_id, 'UNKNOWN'), 60),
    saved_keys = (select count(*) from jsonb_object_keys(v_roster)),
    updated_at = clock_timestamp(),
    roster = v_roster
  where id = 'team'
  returning * into v_row;

  return jsonb_build_object(
    'roster', coalesce(v_row.roster, '{}'::jsonb),
    'updated_at', v_row.updated_at,
    'version', v_row.version,
    'saved_keys', v_row.saved_keys
  );
end;
$$;

revoke all on function public.merge_team_roster_dates(jsonb, text[], text) from public;
grant execute on function public.merge_team_roster_dates(jsonb, text[], text) to service_role;
