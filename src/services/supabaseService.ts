import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  StudentRecord,
  HousingLocation,
  LeadershipMember,
  ServiceIdentityConfig,
  RegionId,
  HousingStatus,
  LeadershipTier,
} from '../types';

// Helper to map DB snake_case row to StudentRecord
function mapRowToStudent(row: any): StudentRecord {
  return {
    id: row.id,
    fullName: row.full_name || '',
    nationalId: row.national_id || undefined,
    phone: row.phone || '',
    regionId: (row.region_id as RegionId) || 'minia',
    university: row.university || '',
    faculty: row.faculty || '',
    academicYear: row.academic_year || '',
    housingStatus: (row.housing_status as HousingStatus) || 'COMMUTER_HOME',
    housingDetails: row.housing_details || undefined,
    housingUnitId: row.housing_unit_id || undefined,
    churchParish: row.church_parish || undefined,
    notes: row.notes || undefined,
    registrationDate: row.registration_date || new Date().toISOString().split('T')[0],
    governorate: row.governorate || undefined,
    cityOrCenter: row.city_or_center || undefined,
    districtOrArea: row.district_or_area || undefined,
    detailedAddress: row.detailed_address || undefined,
    geoClusterId: row.geo_cluster_id || undefined,
    geoClusterName: row.geo_cluster_name || undefined,
    latitude: row.latitude || undefined,
    longitude: row.longitude || undefined,
    isClusterManual: row.is_cluster_manual || false,
  };
}

// Helper to map StudentRecord to DB snake_case row
function mapStudentToRow(student: Partial<StudentRecord> & { id: string }) {
  return {
    id: student.id,
    full_name: student.fullName,
    national_id: student.nationalId || null,
    phone: student.phone,
    region_id: student.regionId,
    university: student.university,
    faculty: student.faculty,
    academic_year: student.academicYear,
    housing_status: student.housingStatus,
    housing_details: student.housingDetails || null,
    housing_unit_id: student.housingUnitId || null,
    church_parish: student.churchParish || null,
    notes: student.notes || null,
    registration_date: student.registrationDate || new Date().toISOString().split('T')[0],
    governorate: student.governorate || null,
    city_or_center: student.cityOrCenter || null,
    district_or_area: student.districtOrArea || null,
    detailed_address: student.detailedAddress || null,
    geo_cluster_id: student.geoClusterId || null,
    geo_cluster_name: student.geoClusterName || null,
    latitude: student.latitude || null,
    longitude: student.longitude || null,
    is_cluster_manual: student.isClusterManual || false,
  };
}

// Helper to map DB row to HousingLocation
function mapRowToHousing(row: any): HousingLocation {
  return {
    id: row.id,
    regionId: row.region_id,
    name: row.name || '',
    genderType: row.gender_type || 'شباب',
    address: row.address || '',
    capacity: row.capacity || 0,
    currentOccupancy: row.current_occupancy || 0,
    supervisorName: row.supervisor_name || '',
    supervisorPhone: row.supervisor_phone || '',
    googleMapsUrl: row.google_maps_url || undefined,
    coordinates: row.coordinates || undefined,
    monthlyRent: row.monthly_rent || undefined,
    amenities: row.amenities || [],
    notes: row.notes || undefined,
  };
}

function mapHousingToRow(housing: Partial<HousingLocation> & { id: string }) {
  return {
    id: housing.id,
    region_id: housing.regionId,
    name: housing.name,
    gender_type: housing.genderType,
    address: housing.address,
    capacity: housing.capacity,
    current_occupancy: housing.currentOccupancy || 0,
    supervisor_name: housing.supervisorName,
    supervisor_phone: housing.supervisorPhone,
    google_maps_url: housing.googleMapsUrl || null,
    coordinates: housing.coordinates || null,
    monthly_rent: housing.monthlyRent || null,
    amenities: housing.amenities || [],
    notes: housing.notes || null,
  };
}

// Helper to map DB row to LeadershipMember
function mapRowToLeadership(row: any): LeadershipMember {
  return {
    id: row.id,
    name: row.name || '',
    tier: (row.tier as LeadershipTier) || 'FAMILY_SERVANT',
    roleTitle: row.role_title || '',
    regionId: row.region_id || 'all',
    churchOrSector: row.church_or_sector || '',
    phone: row.phone || '',
    email: row.email || undefined,
    priestInChargeId: row.priest_in_charge_id || undefined,
    notes: row.notes || undefined,
    status: row.status || 'active',
    appointedDate: row.appointed_date || new Date().toISOString().split('T')[0],
  };
}

function mapLeadershipToRow(member: Partial<LeadershipMember> & { id: string }) {
  return {
    id: member.id,
    name: member.name,
    tier: member.tier,
    role_title: member.roleTitle,
    region_id: member.regionId || 'all',
    church_or_sector: member.churchOrSector,
    phone: member.phone,
    email: member.email || null,
    priest_in_charge_id: member.priestInChargeId || null,
    notes: member.notes || null,
    status: member.status || 'active',
    appointed_date: member.appointedDate || new Date().toISOString().split('T')[0],
  };
}

// ==========================================
// 1. STUDENTS SERVICE LAYER
// ==========================================
export async function fetchStudentsFromSupabase(): Promise<StudentRecord[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch students notice:', error.message);
      return [];
    }
    return data ? data.map(mapRowToStudent) : [];
  } catch (err) {
    console.error('Error in fetchStudentsFromSupabase:', err);
    return [];
  }
}

export async function addStudentToSupabase(
  studentData: Omit<StudentRecord, 'id' | 'registrationDate'>
): Promise<StudentRecord | null> {
  if (!isSupabaseConfigured) return null;
  const newId = `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const registrationDate = new Date().toISOString().split('T')[0];

  const fullStudent: StudentRecord = {
    ...studentData,
    id: newId,
    registrationDate,
  };

  try {
    const row = mapStudentToRow(fullStudent);
    const { data, error } = await supabase.from('students').insert([row]).select();

    if (error) {
      console.error('Supabase add student error:', error.message);
      return null;
    }
    return data && data[0] ? mapRowToStudent(data[0]) : fullStudent;
  } catch (err) {
    console.error('Error in addStudentToSupabase:', err);
    return null;
  }
}

export async function updateStudentInSupabase(
  student: StudentRecord
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const row = mapStudentToRow(student);
    const { error } = await supabase
      .from('students')
      .update(row)
      .eq('id', student.id);

    if (error) {
      console.error('Supabase update student error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in updateStudentInSupabase:', err);
    return false;
  }
}

export async function deleteStudentFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete student error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in deleteStudentFromSupabase:', err);
    return false;
  }
}

export async function bulkInsertStudentsToSupabase(
  students: Omit<StudentRecord, 'id' | 'registrationDate'>[]
): Promise<boolean> {
  if (!isSupabaseConfigured || students.length === 0) return false;
  try {
    const rows = students.map((s, idx) => {
      const full: StudentRecord = {
        ...s,
        id: `st-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        registrationDate: new Date().toISOString().split('T')[0],
      };
      return mapStudentToRow(full);
    });

    // Chunk bulk inserts into batches of 50 records to prevent request size/URL issues
    const BATCH_SIZE = 50;
    let successCount = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('students').insert(batch);

      if (error) {
        console.warn(`Supabase bulk insert batch (${i / BATCH_SIZE + 1}) notice:`, error.message);
      } else {
        successCount += batch.length;
      }
    }

    return successCount > 0;
  } catch (err) {
    console.warn('Notice in bulkInsertStudentsToSupabase:', err);
    return false;
  }
}

// ==========================================
// 2. EXTERNAL HOUSING SERVICE LAYER
// ==========================================
export async function fetchHousingFromSupabase(): Promise<HousingLocation[]> {
  if (!isSupabaseConfigured) return [];
  try {
    // Primary query on external_housing, with fallback to housing_locations
    let res = await supabase
      .from('external_housing')
      .select('*')
      .order('created_at', { ascending: false });

    if (res.error || !res.data) {
      res = await supabase
        .from('housing_locations')
        .select('*')
        .order('created_at', { ascending: false });
    }

    if (res.error || !res.data) return [];
    return res.data.map(mapRowToHousing);
  } catch {
    return [];
  }
}

export async function addHousingToSupabase(
  housing: Omit<HousingLocation, 'id'>
): Promise<HousingLocation | null> {
  if (!isSupabaseConfigured) return null;
  const newId = `house-${Date.now()}`;
  const full: HousingLocation = { ...housing, id: newId };
  try {
    const row = mapHousingToRow(full);
    let { data, error } = await supabase.from('external_housing').insert([row]).select();
    if (error) {
      const fallback = await supabase.from('housing_locations').insert([row]).select();
      data = fallback.data;
      error = fallback.error;
    }
    if (error) return null;
    return data && data[0] ? mapRowToHousing(data[0]) : full;
  } catch {
    return null;
  }
}

export async function updateHousingInSupabase(housing: HousingLocation): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const row = mapHousingToRow(housing);
    let { error } = await supabase.from('external_housing').update(row).eq('id', housing.id);
    if (error) {
      const fallback = await supabase.from('housing_locations').update(row).eq('id', housing.id);
      error = fallback.error;
    }
    return !error;
  } catch {
    return false;
  }
}

export async function deleteHousingFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    let { error } = await supabase.from('external_housing').delete().eq('id', id);
    if (error) {
      const fallback = await supabase.from('housing_locations').delete().eq('id', id);
      error = fallback.error;
    }
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 3. LEADERSHIP STRUCTURE SERVICE LAYER
// ==========================================
export async function fetchLeadershipFromSupabase(): Promise<LeadershipMember[]> {
  if (!isSupabaseConfigured) return [];
  try {
    let res = await supabase
      .from('leaderships')
      .select('*')
      .order('created_at', { ascending: true });

    if (res.error || !res.data) {
      res = await supabase
        .from('leadership_members')
        .select('*')
        .order('created_at', { ascending: true });
    }

    if (res.error || !res.data) return [];
    return res.data.map(mapRowToLeadership);
  } catch {
    return [];
  }
}

export async function addLeadershipToSupabase(
  member: Omit<LeadershipMember, 'id'>
): Promise<LeadershipMember | null> {
  if (!isSupabaseConfigured) return null;
  const newId = `lead-${Date.now()}`;
  const full: LeadershipMember = { ...member, id: newId };
  try {
    const row = mapLeadershipToRow(full);
    let { data, error } = await supabase.from('leaderships').insert([row]).select();
    if (error) {
      const fallback = await supabase.from('leadership_members').insert([row]).select();
      data = fallback.data;
      error = fallback.error;
    }
    if (error) return null;
    return data && data[0] ? mapRowToLeadership(data[0]) : full;
  } catch {
    return null;
  }
}

export async function updateLeadershipInSupabase(member: LeadershipMember): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const row = mapLeadershipToRow(member);
    let { error } = await supabase.from('leaderships').update(row).eq('id', member.id);
    if (error) {
      const fallback = await supabase.from('leadership_members').update(row).eq('id', member.id);
      error = fallback.error;
    }
    return !error;
  } catch {
    return false;
  }
}

export async function deleteLeadershipFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    let { error } = await supabase.from('leaderships').delete().eq('id', id);
    if (error) {
      const fallback = await supabase.from('leadership_members').delete().eq('id', id);
      error = fallback.error;
    }
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 4. SERVICE IDENTITY & BRANDING SERVICE
// ==========================================
export async function fetchIdentityFromSupabase(): Promise<ServiceIdentityConfig | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('service_identity')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) return null;
    return {
      generalLogoUrl: data.general_logo_url,
      familyLogos: data.family_logos || {},
      vision: data.vision,
      mission: data.mission,
      goals: data.goals || [],
      contactPhones: data.contact_phones || [],
      contactEmail: data.contact_email,
      address: data.address,
    };
  } catch {
    return null;
  }
}

export async function saveIdentityToSupabase(
  config: ServiceIdentityConfig
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const payload = {
      id: 1,
      general_logo_url: config.generalLogoUrl || null,
      family_logos: config.familyLogos,
      vision: config.vision,
      mission: config.mission,
      goals: config.goals,
      contact_phones: config.contactPhones,
      contact_email: config.contactEmail || null,
      address: config.address || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('service_identity').upsert([payload]);
    return !error;
  } catch {
    return false;
  }
}
