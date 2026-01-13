-- Fix permissive INSERT policy - require a valid code_id that hasn't exceeded max uses
DROP POLICY "Public can redeem codes" ON public.code_redemptions;

CREATE POLICY "Public can redeem valid codes" 
ON public.code_redemptions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.redemption_codes rc
    WHERE rc.id = code_id
    AND rc.is_active = true
    AND rc.current_uses < rc.max_uses
    AND (rc.expiry_year > EXTRACT(YEAR FROM NOW()) 
         OR (rc.expiry_year = EXTRACT(YEAR FROM NOW()) 
             AND rc.expiry_month >= EXTRACT(MONTH FROM NOW())))
  )
);