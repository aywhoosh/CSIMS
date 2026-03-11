# CSIMS - Setup & Running Guide

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([download](https://nodejs.org/))
- A **Supabase** account ([sign up free](https://supabase.com/))
- **Git** installed (for cloning)

---

## Step 1: Clone & Install

```bash
git clone https://github.com/aywhoosh/CSIMS.git
cd CSIMS
npm install
```

This installs all dependencies (Next.js, shadcn/ui, Supabase client, Recharts, React Hook Form, etc.).

---

## Step 2: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose an organization, name your project (e.g., `csims`), set a database password, and pick a region
4. Wait for the project to finish provisioning (takes ~1 minute)

### Get your credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar) > **API**
2. Copy these two values:
   - **Project URL** (looks like `https://abcdefghij.supabase.co`)
   - **anon public** key (a long `eyJ...` string under "Project API keys")

---

## Step 3: Configure Environment Variables

Create a file called `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-full-anon-key
```

Replace the values with the ones you copied from Step 2.

---

## Step 4: Set Up the Database

You need to run 4 SQL migration files in order. Each one builds on the previous.

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Run each file **one at a time, in this exact order**:

| Order | File | What it does |
|-------|------|--------------|
| 1st | `supabase/migrations/20260308000001_create_enums.sql` | Creates enums (user_role, transaction_type, po_status, etc.) |
| 2nd | `supabase/migrations/20260308000002_create_tables.sql` | Creates all 13 tables (sites, profiles, inventory_items, etc.) |
| 3rd | `supabase/migrations/20260308000003_create_functions_triggers.sql` | Creates triggers for auto stock updates, PO status transitions, payment tracking |
| 4th | `supabase/migrations/20260308000004_create_rls_policies.sql` | Creates Row Level Security policies for role-based access |

**How to run each file:**
- Open the file from the `supabase/migrations/` folder in any text editor
- Copy the entire contents
- Paste it into the Supabase SQL Editor
- Click **Run** (or press Ctrl+Enter)
- Verify it says "Success. No rows returned" (this is normal for DDL statements)
- Repeat for the next file

### Load Sample Data (Optional but Recommended)

After all 4 migrations are done, run the seed file:

- Open `supabase/seed.sql`, copy its contents into the SQL Editor, and run it
- This creates demo data: 2 construction sites, 5 suppliers, 20 inventory items, 12 categories, and 6 storage locations

---

## Step 5: Create Your First User

CSIMS uses Supabase Auth for login. You need to create at least one user:

1. In your Supabase dashboard, go to **Authentication** (in the left sidebar)
2. Click **Users** tab, then **Add user** > **Create new user**
3. Enter an email and password
4. Click **Create user**

A profile row is automatically created by a database trigger. To set the user's role:

1. Go to **Table Editor** in the left sidebar
2. Open the **profiles** table
3. Find your new user's row
4. Edit the **role** column - set it to one of:
   - `admin` - Full access to everything
   - `site_manager` - Access scoped to their assigned site
   - `store_keeper` - Inventory and transaction access for their site
5. If the role is `site_manager` or `store_keeper`, also set the **site_id** column to assign them to a site (use a site ID from the `sites` table)

---

## Step 6: Run the App

```bash
npm run dev
```

Open your browser and go to:

```
http://localhost:3000
```

You will be redirected to the **login page**. Sign in with the email and password you created in Step 5.

After logging in, you land on the **Dashboard**.

---

## Navigating the Application

### Sidebar Navigation

The left sidebar provides access to all modules:

| Menu Item | URL | What you can do |
|-----------|-----|-----------------|
| **Dashboard** | `/dashboard` | View KPI cards, charts (stock levels, transaction trends, category distribution), recent activity, and low stock alerts |
| **Inventory** | `/inventory` | Browse all materials, search/sort/filter. Click an item to see details. Add new materials via "Add Item" button |
| **Transactions** | `/transactions` | View all stock movements. Two action buttons: "Record Inward" (material received) and "Record Outward" (material issued) |
| **Suppliers** | `/suppliers` | Manage vendor directory with contact, tax, address, and bank details |
| **Purchase Orders** | `/purchase-orders` | Create and track POs with line items. POs go through: Draft -> Sent -> Partially Received -> Received |
| **Invoices** | `/invoices` | Record supplier invoices and track payment status. Click an invoice to record payments against it |
| **Stock Audits** | `/audits` | Physical stock verification. System auto-calculates variance between system and physical quantities |
| **Alerts** | `/alerts` | Three tabs: Low Stock, Out of Stock, Reorder Suggestions |
| **Settings** | `/settings` | View your profile (name, email, role) |

### Common Workflows

#### Receiving Materials (Inward Transaction)

1. Go to **Transactions** > click **Record Inward**
2. Select the material, enter quantity, rejected quantity (if any), unit price
3. Optionally link to a Purchase Order and enter challan/vehicle numbers
4. Submit - stock is automatically updated

#### Issuing Materials (Outward Transaction)

1. Go to **Transactions** > click **Record Outward**
2. Select the material (current stock is shown next to each item)
3. Enter quantity, who it was issued to, and purpose
4. Submit - stock is automatically reduced (system prevents negative stock)

#### Creating a Purchase Order

1. Go to **Purchase Orders** > click **Create PO**
2. Select supplier, site, dates
3. Add line items: select material, quantity, unit price, tax %
4. Totals are auto-calculated as you type
5. After creating, use "Send to Supplier" to update status

#### Recording an Invoice & Payment

1. Go to **Invoices** > click **Create Invoice**
2. Fill in invoice number, supplier, amounts, due date
3. After creating, click the invoice to view details
4. Click **Record Payment** to log partial or full payments
5. Invoice status auto-updates: Pending -> Partially Paid -> Paid

#### Running a Stock Audit

1. Go to **Stock Audits** > click **New Audit**
2. Select a site (items filter to that site)
3. Add items, system quantity is auto-filled from database
4. Enter physical count - variance is calculated live
5. Add variance reasons where needed
6. Submit, then mark as "Reviewed" when done

---

## Building for Production

```bash
npm run build
npm start
```

The production build runs on `http://localhost:3000` by default.

### Deploy to Vercel (Optional)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com/) and import the repository
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel's project settings
4. Deploy

---

## Project Structure (Quick Reference)

```
CSIMS/
├── supabase/
│   ├── migrations/           # 4 SQL files (run in order)
│   └── seed.sql              # Demo data
├── src/
│   ├── app/
│   │   ├── (auth)/login/     # Login page
│   │   ├── (dashboard)/      # All authenticated pages
│   │   │   ├── dashboard/    # KPI dashboard
│   │   │   ├── inventory/    # List, detail, create, edit
│   │   │   ├── transactions/ # List, inward/new, outward/new
│   │   │   ├── suppliers/    # List, detail, create, edit
│   │   │   ├── purchase-orders/
│   │   │   ├── invoices/     # List, detail, create
│   │   │   ├── audits/       # List, detail, create
│   │   │   ├── alerts/       # Low stock / out of stock
│   │   │   └── settings/     # Profile view
│   │   ├── layout.tsx        # Root layout
│   │   ├── loading.tsx       # Global loading spinner
│   │   └── not-found.tsx     # 404 page
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (button, card, dialog, etc.)
│   │   ├── layout/           # Sidebar, TopBar, MobileNav
│   │   ├── shared/           # DataTable, PageHeader, StatusBadge, etc.
│   │   ├── dashboard/        # Charts and widgets
│   │   └── [module]/         # Module-specific columns, forms, details
│   └── lib/
│       ├── supabase/         # Client & server Supabase utilities
│       ├── types/            # TypeScript interfaces
│       ├── validations/      # Zod form schemas
│       ├── actions/          # Server actions (create, update, delete)
│       ├── queries/          # Data fetching functions
│       ├── hooks/            # Custom React hooks
│       ├── utils.ts          # formatCurrency, formatDate, cn()
│       └── constants.ts      # Nav items, units, status colors
├── .env.example              # Template for environment variables
├── package.json
└── README.md
```

---

## Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack (hot reload) |
| `npm run build` | Create optimized production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Troubleshooting

### "Module not found" errors
Run `npm install` again to ensure all dependencies are installed.

### Login redirects back to login page
- Check that your `.env.local` file exists and has the correct Supabase URL and anon key
- Make sure the Supabase project is active (not paused - free tier projects pause after inactivity)
- Verify you created a user in the Supabase Auth dashboard

### Empty dashboard / no data showing
- Make sure you ran all 4 migration files in order
- Run `seed.sql` to load sample data
- Check that your user has the correct role set in the `profiles` table

### RLS policy errors / "permission denied"
- Admin users should have `role = 'admin'` in the `profiles` table
- Site Manager and Store Keeper users must have a `site_id` assigned
- Check the `profiles` table to verify your user's role and site assignment

### Database trigger errors
- If stock goes negative during an outward transaction, the trigger blocks it intentionally
- Make sure the trigger functions migration (`20260308000003`) ran successfully

### "Middleware" deprecation warning
The warning `The "middleware" file convention is deprecated` is a Next.js 16 notice. It does not affect functionality. The middleware works correctly.
