-- COMPLETE RLS fix for admin product + image upload
-- Run this entire file in Supabase SQL Editor

-- 1. Admin check function (bypasses RLS on admins table)
create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.current_user_is_admin() to anon;
grant execute on function public.current_user_is_admin() to service_role;

-- Keep is_admin() as alias for other policies
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_is_admin();
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;
grant execute on function public.is_admin() to service_role;

-- 2. Table grants (RLS still applies, but role must have privilege)
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.admins to authenticated;
grant select, insert, update on public.customers to anon, authenticated;
grant insert on public.orders to anon, authenticated;
grant select on public.orders to authenticated;
grant update on public.orders to authenticated;
grant insert on public.order_items to anon, authenticated;
grant select on public.order_items to authenticated;

-- 3. Products — drop ALL existing policies first
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies where tablename = 'products' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.products', pol.policyname);
  end loop;
end $$;

create policy "products_public_select"
  on public.products for select
  to anon, authenticated
  using (active = true or (select public.current_user_is_admin()));

create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check ((select public.current_user_is_admin()));

create policy "products_admin_update"
  on public.products for update
  to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using ((select public.current_user_is_admin()));

-- 4. Admins — ensure user can read own admin row (for UI check)
drop policy if exists "Users can check own admin status" on public.admins;
create policy "Users can check own admin status"
  on public.admins for select
  to authenticated
  using (auth.uid() = user_id);

-- 5. Storage — drop ALL existing product-images policies
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

create policy "storage_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "storage_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (select public.current_user_is_admin())
  );

create policy "storage_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.current_user_is_admin())
  );

create policy "storage_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.current_user_is_admin())
  );

-- 6. Orders + order_items + customers (checkout / guest orders)
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where tablename = 'orders' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.orders', pol.policyname);
  end loop;
  for pol in
    select policyname from pg_policies
    where tablename = 'order_items' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.order_items', pol.policyname);
  end loop;
end $$;

create policy "orders_insert_all"
  on public.orders for insert
  to anon, authenticated
  with check (true);

create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "orders_select_admin"
  on public.orders for select
  to authenticated
  using ((select public.current_user_is_admin()));

create policy "orders_update_admin"
  on public.orders for update
  to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

create policy "order_items_insert_all"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

create policy "order_items_select_own"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
      and o.user_id = auth.uid()
    )
  );

create policy "order_items_select_admin"
  on public.order_items for select
  to authenticated
  using ((select public.current_user_is_admin()));

drop policy if exists "Anyone can insert customers" on public.customers;
drop policy if exists "customers_insert_all" on public.customers;
create policy "customers_insert_all"
  on public.customers for insert
  to anon, authenticated
  with check (true);

-- 7. Verify admin exists (should return 1 row):
-- select u.id, u.email, a.user_id
-- from auth.users u
-- left join public.admins a on a.user_id = u.id
-- where u.email = 'oak@admin.com';
