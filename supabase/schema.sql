-- ====================================================================
-- SUPABASE DATABASE SCHEMA MIGRATION SCRIPT
-- Maghagha & El-Adwa Diocese University Youth Service Platform
-- "منصة الأمانة العامة لخدمة أسر الجامعات"
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Admin Users Table (حسابات المشرفين والأمانة والأسر)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  region_id TEXT,
  region_name TEXT,
  role TEXT NOT NULL, -- 'GENERAL_SECRETARIAT' | 'REGIONAL_ADMIN'
  coordinator_name TEXT,
  contact_phone TEXT,
  password_hash TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backward compatibility table for regional_accounts
CREATE TABLE IF NOT EXISTS regional_accounts (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL UNIQUE,
  region_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  coordinator_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Regional Families Table (جدول الأسر الإقليمية)
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL UNIQUE,
  region_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  coordinator_name TEXT,
  contact_phone TEXT,
  icon_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Students Table (جدول سجلات الطلاب والموقع الجغرافي)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  national_id TEXT,
  phone TEXT NOT NULL,
  region_id TEXT NOT NULL,
  university TEXT NOT NULL,
  faculty TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  housing_status TEXT NOT NULL,
  housing_details TEXT,
  housing_unit_id TEXT,
  church_parish TEXT,
  notes TEXT,
  registration_date DATE DEFAULT CURRENT_DATE,
  
  -- Geographic Classification Columns
  governorate TEXT,
  city_or_center TEXT,
  district_or_area TEXT,
  detailed_address TEXT,
  geo_cluster_id TEXT,
  geo_cluster_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_cluster_manual BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. External Housing Locations Table (السكنات الخارجية)
CREATE TABLE IF NOT EXISTS external_housing (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL,
  name TEXT NOT NULL,
  gender_type TEXT NOT NULL,
  address TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  current_occupancy INTEGER DEFAULT 0,
  supervisor_name TEXT NOT NULL,
  supervisor_phone TEXT NOT NULL,
  google_maps_url TEXT,
  coordinates TEXT,
  monthly_rent TEXT,
  amenities TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alias table for housing_locations
CREATE TABLE IF NOT EXISTS housing_locations (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL,
  name TEXT NOT NULL,
  gender_type TEXT NOT NULL,
  address TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  current_occupancy INTEGER DEFAULT 0,
  supervisor_name TEXT NOT NULL,
  supervisor_phone TEXT NOT NULL,
  google_maps_url TEXT,
  coordinates TEXT,
  monthly_rent TEXT,
  amenities TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Leadership Structure Table (الهيكل الإداري والقيادات والخدام)
CREATE TABLE IF NOT EXISTS leaderships (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'PRIEST' | 'SECTOR_LEADER' | 'FAMILY_SERVANT'
  role_title TEXT NOT NULL,
  region_id TEXT NOT NULL DEFAULT 'all',
  church_or_sector TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  priest_in_charge_id TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  appointed_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alias table for leadership_members
CREATE TABLE IF NOT EXISTS leadership_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  role_title TEXT NOT NULL,
  region_id TEXT NOT NULL DEFAULT 'all',
  church_or_sector TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  priest_in_charge_id TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  appointed_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Service Identity Config Table (هوية المنصة والرؤية والفوتر واللوجو)
CREATE TABLE IF NOT EXISTS service_identity (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  general_logo_url TEXT,
  family_logos JSONB DEFAULT '{}'::jsonb,
  vision TEXT,
  mission TEXT,
  goals JSONB DEFAULT '[]'::jsonb,
  contact_phones JSONB DEFAULT '[]'::jsonb,
  contact_email TEXT,
  address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_students_region ON students(region_id);
CREATE INDEX IF NOT EXISTS idx_students_faculty ON students(faculty);
CREATE INDEX IF NOT EXISTS idx_students_cluster ON students(geo_cluster_id);
CREATE INDEX IF NOT EXISTS idx_external_housing_region ON external_housing(region_id);
CREATE INDEX IF NOT EXISTS idx_leaderships_tier ON leaderships(tier);
CREATE INDEX IF NOT EXISTS idx_leaderships_region ON leaderships(region_id);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_housing ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderships ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_identity ENABLE ROW LEVEL SECURITY;

-- Public & Authenticated Read/Write Policies for App Integration
CREATE POLICY "Allow full access students" ON students FOR ALL USING (true);
CREATE POLICY "Allow full access external_housing" ON external_housing FOR ALL USING (true);
CREATE POLICY "Allow full access housing_locations" ON housing_locations FOR ALL USING (true);
CREATE POLICY "Allow full access leaderships" ON leaderships FOR ALL USING (true);
CREATE POLICY "Allow full access leadership_members" ON leadership_members FOR ALL USING (true);
CREATE POLICY "Allow full access families" ON families FOR ALL USING (true);
CREATE POLICY "Allow full access service_identity" ON service_identity FOR ALL USING (true);
CREATE POLICY "Allow full access admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Allow full access regional_accounts" ON regional_accounts FOR ALL USING (true);
