# CSIMS - Construction Site Inventory Management System

A comprehensive construction site inventory management system built for **Blessing Homz Pvt Ltd** (subsidiary of **Fusion Limited**). Manages materials, stock movements, purchase orders, supplier invoices, payments, and stock audits across multiple construction sites.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router) + TypeScript |
| **UI** | Tailwind CSS v4 + shadcn/ui + Lucide Icons |
| **Backend/DB** | Supabase (PostgreSQL + Auth + RLS) |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Tables** | @tanstack/react-table |
| **Date Utils** | date-fns |
| **Notifications** | Sonner |
| **Deploy** | Vercel + Supabase Cloud |

## Features

### Core Modules
- **Dashboard** - KPI cards, stock level charts, transaction trends, category distribution, recent activity, low stock alerts
- **Inventory Management** - Material master with categories, sites, storage locations, stock levels, pricing
- **Inward/Outward Transactions** - Record material receipts and issues with full audit trail
- **Supplier Management** - Vendor directory with contact, tax, address, and bank details
- **Purchase Orders** - Create POs with line items, track status (Draft -> Sent -> Partially Received -> Received)
- **Invoice & Payment Tracking** - Record supplier invoices, track payments, auto-detect overdue
- **Stock Audits** - Physical stock verification with variance tracking and review workflow
- **Alerts** - Low stock, out of stock, and reorder suggestions

### System Features
- Role-based access control (Admin, Site Manager, Store Keeper)
- Row Level Security (RLS) on all tables
- Auto-generated document numbers (MAT-###, SUP-###, TXN-YYYYMMDD-###, PO-YYYYMM-###)
- Database triggers for automatic stock updates, PO status transitions, and payment tracking
- Responsive design with mobile navigation
- Branded UI with Fusion Limited corporate colors

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Installation

```bash
git clone https://github.com/aywhoosh/CSIMS.git
cd CSIMS
npm install
```

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the migration files in order:
   - `supabase/migrations/20260308000001_create_enums.sql`
   - `supabase/migrations/20260308000002_create_tables.sql`
   - `supabase/migrations/20260308000003_create_functions_triggers.sql`
   - `supabase/migrations/20260308000004_create_rls_policies.sql`
4. Optionally run `supabase/seed.sql` for sample data

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
CSIMS/
├── supabase/
│   ├── migrations/          # SQL schema & policies
│   └── seed.sql             # Sample data
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login page
│   │   ├── (dashboard)/     # All authenticated pages
│   │   │   ├── dashboard/   # KPI dashboard
│   │   │   ├── inventory/   # Materials CRUD
│   │   │   ├── transactions/# Inward/outward
│   │   │   ├── suppliers/   # Supplier CRUD
│   │   │   ├── purchase-orders/
│   │   │   ├── invoices/    # Invoice + payments
│   │   │   ├── audits/      # Stock audits
│   │   │   ├── alerts/      # Stock alerts
│   │   │   └── settings/    # Profile view
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── layout/          # Sidebar, TopBar, Nav
│   │   ├── shared/          # DataTable, KPI, etc.
│   │   ├── dashboard/       # Charts & widgets
│   │   ├── inventory/       # Inventory columns & form
│   │   ├── transactions/    # Inward/outward forms
│   │   ├── suppliers/       # Supplier columns & form
│   │   ├── purchase-orders/ # PO columns, form, detail
│   │   ├── invoices/        # Invoice columns, form, detail, payment
│   │   └── audits/          # Audit columns, form, detail
│   └── lib/
│       ├── supabase/        # Client & server utilities
│       ├── types/           # TypeScript interfaces
│       ├── validations/     # Zod schemas
│       ├── actions/         # Server actions
│       ├── queries/         # Data fetching
│       ├── hooks/           # Custom hooks
│       ├── utils.ts         # Utility functions
│       └── constants.ts     # App constants
```

## Database Schema

### Tables (13)
`sites`, `profiles`, `categories`, `storage_locations`, `suppliers`, `inventory_items`, `inventory_transactions`, `purchase_orders`, `purchase_order_items`, `invoices`, `payments`, `stock_audits`, `stock_audit_items`

### Enums (6)
`user_role`, `transaction_type`, `po_status`, `invoice_status`, `payment_method`, `audit_status`

### Key Triggers
- Stock auto-update on inward/outward transactions
- PO status auto-transition on material receipt
- Invoice status auto-update on payment recording
- Auto profile creation on user signup

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Full access to all modules and sites |
| **Site Manager** | Scoped to assigned site, can manage POs and invoices |
| **Store Keeper** | Scoped to assigned site, inventory and transaction access |

---

## Academic Information

### Abstract
CSIMS is a web-based Construction Site Inventory Management System designed for Blessing Homz Pvt Ltd (a subsidiary of Fusion Limited). The system addresses the challenges of manual inventory tracking at construction sites by providing a digital platform for material management, purchase order processing, supplier management, invoice tracking, and stock auditing. Built with modern web technologies (Next.js, Supabase, Tailwind CSS), it offers role-based access control, real-time stock tracking with automated alerts, and comprehensive reporting through an intuitive dashboard.

### Problem Statement
Construction sites face significant challenges in manual inventory management, including inaccurate stock records, delayed procurement, untracked material movements, and lack of real-time visibility into stock levels. These inefficiencies lead to project delays, cost overruns, material wastage, and difficulty in financial reconciliation with suppliers.

### Objectives
1. Develop a centralized digital inventory management system for construction materials
2. Implement real-time stock tracking with automated low-stock alerts
3. Streamline the procurement lifecycle from purchase orders to invoice payments
4. Enable stock auditing with automated variance detection
5. Provide role-based access control for different organizational levels
6. Generate actionable insights through dashboard analytics

### Scope and Limitations

**Scope:**
- Multi-site inventory management with material categorization
- Complete procurement cycle (PO creation, material receipt, invoice tracking, payment recording)
- Stock audit workflow with physical vs system quantity reconciliation
- Role-based access with row-level security
- Dashboard with KPIs, charts, and alerts

**Limitations:**
- No barcode/QR code scanning integration
- No automated email/SMS notifications
- Reports are viewed in-app only (no PDF/Excel export)
- Single organization deployment (no multi-tenancy)
- No mobile app (responsive web only)

### Future Enhancements
- Barcode/QR code integration for faster material scanning
- Automated email notifications for low stock and overdue invoices
- PDF report generation and export functionality
- Mobile application for on-site inventory management
- Integration with accounting software (Tally, QuickBooks)
- Advanced analytics with predictive demand forecasting
- Multi-organization support with tenant isolation
