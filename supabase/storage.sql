-- Run after creating the product-images bucket in Supabase Storage dashboard
-- Bucket settings: public = true

create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "storage_admin_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and (select public.current_user_is_admin())
);

create policy "storage_admin_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and (select public.current_user_is_admin())
);

create policy "storage_admin_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and (select public.current_user_is_admin())
);
