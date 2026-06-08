-- Store settings (admin notification email)
-- Run in Supabase SQL Editor

create table if not exists public.store_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into public.store_settings (key, value)
values ('admin_notification_email', 'oak@admin.com')
on conflict (key) do nothing;

alter table public.store_settings enable row level security;

drop policy if exists "store_settings_admin_all" on public.store_settings;
create policy "store_settings_admin_all"
  on public.store_settings
  for all
  to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

grant select, insert, update on public.store_settings to authenticated;

-- Ensure order status updates work for admins
drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
  on public.orders for update
  to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));
