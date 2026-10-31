import { RegionId } from '../types';
import { REGIONS, resolveRegionIdFromText } from '../data/constants';

// Standardized attribute keys
export type MappedDbField =
  | 'fullName'
  | 'phone'
  | 'regionId'
  | 'university'
  | 'faculty'
  | 'academicYear'
  | 'housingStatus'
  | 'churchParish'
  | 'governorate'
  | 'cityOrCenter'
  | 'districtOrArea'
  | 'detailedAddress'
  | 'housingDetails'
  | 'notes';

export interface FieldMappingDefinition {
  fieldKey: MappedDbField;
  labelArabic: string;
  supabaseColumn: string;
  required: boolean;
  aliases: string[];
}

export const FIELD_DEFINITIONS: FieldMappingDefinition[] = [
  {
    fieldKey: 'fullName',
    labelArabic: 'اسم الطالب رباعي',
    supabaseColumn: 'full_name',
    required: true,
    aliases: [
      'full_name',
      'fullname',
      'student_name',
      'name',
      'student name',
      'اسم الطالب رباعي',
      'اسم الطالب الثلاثي',
      'اسم الطالب',
      'الاسم بالكامل',
      'الاسم',
      'اسم الطالب رباعي/ثلاثي',
    ],
  },
  {
    fieldKey: 'phone',
    labelArabic: 'رقم الهاتف المحمول',
    supabaseColumn: 'phone',
    required: true,
    aliases: [
      'phone_number',
      'phone',
      'mobile_number',
      'mobile',
      'phone number',
      'contact',
      'رقم الهاتف المحمول',
      'رقم الهاتف',
      'الموبايل',
      'الهاتف',
      'رقم الموبايل',
      'رقم التليفون',
      'تليفون الطالب',
    ],
  },
  {
    fieldKey: 'regionId',
    labelArabic: 'الأسرة الإقليمية',
    supabaseColumn: 'region_id',
    required: false, // auto-resolved or default for regional admins
    aliases: [
      'family_id',
      'region_id',
      'family',
      'region',
      'regional_family',
      'family_name',
      'regional family',
      'الأسرة الإقليمية',
      'الأسرة',
      'أسرة الجامعة',
      'المحافظة/الأسرة',
      'المنطقة',
      'النطاق الإقليمي',
    ],
  },
  {
    fieldKey: 'university',
    labelArabic: 'الجامعة',
    supabaseColumn: 'university',
    required: false,
    aliases: [
      'university',
      'uni',
      'university_name',
      'college_university',
      'الجامعة',
      'اسم الجامعة',
      'الجامعة المقيد بها',
    ],
  },
  {
    fieldKey: 'faculty',
    labelArabic: 'الكلية / التخصص',
    supabaseColumn: 'faculty',
    required: true,
    aliases: [
      'faculty',
      'college',
      'department',
      'major',
      'branch',
      'الكلية / الفرع الجامعي',
      'الكلية',
      'الفرع الجامعي',
      'التخصص',
      'اسم الكلية',
    ],
  },
  {
    fieldKey: 'academicYear',
    labelArabic: 'السنة الدراسية',
    supabaseColumn: 'academic_year',
    required: false,
    aliases: [
      'academic_year',
      'year',
      'grade',
      'academic year',
      'level',
      'السنة الدراسية',
      'الفرقة الدراسية',
      'الفرقة',
      'السنة',
      'المستوى الدراسي',
    ],
  },
  {
    fieldKey: 'housingStatus',
    labelArabic: 'حالة السكن',
    supabaseColumn: 'housing_status',
    required: false,
    aliases: [
      'housing_status',
      'housing',
      'housing status',
      'residence',
      'حالة السكن',
      'نوع السكن',
      'السكن',
      'الإقامة',
      'نوع الإقامة',
    ],
  },
  {
    fieldKey: 'governorate',
    labelArabic: 'المحافظة',
    supabaseColumn: 'governorate',
    required: false,
    aliases: ['governorate', 'gov', 'state', 'المحافظة', 'محافظة السكن', 'محافظة'],
  },
  {
    fieldKey: 'cityOrCenter',
    labelArabic: 'المدينة / المركز',
    supabaseColumn: 'city_or_center',
    required: false,
    aliases: [
      'city_or_center',
      'city',
      'center',
      'المدينة / المركز',
      'المدينة/المركز',
      'المدينة',
      'المركز',
      'المركز/المدينة',
    ],
  },
  {
    fieldKey: 'districtOrArea',
    labelArabic: 'الحي / المنطقة / القطاع',
    supabaseColumn: 'district_or_area',
    required: false,
    aliases: [
      'neighborhood_or_segment',
      'district_or_area',
      'district',
      'area',
      'neighborhood',
      'segment',
      'الحي / المنطقة',
      'الحي/المنطقة',
      'الحي',
      'المنطقة',
      'القطاع/الحي',
      'المنطقة/الحي',
    ],
  },
  {
    fieldKey: 'detailedAddress',
    labelArabic: 'العنوان التفصيلي',
    supabaseColumn: 'detailed_address',
    required: false,
    aliases: [
      'detailed_address',
      'housing_details',
      'address',
      'location',
      'العنوان التفصيلي',
      'تفاصيل السكن / العنوان',
      'تفاصيل السكن',
      'العنوان',
      'عنوان السكن',
    ],
  },
  {
    fieldKey: 'churchParish',
    labelArabic: 'الكنيسة بالإيبارشية',
    supabaseColumn: 'church_parish',
    required: false,
    aliases: [
      'كنيسة القرية أو المدينة بمغاغة والعدوة',
      'الكنيسة',
      'كنيسة',
      'الكنيسة التابع لها',
      'القرية / المدينة',
      'church',
      'parish',
      'church_parish',
      'church parish',
    ],
  },
  {
    fieldKey: 'notes',
    labelArabic: 'ملاحظات إضافية',
    supabaseColumn: 'notes',
    required: false,
    aliases: ['ملاحظات إضافية', 'ملاحظات', 'ملاحظة', 'notes', 'comments', 'remarks'],
  },
];

// Clean text for header comparison (lowercasing, removing extra spaces and diacritics)
function normalizeHeader(str: string): string {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[\s\_\-\/\\()]/g, '');
}

export interface HeaderMappingResult {
  detectedFields: Record<MappedDbField, string>; // MappedDbField -> original Excel header name
  unmappedColumns: string[];
  missingRequiredFields: FieldMappingDefinition[];
}

/**
 * Analyzes Excel row headers and builds a dynamic translation mapping
 */
export function buildHeaderMapping(headersInExcel: string[]): HeaderMappingResult {
  const detectedFields: Partial<Record<MappedDbField, string>> = {};
  const unmappedColumns: string[] = [];

  const normalizedExcelHeaders = headersInExcel.map((h) => ({
    original: h,
    normalized: normalizeHeader(h),
  }));

  FIELD_DEFINITIONS.forEach((def) => {
    const normalizedAliases = def.aliases.map(normalizeHeader);

    // Find first matching header in Excel file
    const match = normalizedExcelHeaders.find((item) =>
      normalizedAliases.some((alias) => item.normalized === alias || item.normalized.includes(alias))
    );

    if (match) {
      detectedFields[def.fieldKey] = match.original;
    }
  });

  // Collect columns that didn't match any known definition
  const mappedExcelHeaders = new Set(Object.values(detectedFields));
  headersInExcel.forEach((h) => {
    if (h && !mappedExcelHeaders.has(h)) {
      unmappedColumns.push(h);
    }
  });

  // Find missing required fields
  const missingRequiredFields = FIELD_DEFINITIONS.filter(
    (def) => def.required && !detectedFields[def.fieldKey]
  );

  return {
    detectedFields: detectedFields as Record<MappedDbField, string>,
    unmappedColumns,
    missingRequiredFields,
  };
}

/**
 * Clean Egyptian phone number string (standardizing to 11 digits starting with 01)
 */
export function sanitizePhoneNumber(raw: any): string {
  if (!raw) return '';
  let str = String(raw).replace(/[^0-9]/g, '');

  if (str.startsWith('201') && str.length === 12) {
    str = str.substring(1);
  } else if (str.startsWith('00201') && str.length === 14) {
    str = str.substring(3);
  }

  // Handle case where trailing decimal or scientific notation made it weird
  if (str.length > 11 && str.startsWith('01')) {
    str = str.substring(0, 11);
  }

  return str;
}
