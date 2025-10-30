-- Add Flutterwave reference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS flutterwave_reference text;