-- Fix search_path for generate_account_number function
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_account_number text;
  account_exists boolean;
BEGIN
  LOOP
    -- Generate 10-digit account number starting with 70 (Delighto prefix)
    new_account_number := '70' || LPAD(FLOOR(RANDOM() * 100000000)::text, 8, '0');
    
    -- Check if account number already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE account_number = new_account_number)
    INTO account_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT account_exists;
  END LOOP;
  
  RETURN new_account_number;
END;
$$;