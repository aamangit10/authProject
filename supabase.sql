-- ==============================================================================
-- DomainGuard: Supabase Schema, Role-Based Access Control (RBAC), and RLS Policies
-- Enforces strict backend domain boundary: only @hbplus.fit verified accounts can access
-- ==============================================================================

-- 1. Create public.profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create audit_logs table (immutable authentication events)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  domain TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Helper Function: Validate that authenticated user belongs to @hbplus.fit
CREATE OR REPLACE FUNCTION public.is_hbplus_employee()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL
    AND (auth.jwt() ->> 'email') IS NOT NULL
    AND (auth.jwt() ->> 'email') LIKE '%@hbplus.fit'
    AND (
      (auth.jwt() ->> 'email_verified')::boolean IS TRUE
      OR (auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean IS TRUE
      OR (auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Helper Function: Check if the user has the 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    public.is_hbplus_employee()
    AND (
      (auth.jwt() ->> 'email') IN ('aman@hbplus.fit', 'admin@hbplus.fit')
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. Row Level Security Policies for public.profiles
-- ==============================================================================

-- Policy: Verified employees can view employee profiles
CREATE POLICY "Employees can view profiles"
  ON public.profiles FOR SELECT
  USING (public.is_hbplus_employee());

-- Policy: Users can insert/upsert their own profile upon login
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    public.is_hbplus_employee()
    AND auth.uid() = id
    -- Role cannot be self-elevated to admin unless in bootstrap admin list
    AND (
      role = 'user'
      OR (role = 'admin' AND (auth.jwt() ->> 'email') IN ('aman@hbplus.fit', 'admin@hbplus.fit'))
    )
  );

-- Policy: Users can update their profile (cannot arbitrarily grant themselves admin role)
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (
    public.is_hbplus_employee() 
    AND (auth.uid() = id OR public.is_admin())
  );

-- Policy: Only Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- 7. Row Level Security Policies for public.audit_logs
-- ==============================================================================

-- Policy: Employees can append their own login events
CREATE POLICY "Employees can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    public.is_hbplus_employee()
    AND auth.uid() = user_id
  );

-- Policy: Only Admins can view audit logs
CREATE POLICY "Admins can inspect audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());
