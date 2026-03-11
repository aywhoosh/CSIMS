-- CSIMS Database Schema: Enum Types
-- Construction Site Inventory Management System

CREATE TYPE public.user_role AS ENUM ('admin', 'site_manager', 'store_keeper');
CREATE TYPE public.transaction_type AS ENUM ('inward', 'outward');
CREATE TYPE public.po_status AS ENUM ('draft', 'sent', 'partially_received', 'received', 'cancelled');
CREATE TYPE public.invoice_status AS ENUM ('pending', 'partially_paid', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash', 'cheque', 'bank_transfer', 'upi', 'other');
CREATE TYPE public.audit_status AS ENUM ('in_progress', 'completed', 'reviewed');
