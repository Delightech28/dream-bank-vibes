-- Add virtual account fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS virtual_account_number text,
ADD COLUMN IF NOT EXISTS virtual_account_bank text,
ADD COLUMN IF NOT EXISTS virtual_account_name text;