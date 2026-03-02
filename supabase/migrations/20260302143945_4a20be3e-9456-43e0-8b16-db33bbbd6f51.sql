
-- Create the missing trigger to increment code usage on redemption
CREATE TRIGGER on_code_redemption
  AFTER INSERT ON public.code_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_code_usage();
