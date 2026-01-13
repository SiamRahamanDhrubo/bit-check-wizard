-- Drop the security definer view and use a function instead
DROP VIEW IF EXISTS public.code_validation;

-- Create a secure function to validate codes (returns only non-sensitive data)
CREATE OR REPLACE FUNCTION public.validate_code(code_input TEXT)
RETURNS TABLE (
  id UUID,
  app_type TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  max_uses INTEGER,
  current_uses INTEGER,
  is_valid BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
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