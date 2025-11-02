-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to generate encryption key from a secret
CREATE OR REPLACE FUNCTION public.get_encryption_key()
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use a fixed key for deterministic encryption (in production, use a proper key management system)
  RETURN digest('payvance-encryption-key-2024', 'sha256');
END;
$$;

-- Create encrypted columns for BVN and NIN
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bvn_encrypted bytea,
ADD COLUMN IF NOT EXISTS nin_encrypted bytea;

-- Migrate existing data to encrypted columns using pgcrypto
UPDATE public.profiles 
SET bvn_encrypted = CASE 
  WHEN bvn IS NOT NULL AND bvn != '' THEN pgp_sym_encrypt(bvn, encode(public.get_encryption_key(), 'hex'))
  ELSE NULL
END,
nin_encrypted = CASE 
  WHEN nin IS NOT NULL AND nin != '' THEN pgp_sym_encrypt(nin, encode(public.get_encryption_key(), 'hex'))
  ELSE NULL
END
WHERE bvn IS NOT NULL OR nin IS NOT NULL;

-- Drop old unencrypted columns
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS bvn CASCADE,
DROP COLUMN IF EXISTS nin CASCADE;

-- Rename encrypted columns to original names
ALTER TABLE public.profiles 
RENAME COLUMN bvn_encrypted TO bvn;

ALTER TABLE public.profiles 
RENAME COLUMN nin_encrypted TO nin;

-- Add DELETE policy for users to remove their own profiles
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);