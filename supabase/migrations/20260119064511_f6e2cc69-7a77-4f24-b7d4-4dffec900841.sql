-- Fix security issues:
-- 1. Block direct SELECT on redemption_codes to prevent secret key exposure
-- 2. Block direct INSERT on redemption_codes (will use edge function)
-- 3. Block SELECT on code_redemptions to protect tracking data

-- Drop existing SELECT policy that exposes secret keys
DROP POLICY IF EXISTS "Public can validate codes by code string only" ON public.redemption_codes;

-- Create policy that blocks ALL direct SELECT access to redemption_codes
-- The validate_code function uses SECURITY DEFINER so it can still access the table
CREATE POLICY "Block direct SELECT access to redemption_codes"
ON public.redemption_codes
FOR SELECT
USING (false);

-- Block all INSERT operations on redemption_codes (will only allow via edge function with service role)
CREATE POLICY "Block direct INSERT on redemption_codes"
ON public.redemption_codes
FOR INSERT
WITH CHECK (false);

-- Block all UPDATE operations
CREATE POLICY "Block direct UPDATE on redemption_codes"
ON public.redemption_codes
FOR UPDATE
USING (false);

-- Block all DELETE operations
CREATE POLICY "Block direct DELETE on redemption_codes"
ON public.redemption_codes
FOR DELETE
USING (false);

-- Add SELECT policy on code_redemptions to block public access to tracking data
CREATE POLICY "Block SELECT access to code_redemptions"
ON public.code_redemptions
FOR SELECT
USING (false);

-- Update the validate_code function to use SECURITY DEFINER to bypass RLS
-- This is the ONLY way to validate codes - not direct table access
CREATE OR REPLACE FUNCTION public.validate_code(code_input text)
RETURNS TABLE(id uuid, app_type text, expiry_month integer, expiry_year integer, max_uses integer, current_uses integer, is_valid boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    rc.id,
    rc.app_type,
    rc.expiry_month,
    rc.expiry_year,
    rc.max_uses,
    rc.current_uses,
    (rc.is_active = true 
     AND rc.current_uses < rc.max_uses
     AND (rc.expiry_year > EXTRACT(YEAR FROM NOW())::INTEGER
          OR (rc.expiry_year = EXTRACT(YEAR FROM NOW())::INTEGER 
              AND rc.expiry_month >= EXTRACT(MONTH FROM NOW())::INTEGER))) as is_valid
  FROM public.redemption_codes rc
  WHERE rc.code = code_input
  AND rc.is_active = true
$$;