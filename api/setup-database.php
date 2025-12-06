<?php
/**
 * Setup Database Columns
 * WARNING: This should only be run once!
 * Access: http://localhost/PBL-KELANA-OUTDOOR/api/setup-database.php
 */

header('Content-Type: application/json');

// Supabase credentials
$supabaseUrl = getenv('VITE_SUPABASE_URL') ?: 'YOUR_SUPABASE_URL';
$supabaseKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: 'YOUR_SERVICE_KEY';

// SQL to run
$sql = <<<SQL
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='identity_type') THEN
        ALTER TABLE profiles ADD COLUMN identity_type VARCHAR(10) CHECK (identity_type IN ('NIK', 'KTP', 'SIM'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='identity_number') THEN
        ALTER TABLE profiles ADD COLUMN identity_number VARCHAR(16);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='birth_date') THEN
        ALTER TABLE profiles ADD COLUMN birth_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='gender') THEN
        ALTER TABLE profiles ADD COLUMN gender VARCHAR(20) CHECK (gender IN ('Laki-laki', 'Perempuan'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(13);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='address') THEN
        ALTER TABLE profiles ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='profile_picture') THEN
        ALTER TABLE profiles ADD COLUMN profile_picture VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_complete') THEN
        ALTER TABLE profiles ADD COLUMN is_complete BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_identity_number ON profiles(identity_number);

CREATE OR REPLACE FUNCTION check_profile_complete()
RETURNS TRIGGER AS \$\$
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
\$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_profile_complete ON profiles;
CREATE TRIGGER trigger_check_profile_complete
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_profile_complete();
SQL;

// Execute via Supabase REST API (PostgREST)
$ch = curl_init($supabaseUrl . '/rest/v1/rpc/exec_sql');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey
    ],
    CURLOPT_POSTFIELDS => json_encode(['sql' => $sql])
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo json_encode([
        'success' => true,
        'message' => 'Database setup completed successfully!'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Please run SQL manually in Supabase Dashboard',
        'file' => 'supabase/migrations/20251103_fix_profiles_columns.sql',
        'response' => $response
    ]);
}
?>
