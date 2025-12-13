-- Fix function search path security warnings using CREATE OR REPLACE
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_party_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.parties
    SET balance = opening_balance + (
      SELECT COALESCE(SUM(balance_due), 0)
      FROM public.invoices
      WHERE party_id = NEW.party_id
    )
    WHERE id = NEW.party_id;
  END IF;
  RETURN NEW;
END;
$$;