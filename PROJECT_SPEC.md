# Clothing Store Portal - Complete Project Specification

## Goal

Build a simple clothing e-commerce application with:

* Product catalog
* Shopping cart
* Guest checkout
* Optional customer accounts
* Customer spending tracking
* Dynamic loyalty and promotion system
* Admin dashboard for products, orders, customers, and promotions

The application must be production-ready and fully functional after configuring Supabase environment variables.

---

# Tech Stack

## Frontend

* Vite
* React
* TypeScript
* React Router
* TailwindCSS
* TanStack Query
* React Hook Form
* Zod

## Backend

* Supabase

Services:

* PostgreSQL
* Auth
* Storage
* Row Level Security

---

# User Roles

## Guest

Can:

* Browse products
* View product details
* Add items to cart
* Checkout without login

Cannot:

* Access admin pages
* View order history

---

## Registered Customer

Can:

* Everything guests can do
* Login/Register
* Save profile information
* View order history
* Receive promotional discounts

---

## Super Admin

Can:

* Manage products
* Manage orders
* Manage customers
* Manage promotions
* Access analytics dashboard

Only users present in the admins table are admins.

---

# Core Features

## Product Catalog

Homepage displays products in a responsive grid.

Each product shows:

* Image
* Name
* Price

Clicking a product opens details page.

---

## Product Details

Display:

* Image gallery
* Product name
* Description
* Price
* Available colors
* Available sizes

User can:

* Select color
* Select size
* Select quantity
* Add to cart

---

## Shopping Cart

Stored in localStorage.

Cart item contains:

* Product ID
* Product Name
* Image
* Selected Color
* Selected Size
* Quantity
* Unit Price

Features:

* Update quantity
* Remove item
* View subtotal
* Checkout

---

## Checkout

Guest checkout allowed.

Required fields:

* Full Name
* Phone Number
* Address

If logged in:

* Auto-fill profile information

Checkout creates:

* Order
* Order Items

After successful order:

* Cart cleared
* Success message displayed

---

# Customer System

Customers should be tracked even if they never create an account.

Phone number is the primary identifier.

When an order is submitted:

* Check if customer exists by phone
* If not, create customer
* Update spending statistics

---

## Customer Statistics

Track:

* Total Orders
* Lifetime Spending
* Last Order Date

Example:

Customer: John Doe

Orders: 5

Spent: $240

---

# Loyalty & Promotion Engine

Promotions must be database-driven.

No promotion should be hardcoded.

Admin can create and manage promotions without code changes.

Examples:

* 10% off first order
* $10 off after spending $100
* 5% off orders above $50

---

## First Order Discount

Requirement:

If user creates an account and places their first order:

* Automatically receive 10% discount

This rule should be implemented as a promotion record.

Not hardcoded.

---

# Admin Dashboard

Route:

/admin

Protected route.

Only admins may access.

---

## Dashboard Analytics

Display:

* Total Products
* Total Orders
* Total Revenue
* Pending Orders
* Total Customers

---

## Product Management

CRUD operations.

Fields:

* Name
* Description
* Price
* Images
* Colors
* Sizes
* Active

Admin can:

* Create product
* Edit product
* Delete product
* Activate/deactivate product

---

## Order Management

Statuses:

* Pending
* Completed
* Rejected

Admin can:

* Change status
* View customer information
* View purchased items

---

## Customer Management

Admin can:

* Search customers
* View customer profile
* View order history
* View total spending
* View total orders

---

## Promotion Management

Admin can:

* Create promotion
* Edit promotion
* Disable promotion

---

# Database Schema

## profiles

```sql
create table profiles (
    id uuid primary key references auth.users(id),

    full_name text,
    phone text,
    address text,

    created_at timestamptz default now()
);
```

## admins

```sql
create table admins (
    user_id uuid primary key references auth.users(id)
);
```

## customers

```sql
create table customers (
    id uuid primary key default gen_random_uuid(),

    user_id uuid unique null references auth.users(id),

    full_name text,

    phone text unique not null,

    total_orders integer default 0,

    total_spent numeric(10,2) default 0,

    last_order_at timestamptz,

    created_at timestamptz default now()
);
```

## products

Use JSON arrays to keep implementation simple.

```sql
create table products (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    description text,

    price numeric(10,2) not null,

    image_url text,

    colors jsonb default '[]',

    sizes jsonb default '[]',

    active boolean default true,

    created_at timestamptz default now()
);
```

Example:

```json
{
  "colors": ["Black", "White", "Blue"],
  "sizes": ["S", "M", "L", "XL"]
}
```

## orders

```sql
create table orders (
    id uuid primary key default gen_random_uuid(),

    customer_id uuid references customers(id),

    user_id uuid null references auth.users(id),

    customer_name text not null,

    phone text not null,

    address text not null,

    subtotal numeric(10,2),

    discount numeric(10,2),

    total_price numeric(10,2),

    status text default 'pending',

    created_at timestamptz default now()
);
```

## order_items

```sql
create table order_items (
    id uuid primary key default gen_random_uuid(),

    order_id uuid references orders(id) on delete cascade,

    product_id uuid references products(id),

    product_name text,

    color text,

    size text,

    quantity integer,

    unit_price numeric(10,2)
);
```

## promotions

```sql
create table promotions (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    active boolean default true,

    discount_type text not null,

    discount_value numeric(10,2),

    min_total_spent numeric(10,2),

    min_order_amount numeric(10,2),

    first_order_only boolean default false,

    registered_users_only boolean default false,

    created_at timestamptz default now()
);
```

---

# Promotion Examples

## Welcome Discount

```text
Name: Welcome Discount
Type: Percentage
Value: 10
First Order Only: true
Registered Users Only: true
```

---

## VIP Customer

```text
Name: VIP Reward
Type: Fixed Amount
Value: 10
Minimum Lifetime Spending: 100
```

---

## Large Order Discount

```text
Name: Big Cart
Type: Percentage
Value: 5
Minimum Order Amount: 50
```

---

# Storage

Create Supabase bucket:

product-images

Public bucket.

Store product images here.

---

# Pages

## Public

* /
* /product/:id
* /cart
* /checkout
* /login
* /register

## Customer

* /profile
* /orders

## Admin

* /admin
* /admin/products
* /admin/orders
* /admin/orders/:id
* /admin/customers
* /admin/promotions

---

# Folder Structure

```text
src/

components/
pages/
layouts/
hooks/
contexts/
routes/
services/
types/
lib/

pages/admin/
```

---

# Required Libraries

```bash
npm install

@supabase/supabase-js
@tanstack/react-query
react-router-dom
react-hook-form
zod
@hookform/resolvers
tailwindcss
```

---

# Supabase Setup

1. Create Supabase project
2. Enable Email/Password authentication
3. Create storage bucket: product-images
4. Execute all SQL schema
5. Configure RLS policies
6. Create first admin account
7. Insert admin user ID into admins table

Example:

```sql
insert into admins(user_id)
values('ADMIN_USER_UUID');
```

---

# Deliverables

Build a complete application including:

* Supabase integration
* Authentication
* Product catalog
* Product details page
* Shopping cart
* Guest checkout
* Customer tracking
* Loyalty system
* Promotion engine
* Admin dashboard
* Product management
* Order management
* Customer management
* Promotion management
* Responsive mobile-first UI

The application should run with:

```bash
npm install
npm run dev
```

after only providing:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
