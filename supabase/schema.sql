-- Clothing Store Portal - Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    phone text,
    address text,
    created_at timestamptz default now()
);

-- Admins
create table if not exists admins (
    user_id uuid primary key references auth.users(id) on delete cascade
);

-- Customers
create table if not exists customers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid unique null references auth.users(id) on delete set null,
    full_name text,
    phone text unique not null,
    total_orders integer default 0,
    total_spent numeric(10,2) default 0,
    last_order_at timestamptz,
    created_at timestamptz default now()
);

-- Products
create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    price numeric(10,2) not null,
    image_url text,
    category text not null default 't-shirt',
    colors jsonb default '[]',
    sizes jsonb default '[]',
    active boolean default true,
    created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references customers(id),
    user_id uuid null references auth.users(id) on delete set null,
    customer_name text not null,
    phone text not null,
    address text not null,
    subtotal numeric(10,2),
    discount numeric(10,2) default 0,
    total_price numeric(10,2),
    status text default 'pending',
    created_at timestamptz default now()
);

-- Order Items
create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    product_id uuid references products(id) on delete set null,
    product_name text,
    color text,
    size text,
    quantity integer,
    unit_price numeric(10,2)
);

-- Promotions
create table if not exists promotions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    active boolean default true,
    discount_type text not null check (discount_type in ('percentage', 'fixed')),
    discount_value numeric(10,2) not null,
    min_total_spent numeric(10,2),
    min_order_amount numeric(10,2),
    first_order_only boolean default false,
    registered_users_only boolean default false,
    created_at timestamptz default now()
);

-- Helper: check if user is admin (bypasses RLS on admins table)
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

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_is_admin();
$$;

grant execute on function public.current_user_is_admin() to authenticated, anon, service_role;
grant execute on function public.is_admin() to authenticated, anon, service_role;

-- Trigger: update customer stats on new order
create or replace function update_customer_on_order()
returns trigger as $$
begin
  if new.customer_id is not null then
    update customers
    set
      total_orders = total_orders + 1,
      total_spent = total_spent + coalesce(new.total_price, 0),
      last_order_at = new.created_at
    where id = new.customer_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_order_created on orders;
create trigger on_order_created
after insert on orders
for each row
execute function update_customer_on_order();

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table admins enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table promotions enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles
  for select using (is_admin());

-- Admins policies (admins can read admins table to check status)
create policy "Users can check own admin status" on admins
  for select using (auth.uid() = user_id);
create policy "Admins can manage admins" on admins
  for all using (is_admin());

-- Customers policies
create policy "customers_insert_all" on customers
  for insert to anon, authenticated
  with check (true);
create policy "Admins can view all customers" on customers
  for select using (is_admin());
create policy "Admins can update customers" on customers
  for update using (is_admin());
create policy "Users can view own customer record" on customers
  for select using (auth.uid() = user_id);
create policy "Anyone can lookup customer by phone for checkout" on customers
  for select using (true);
create policy "Anyone can update customer on checkout" on customers
  for update using (true);

-- Products policies
create policy "products_public_select" on products
  for select to anon, authenticated
  using (active = true or (select public.current_user_is_admin()));
create policy "products_admin_insert" on products
  for insert to authenticated
  with check ((select public.current_user_is_admin()));
create policy "products_admin_update" on products
  for update to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));
create policy "products_admin_delete" on products
  for delete to authenticated
  using ((select public.current_user_is_admin()));

-- Orders policies
create policy "orders_insert_all" on orders
  for insert to anon, authenticated
  with check (true);
create policy "orders_select_own" on orders
  for select to authenticated
  using (auth.uid() = user_id);
create policy "orders_select_admin" on orders
  for select to authenticated
  using ((select public.current_user_is_admin()));
create policy "orders_update_admin" on orders
  for update to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

-- Order items policies
create policy "order_items_insert_all" on order_items
  for insert to anon, authenticated
  with check (true);
create policy "order_items_select_own" on order_items
  for select to authenticated
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
      and o.user_id = auth.uid()
    )
  );
create policy "order_items_select_admin" on order_items
  for select to authenticated
  using ((select public.current_user_is_admin()));

-- Promotions policies
create policy "Anyone can view active promotions" on promotions
  for select using (active = true or is_admin());
create policy "Admins can insert promotions" on promotions
  for insert with check (is_admin());
create policy "Admins can update promotions" on promotions
  for update using (is_admin());
create policy "Admins can delete promotions" on promotions
  for delete using (is_admin());

-- Storage bucket (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

-- Storage policies (run after creating bucket)
-- create policy "Public read product images" on storage.objects
--   for select using (bucket_id = 'product-images');
-- create policy "Admins upload product images" on storage.objects
--   for insert with check (bucket_id = 'product-images' and is_admin());
-- create policy "Admins update product images" on storage.objects
--   for update using (bucket_id = 'product-images' and is_admin());
-- create policy "Admins delete product images" on storage.objects
--   for delete using (bucket_id = 'product-images' and is_admin());

-- Store settings
create table if not exists store_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into store_settings (key, value)
select 'admin_notification_email', 'oak@admin.com'
where not exists (
  select 1 from store_settings where key = 'admin_notification_email'
);

alter table store_settings enable row level security;

create policy "store_settings_admin_all" on store_settings
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

-- Seed promotions (safe to re-run)
insert into promotions (name, active, discount_type, discount_value, first_order_only, registered_users_only)
select 'Welcome Discount', true, 'percentage', 10, true, true
where not exists (select 1 from promotions where name = 'Welcome Discount');

insert into promotions (name, active, discount_type, discount_value, min_total_spent)
select 'VIP Reward', true, 'fixed', 10, 100
where not exists (select 1 from promotions where name = 'VIP Reward');

insert into promotions (name, active, discount_type, discount_value, min_order_amount)
select 'Big Cart', true, 'percentage', 5, 50
where not exists (select 1 from promotions where name = 'Big Cart');
