-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    user_type TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create mothers table
CREATE TABLE IF NOT EXISTS mothers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    due_date DATE,
    blood_group TEXT,
    health_issues TEXT,
    pregnancy_stage TEXT,
    last_checkup_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    specialization TEXT,
    license_number TEXT,
    hospital TEXT,
    years_of_experience INTEGER,
    available_for_consultation BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create NGOs table
CREATE TABLE IF NOT EXISTS ngos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    organization_name TEXT,
    website TEXT,
    registration_number TEXT,
    focus_areas TEXT[],
    contact_person TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mother_id UUID REFERENCES mothers(id) NOT NULL,
    doctor_id UUID REFERENCES doctors(id),
    record_date DATE NOT NULL,
    record_type TEXT NOT NULL,
    description TEXT,
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mother_id UUID REFERENCES mothers(id) NOT NULL,
    doctor_id UUID REFERENCES doctors(id) NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled',
    purpose TEXT,
    notes TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mothers ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for anon and authenticated users

-- Allow all users to select from user_profiles
CREATE POLICY "Allow public read access to user_profiles" ON user_profiles
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Mothers table policies
CREATE POLICY "Allow public read access to mothers" ON mothers
    FOR SELECT USING (true);

CREATE POLICY "Mothers can insert their own data" ON mothers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mothers can update their own data" ON mothers
    FOR UPDATE USING (auth.uid() = user_id);

-- Doctors table policies
CREATE POLICY "Allow public read access to doctors" ON doctors
    FOR SELECT USING (true);

CREATE POLICY "Doctors can insert their own data" ON doctors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own data" ON doctors
    FOR UPDATE USING (auth.uid() = user_id);

-- NGOs table policies
CREATE POLICY "Allow public read access to NGOs" ON ngos
    FOR SELECT USING (true);

CREATE POLICY "NGOs can insert their own data" ON ngos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "NGOs can update their own data" ON ngos
    FOR UPDATE USING (auth.uid() = user_id);

-- Medical records policies (more restricted)
CREATE POLICY "Mothers can view their own medical records" ON medical_records
    FOR SELECT USING (EXISTS (SELECT 1 FROM mothers WHERE mothers.id = medical_records.mother_id AND mothers.user_id = auth.uid()));

CREATE POLICY "Doctors can view medical records they created" ON medical_records
    FOR SELECT USING (EXISTS (SELECT 1 FROM doctors WHERE doctors.id = medical_records.doctor_id AND doctors.user_id = auth.uid()));

-- Appointments policies
CREATE POLICY "Allow mothers to view their appointments" ON appointments
    FOR SELECT USING (EXISTS (SELECT 1 FROM mothers WHERE mothers.id = appointments.mother_id AND mothers.user_id = auth.uid()));

CREATE POLICY "Allow doctors to view their appointments" ON appointments
    FOR SELECT USING (EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid()));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER set_updated_at_user_profiles
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER set_updated_at_mothers
BEFORE UPDATE ON mothers
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER set_updated_at_doctors
BEFORE UPDATE ON doctors
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER set_updated_at_ngos
BEFORE UPDATE ON ngos
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER set_updated_at_medical_records
BEFORE UPDATE ON medical_records
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER set_updated_at_appointments
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Enable RLS on the user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Do the same for mothers, doctors, and ngos tables
ALTER TABLE mothers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own mother data" ON mothers;
CREATE POLICY "Users can manage own mother data" ON mothers
    USING (auth.uid() = user_id);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own doctor data" ON doctors;
CREATE POLICY "Users can manage own doctor data" ON doctors
    USING (auth.uid() = user_id);

ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own ngo data" ON ngos;
CREATE POLICY "Users can manage own ngo data" ON ngos
    USING (auth.uid() = user_id); 