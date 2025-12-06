/**
 * Script to setup database columns automatically
 * Run this once to add missing columns to profiles table
 * 
 * Usage: 
 * npm install -g tsx
 * tsx scripts/setup-database.ts
 */

import { createClient } from '@supabase/supabase-js';

// Get from .env or hardcode temporarily
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  const sql = `
    -- Add missing columns to profiles table
    DO $$ 
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='identity_type') THEN
            ALTER TABLE profiles ADD COLUMN identity_type VARCHAR(10) CHECK (identity_type IN ('NIK', 'KTP', 'SIM'));
            RAISE NOTICE 'Added column: identity_type';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='identity_number') THEN
            ALTER TABLE profiles ADD COLUMN identity_number VARCHAR(16);
            RAISE NOTICE 'Added column: identity_number';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='birth_date') THEN
            ALTER TABLE profiles ADD COLUMN birth_date DATE;
            RAISE NOTICE 'Added column: birth_date';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='gender') THEN
            ALTER TABLE profiles ADD COLUMN gender VARCHAR(20) CHECK (gender IN ('Laki-laki', 'Perempuan'));
            RAISE NOTICE 'Added column: gender';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
            ALTER TABLE profiles ADD COLUMN phone VARCHAR(13);
            RAISE NOTICE 'Added column: phone';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='address') THEN
            ALTER TABLE profiles ADD COLUMN address TEXT;
            RAISE NOTICE 'Added column: address';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='profile_picture') THEN
            ALTER TABLE profiles ADD COLUMN profile_picture VARCHAR(255);
            RAISE NOTICE 'Added column: profile_picture';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_complete') THEN
            ALTER TABLE profiles ADD COLUMN is_complete BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added column: is_complete';
        END IF;
    END $$;

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
    CREATE INDEX IF NOT EXISTS idx_profiles_identity_number ON profiles(identity_number);
    CREATE INDEX IF NOT EXISTS idx_profiles_is_complete ON profiles(is_complete);

    -- Create auto-complete function
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

    -- Create trigger
    DROP TRIGGER IF EXISTS trigger_check_profile_complete ON profiles;
    CREATE TRIGGER trigger_check_profile_complete
        BEFORE INSERT OR UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION check_profile_complete();
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error:', error.message);
      
      // Try alternative method using raw query
      console.log('⚠️  Trying alternative method...');
      const { error: altError } = await supabase
        .from('_migrations')
        .insert({ name: '20251103_fix_profiles_columns', executed_at: new Date().toISOString() });
      
      if (altError) {
        console.error('❌ Alternative method also failed:', altError.message);
        console.log('\n⚠️  Please run the SQL manually in Supabase Dashboard SQL Editor');
        console.log('📁 File: supabase/migrations/20251103_fix_profiles_columns.sql');
      }
    } else {
      console.log('✅ Database setup completed successfully!');
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
    console.log('\n⚠️  Please run the SQL manually in Supabase Dashboard SQL Editor');
    console.log('📁 File: supabase/migrations/20251103_fix_profiles_columns.sql');
  }
}

setupDatabase();
