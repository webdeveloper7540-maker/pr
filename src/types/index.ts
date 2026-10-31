export type UserRole = 'GENERAL_SECRETARIAT' | 'REGIONAL_ADMIN';

export type RegionId = 'minia' | 'beni-suef' | 'asyut' | 'cairo-october';

export interface RegionInfo {
  id: RegionId;
  name: string;
  fullName: string;
  universities: string[];
  coordinator: string;
  contactPhone: string;
  iconName: string;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  regionId?: RegionId;
  token?: string;
}

export type HousingStatus = 'CAMPUS_HOUSING' | 'PRIVATE_RENTAL' | 'COMMUTER_HOME';

export interface ServiceIdentityConfig {
  generalLogoUrl?: string; // شعار الأمانة العامة
  familyLogos: Record<RegionId, string>; // شعار كل أسرة إقليمية
  vision: string; // الرؤية
  mission: string; // الرسالة
  goals: string[]; // الأهداف الإستراتيجية
  contactPhones: string[]; // أرقام الهواتف والتواصل المباشر
  contactEmail?: string; // البريد الإلكتروني
  address?: string; // العنوان ومقر المطرانية
}

export interface GeoClusterDefinition {
  id: string;
  name: string;
  regionId: RegionId;
  parentZone: string; // e.g. 'القاهرة', '6 أكتوبر', 'المنيا', 'بني سويف', 'أسيوط'
  center: { lat: number; lng: number };
  color: string;
  keywords: string[];
  description: string;
}

export interface StudentRecord {
  id: string;
  fullName: string;
  nationalId?: string;
  phone: string;
  regionId: RegionId;
  university: string;
  faculty: string; // University branch / college
  academicYear: 'الفرقة الأولى' | 'الفرقة الثانية' | 'الفرقة الثالثة' | 'الفرقة الرابعة' | 'الفرقة الخامسة' | 'الفرقة السادسة' | 'دراسات عليا';
  housingStatus: HousingStatus;
  housingDetails?: string;
  housingUnitId?: string; // Linked Off-Campus Housing unit ID
  churchParish?: string; // كنيسة القرية أو المدينة بمغاغة والعدوة
  notes?: string;
  registrationDate: string;

  // Geographic classification fields
  governorate?: string; // المحافظة
  cityOrCenter?: string; // المدينة / المركز
  districtOrArea?: string; // الحي / المنطقة
  detailedAddress?: string; // العنوان التفصيلي
  geoClusterId?: string; // معرف التصنيف الجغرافي
  geoClusterName?: string; // مسمى التجمع الجغرافي
  latitude?: number;
  longitude?: number;
  isClusterManual?: boolean; // هل تم التعديل يدوياً
}

export interface HousingLocation {
  id: string;
  regionId: RegionId;
  name: string; // اسم السكن
  genderType: 'شباب' | 'طالبات' | 'مشترك / استضافة عائلية';
  address: string; // العنوان التفصيلي
  capacity: number; // السعة الكلية
  currentOccupancy?: number;
  supervisorName: string; // المشرف المسؤول
  supervisorPhone: string; // رقم هاتف المشرف للتواصل
  googleMapsUrl?: string; // رابط خرائط جوجل
  coordinates?: string; // الإحداثيات (خط العرض والطول)
  monthlyRent?: string; // الإيجار الشهري
  amenities?: string[]; // الخدمات المتاحة
  notes?: string;
  type?: string;
}

export interface ScheduleEvent {
  id: string;
  regionId: RegionId | 'all';
  title: string;
  eventType: 'اجتماع روحي' | 'قداس إلهي' | 'باص الانتقالات' | 'رحلة/مؤتمر' | 'ورشة تدريبية';
  date: string;
  time: string;
  location: string;
  speakerOrLeader: string;
}

export interface RegionalAccount {
  id: string;
  regionId: RegionId;
  regionName: string;
  username: string;
  password: string;
  lastUpdated: string;
  coordinatorName: string;
  contactPhone: string;
  status: 'active' | 'suspended';
}

export interface ParsedImportRow {
  rowNumber: number;
  fullName: string;
  phone: string;
  university: string;
  faculty: string;
  academicYear: StudentRecord['academicYear'];
  regionId: RegionId;
  regionName: string;
  housingStatus: HousingStatus;
  churchParish?: string;
  housingDetails?: string;
  notes?: string;
  governorate?: string;
  cityOrCenter?: string;
  districtOrArea?: string;
  detailedAddress?: string;
  geoClusterId?: string;
  geoClusterName?: string;
  latitude?: number;
  longitude?: number;
  isValid: boolean;
  errors: string[];
}

export type LeadershipTier = 'PRIEST' | 'SECTOR_LEADER' | 'FAMILY_SERVANT';

export interface LeadershipMember {
  id: string;
  name: string;
  tier: LeadershipTier;
  roleTitle: string; // المسمى والمسؤولية الخدمية
  regionId: RegionId | 'all';
  churchOrSector: string; // الكنيسة التابع لها أو القطاع الجغرافي
  phone: string;
  email?: string;
  priestInChargeId?: string; // معرف الأب الكاهن المشرف على القطاع أو الأسرة
  notes?: string;
  status: 'active' | 'on_leave';
  appointedDate: string;
}

export type ActivePage =
  | 'dashboard'
  | 'students'
  | 'geomap'
  | 'families'
  | 'housing'
  | 'leadership'
  | 'schedule'
  | 'security'
  | 'bulk-import';

