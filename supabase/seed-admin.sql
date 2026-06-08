-- Seed super admin: oak@admin.com
-- Run in Supabase SQL Editor (after schema.sql)

create extension if not exists pgcrypto;

do $$
declare
  admin_email text := 'oak@admin.com';
  admin_password text := 'Kassem1999@';
  admin_name text := 'Super Admin';
  admin_user_id uuid;
  encrypted_pw text;
begin
  select id into admin_user_id from auth.users where email = admin_email;

  if admin_user_id is null then
    admin_user_id := gen_random_uuid();
    encrypted_pw := crypt(admin_password, gen_salt('bf'));

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      encrypted_pw,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', admin_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      admin_user_id,
      jsonb_build_object('sub', admin_user_id::text, 'email', admin_email),
      'email',
      admin_user_id::text,
      now(),
      now(),
      now()
    );

    raise notice 'Created new user: %', admin_user_id;
  else
    raise notice 'User already exists: %', admin_user_id;
  end if;

  insert into public.admins (user_id)
  values (admin_user_id)
  on conflict (user_id) do nothing;

  raise notice 'Super admin ready. Email: % | User ID: %', admin_email, admin_user_id;
end $$;
