-- ==========================================================
-- Platform owner access + tenant provisioning policies
-- Run this in the Supabase SQL editor.
--
-- Without a SELECT policy on platform_admins, RLS silently hides the row,
-- so login falls through to the `users` check and shows
-- "We couldn't find an account record for you."
-- ==========================================================

-- Helper: is the current auth user an active platform owner?
CREATE OR REPLACE FUNCTION public.is_platform_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE id = _user_id
      AND role = 'platform_owner'
      AND is_active IS DISTINCT FROM false
  );
$$;

-- ---------- platform_admins ----------
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read own record" ON public.platform_admins;
CREATE POLICY "Admins read own record"
ON public.platform_admins FOR SELECT
TO authenticated
USING (id = auth.uid());

-- ---------- pharmacies ----------
GRANT SELECT, INSERT, UPDATE ON public.pharmacies TO authenticated;
GRANT ALL ON public.pharmacies TO service_role;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform owners create pharmacies" ON public.pharmacies;
CREATE POLICY "Platform owners create pharmacies"
ON public.pharmacies FOR INSERT
TO authenticated
WITH CHECK (public.is_platform_owner(auth.uid()));

DROP POLICY IF EXISTS "Members read their pharmacy" ON public.pharmacies;
CREATE POLICY "Members read their pharmacy"
ON public.pharmacies FOR SELECT
TO authenticated
USING (
  public.is_platform_owner(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.pharmacy_id = pharmacies.id
  )
);

-- ---------- users (tenant staff) ----------
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own user row" ON public.users;
CREATE POLICY "Read own user row"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_platform_owner(auth.uid()));

DROP POLICY IF EXISTS "Platform owners provision owners" ON public.users;
CREATE POLICY "Platform owners provision owners"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (public.is_platform_owner(auth.uid()));
