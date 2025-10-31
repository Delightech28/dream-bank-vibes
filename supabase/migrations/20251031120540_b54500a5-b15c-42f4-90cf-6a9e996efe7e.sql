-- Add theme preference column to profiles table
ALTER TABLE public.profiles ADD COLUMN theme text DEFAULT 'dark' CHECK (theme IN ('light', 'dark'));