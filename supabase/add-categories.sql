-- Add product category for filtering
-- Run in Supabase SQL Editor

alter table products
  add column if not exists category text not null default 't-shirt';

create index if not exists products_category_idx on products (category);
