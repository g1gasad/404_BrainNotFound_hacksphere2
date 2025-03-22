-- Schema for MaterCare app - Email verification version

-- Drop tables if they exist for a clean start
DROP TABLE IF EXISTS ngos;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS mothers;
DROP TABLE IF EXISTS user_profiles;

-- User profiles table (critical for email verification)
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    user_type TEXT CHECK (user_type IN ('mother', 'doctor', 'ngo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mothers table (minimal)
CREATE TABLE IF NOT EXISTS mothers (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table (minimal)
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NGOs table (minimal)
CREATE TABLE IF NOT EXISTS ngos (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles (email);

-- Disable Row Level Security to make queries simpler
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mothers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ngos DISABLE ROW LEVEL SECURITY;

-- Add a public read policy for anon users (even with RLS disabled)
DROP POLICY IF EXISTS "Public read access" ON user_profiles;
CREATE POLICY "Public read access" 
ON user_profiles
FOR SELECT
USING (true);

-- Create a function to check if a table exists (used for connection testing)
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$$; 