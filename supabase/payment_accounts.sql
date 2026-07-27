-- Run this in the Supabase SQL editor.
-- Per-pharmacy payment destinations (Telebirr / CBE) shown at POS checkout,
-- plus the RLS needed for pharmacy_settings (inventory rules) and self-profile
-- edits from the Profile page.

CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('telebirr', 'cbe')),
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS payment_accounts_pharmacy_idx
  ON payment_accounts (pharmacy_id, provider) WHERE is_active;

GRANT SELECT, INSERT, UPDATE, DELETE ON payment_accounts TO authenticated;
GRANT ALL ON payment_accounts TO service_role;

ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;

-- Helper: the caller's pharmacy (security definer avoids recursive RLS).
CREATE OR REPLACE FUNCTION public.current_pharmacy_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pharmacy_id FROM public.users WHERE id = auth.uid()
$$;

DROP POLICY IF EXISTS "tenant reads own payment accounts" ON payment_accounts;
CREATE POLICY "tenant reads own payment accounts" ON payment_accounts
  FOR SELECT TO authenticated
  USING (pharmacy_id = public.current_pharmacy_id());

DROP POLICY IF EXISTS "owner manages payment accounts" ON payment_accounts;
CREATE POLICY "owner manages payment accounts" ON payment_accounts
  FOR ALL TO authenticated
  USING (
    pharmacy_id = public.current_pharmacy_id()
    AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'owner')
  )
  WITH CHECK (
    pharmacy_id = public.current_pharmacy_id()
    AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'owner')
  );

-- ---------- Inventory rules (pharmacy_settings) ----------
GRANT SELECT, INSERT, UPDATE ON pharmacy_settings TO authenticated;
GRANT ALL ON pharmacy_settings TO service_role;
ALTER TABLE pharmacy_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant reads own settings" ON pharmacy_settings;
CREATE POLICY "tenant reads own settings" ON pharmacy_settings
  FOR SELECT TO authenticated
  USING (pharmacy_id = public.current_pharmacy_id());

DROP POLICY IF EXISTS "owner writes own settings" ON pharmacy_settings;
CREATE POLICY "owner writes own settings" ON pharmacy_settings
  FOR ALL TO authenticated
  USING (
    pharmacy_id = public.current_pharmacy_id()
    AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'owner')
  )
  WITH CHECK (
    pharmacy_id = public.current_pharmacy_id()
    AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'owner')
  );

-- ---------- Self-service profile edits ----------
DROP POLICY IF EXISTS "user updates own profile" ON users;
CREATE POLICY "user updates own profile" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
