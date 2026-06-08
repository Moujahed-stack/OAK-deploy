# OAK Clothing Store Portal

A production-ready clothing e-commerce application built with React, TypeScript, TailwindCSS, and Supabase.

## Features

- Product catalog with detail pages
- Shopping cart (localStorage)
- Guest checkout
- Customer accounts with order history
- Phone-based customer tracking
- Database-driven promotion engine
- Admin dashboard (products, orders, customers, promotions)
- Manual order status updates (pending / completed / rejected)
- Admin email notifications on new orders

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a [Supabase](https://supabase.com) project
2. Enable **Email/Password** authentication
3. Run `supabase/schema.sql` in the SQL Editor
4. Create a public storage bucket named `product-images`
5. Run `supabase/storage.sql` in the SQL Editor
6. Copy `.env.example` to `.env` and add your credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create an admin user

1. Register a user through the app
2. Copy the user's UUID from Supabase Auth dashboard
3. Run in SQL Editor:

```sql
insert into admins(user_id) values('YOUR_USER_UUID');
```

### 4. Run store settings SQL

Run `supabase/store-settings.sql` in the SQL Editor (notification email + order status update policies).

### 5. Run the app

```bash
npm run dev
```

## Order status (admin)

On **Admin → Orders**, change status directly from the dropdown on each row (Pending / Completed / Rejected). You can also update status on the order detail page.

If status updates fail, run `supabase/store-settings.sql` or ensure `orders_update_admin` policy includes `WITH CHECK`.

## Email notifications on new orders

When a customer checks out, the app calls the `notify-admin-order` Supabase Edge Function.

### Setup

1. Create a free account at [Resend](https://resend.com) and get an API key
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and link your project
3. Deploy the function:

```bash
supabase functions deploy notify-admin-order
```

4. Set secrets:

```bash
supabase secrets set RESEND_API_KEY=re_xxxx
supabase secrets set FROM_EMAIL="OAK Clothing <onboarding@resend.dev>"
supabase secrets set ADMIN_NOTIFICATION_EMAIL=oak@admin.com
```

5. In the app go to **Admin → Settings** and set the notification email

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to edge functions.

Checkout still succeeds if email delivery fails.

## Tech Stack

- **Frontend:** Vite, React, TypeScript, React Router, TailwindCSS, TanStack Query, React Hook Form, Zod
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)

## Project Structure

```
src/
  components/     # Reusable UI components
  pages/          # Route pages
  pages/admin/    # Admin dashboard pages
  layouts/        # Page layouts
  hooks/          # Custom hooks
  contexts/       # React contexts (auth, cart)
  routes/         # Router configuration
  services/       # Supabase API services
  types/          # TypeScript types
  lib/            # Utilities (cart, promotions, format)
supabase/
  schema.sql      # Database schema + RLS + seeds
  storage.sql     # Storage bucket policies
```
