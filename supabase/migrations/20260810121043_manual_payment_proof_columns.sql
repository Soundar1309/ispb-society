-- Migration: Add manual payment proof and notes columns to orders table
-- These columns support the admin manual payment approval flow with audit trail

ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS manual_payment_notes TEXT,
  ADD COLUMN IF NOT EXISTS manual_payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS manual_marked_by TEXT;

-- Also store proof notes in payment_tracking when manual
COMMENT ON COLUMN public.orders.manual_payment_notes IS 'Admin reason for manually marking this payment as paid';
COMMENT ON COLUMN public.orders.manual_payment_proof_url IS 'URL to uploaded payment proof file in payment-proofs storage bucket';
COMMENT ON COLUMN public.orders.manual_marked_by IS 'Admin user_id or email who manually approved this payment';
