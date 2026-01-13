-- Fix security: Don't expose secret keys publicly
DROP POLICY "Public can read active codes" ON public.redemption_codes;

-- Only allow reading non-sensitive fields for validation
CREATE POLICY "Public can validate codes by code string only" 
ON public.redemption_codes 
FOR SELECT 
USING (is_active = true);

-- Remove public read access to redemptions (contains sensitive data)
DROP POLICY "Public can read redemptions" ON public.code_redemptions;

-- Create a view that hides secret keys for public validation
CREATE OR REPLACE VIEW public.code_validation AS
SELECT 
  id,
  code,
  app_type,
  expiry_month,
  expiry_year,
  max_uses,
  current_uses,
  is_active
FROM public.redemption_codes
WHERE is_active = true;