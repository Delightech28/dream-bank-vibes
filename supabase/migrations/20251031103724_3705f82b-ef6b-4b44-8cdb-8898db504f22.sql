-- Add NIN column to profiles table for permanent virtual accounts
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nin text;

-- Add column to track if account is permanent
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_permanent_account boolean DEFAULT false;

-- Add check constraint for NIN format (11 digits)
ALTER TABLE public.profiles
ADD CONSTRAINT nin_format_check 
CHECK (nin IS NULL OR (nin ~ '^\d{11}$'));