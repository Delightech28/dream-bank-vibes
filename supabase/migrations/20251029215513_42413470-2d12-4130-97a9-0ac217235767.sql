-- First, ensure all existing users have wallets
INSERT INTO public.wallets (user_id, balance, currency)
SELECT id, 0.00, 'NGN'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.wallets)
ON CONFLICT DO NOTHING;

-- Add account_number column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_number text UNIQUE;

-- Create function to generate account number
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update existing profiles with account numbers
UPDATE public.profiles
SET account_number = public.generate_account_number()
WHERE account_number IS NULL;

-- Update trigger to include account number generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name, account_number)
  VALUES (
    gen_random_uuid(), 
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    public.generate_account_number()
  );
  RETURN NEW;
END;
$$;