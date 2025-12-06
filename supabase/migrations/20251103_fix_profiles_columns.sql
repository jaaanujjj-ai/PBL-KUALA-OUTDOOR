-- Fix missing columns in profiles table
-- Run this SQL in Supabase SQL Editor

-- Add all missing columns if they don't exist
DO $$ 
BEGIN
    -- Add identity_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='identity_type'
    ) THEN
        ALTER TABLE profiles ADD COLUMN identity_type VARCHAR(10);
        ALTER TABLE profiles ADD CONSTRAINT check_identity_type 
            CHECK (identity_type IN ('NIK', 'KTP', 'SIM'));
    END IF;

    -- Add identity_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='identity_number'
    ) THEN
        ALTER TABLE profiles ADD COLUMN identity_number VARCHAR(16);
    END IF;

    -- Add birth_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='birth_date'
    ) THEN
        ALTER TABLE profiles ADD COLUMN birth_date DATE;
    END IF;

    -- Add gender column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='gender'
    ) THEN
        ALTER TABLE profiles ADD COLUMN gender VARCHAR(20);
        ALTER TABLE profiles ADD CONSTRAINT check_gender 
            CHECK (gender IN ('Laki-laki', 'Perempuan'));
    END IF;

    -- Add phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(13);
    END IF;

    -- Add address column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='address'
    ) THEN
        ALTER TABLE profiles ADD COLUMN address TEXT;
    END IF;

    -- Add profile_picture column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='profile_picture'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_picture VARCHAR(255);
    END IF;

    -- Add is_complete column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='is_complete'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_complete BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add comments to document the columns
COMMENT ON COLUMN profiles.identity_type IS 'Type of identification: NIK, KTP, or SIM';
COMMENT ON COLUMN profiles.identity_number IS 'ID number: 16 digits for KTP/NIK, 12 digits for SIM';
COMMENT ON COLUMN profiles.birth_date IS 'User date of birth';
COMMENT ON COLUMN profiles.gender IS 'User gender: Laki-laki or Perempuan';
COMMENT ON COLUMN profiles.phone IS 'Phone/WhatsApp number (10-13 digits)';
COMMENT ON COLUMN profiles.address IS 'Full address of user';
COMMENT ON COLUMN profiles.profile_picture IS 'URL or path to user profile photo';
COMMENT ON COLUMN profiles.is_complete IS 'Flag to indicate if profile is complete';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_identity_number ON profiles(identity_number);
CREATE INDEX IF NOT EXISTS idx_profiles_is_complete ON profiles(is_complete);

-- Create or replace function to check if profile is complete
CREATE OR REPLACE FUNCTION check_profile_complete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_complete := (
        NEW.full_name IS NOT NULL AND
        NEW.identity_type IS NOT NULL AND
        NEW.identity_number IS NOT NULL AND
        NEW.birth_date IS NOT NULL AND
        NEW.gender IS NOT NULL AND
        NEW.phone IS NOT NULL AND
        NEW.address IS NOT NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_check_profile_complete ON profiles;
CREATE TRIGGER trigger_check_profile_complete
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_profile_complete();

-- Show success message
DO $$
BEGIN
    RAISE NOTICE 'All profile columns have been added successfully!';
END $$;
