
-- Drop the broken restrictive policies
DROP POLICY IF EXISTS "Public can redeem valid codes" ON public.code_redemptions;
DROP POLICY IF EXISTS "Block SELECT access to code_redemptions" ON public.code_redemptions;

-- Create a permissive INSERT policy so users can actually redeem codes
CREATE POLICY "Public can redeem valid codes"
ON public.code_redemptions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM redemption_codes rc
    WHERE rc.id = code_redemptions.code_id
      AND rc.is_active = true
      AND rc.current_uses < rc.max_uses
      AND (
        rc.expiry_year::numeric > EXTRACT(year FROM now())
        OR (
          rc.expiry_year::numeric = EXTRACT(year FROM now())
          AND rc.expiry_month::numeric >= EXTRACT(month FROM now())
        )
      )
  )
);
