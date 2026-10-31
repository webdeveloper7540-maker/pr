import { RegionInfo, StudentRecord, RegionId, ServiceIdentityConfig } from '../types';
import { classifyStudentGeographically } from '../utils/geoClassification';


export const REGIONS: Record<RegionId, RegionInfo> = {
  minia: {
    id: 'minia',
    name: 'أسرة المنيا',
    fullName: 'أسرة شباب جامعة المنيا',
    universities: ['جامعة المنيا', 'جامعة المنيا الأهلية', 'جامعة دراية'],
    coordinator: 'د. بيتر عاطف',
    contactPhone: '01280001122',
    iconName: 'Building',
  },
  'beni-suef': {
    id: 'beni-suef',
    name: 'أسرة بني سويف',
    fullName: 'أسرة شباب جامعة بني سويف',
    universities: ['جامعة بني سويف', 'جامعة بني سويف الأهلية', 'جامعة النهضة'],
    coordinator: 'م. مينا سمير',
    contactPhone: '01280003344',
    iconName: 'Landmark',
  },
  asyut: {
    id: 'asyut',
    name: 'أسرة أسيوط',
    fullName: 'أسرة شباب جامعة أسيوط',
    universities: ['جامعة أسيوط', 'جامعة أسيوط الأهلية', 'جامعة سفنكس'],
    coordinator: 'أ. كيرلس مجدي',
    contactPhone: '01280005566',
    iconName: 'GraduationCap',
  },
  'cairo-october': {
    id: 'cairo-october',
    name: 'أسرة القاهرة و٦ أكتوبر',
    fullName: 'أسرة شباب جامعات القاهرة والجيزة و٦ أكتوبر',
    universities: ['جامعة القاهرة', 'جامعة عين شمس', 'جامعة حلوان', 'جامعة 6 أكتوبر', 'جامعة مصر للعلوم والتكنولوجيا (MUST)', 'جامعة بدر'],
    coordinator: 'د. يوسف إبراهيم',
    contactPhone: '01280007788',
    iconName: 'Compass',
  },
};

export const INITIAL_IDENTITY_CONFIG: ServiceIdentityConfig = {
  generalLogoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='100' r='96' fill='%230F172A' stroke='%23F59E0B' stroke-width='6'/><circle cx='100' cy='100' r='82' fill='none' stroke='%230284C7' stroke-width='3' stroke-dasharray='6,4'/><path d='M100 25 V140 M65 60 H135' stroke='%23F59E0B' stroke-width='10' stroke-linecap='round'/><path d='M100 45 L115 60 L100 75 L85 60 Z' fill='%2310B981'/><path d='M60 145 C80 130, 120 130, 140 145 L130 165 C110 155, 90 155, 70 165 Z' fill='%230284C7'/><text x='100' y='182' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23F59E0B' text-anchor='middle'>الأمانة العامة - مغاغة</text></svg>",
  familyLogos: {
    minia: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='100' r='94' fill='%230F172A' stroke='%230284C7' stroke-width='6'/><path d='M100 30 V125 M70 60 H130' stroke='%23F59E0B' stroke-width='8' stroke-linecap='round'/><path d='M50 140 C80 120, 120 120, 150 140' stroke='%2310B981' stroke-width='6' fill='none'/><text x='100' y='175' font-family='sans-serif' font-size='12' font-weight='bold' fill='%2338BDF8' text-anchor='middle'>أسرة المنيا</text></svg>",
    'beni-suef': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='100' r='94' fill='%230F172A' stroke='%2310B981' stroke-width='6'/><path d='M100 30 V125 M70 60 H130' stroke='%23F59E0B' stroke-width='8' stroke-linecap='round'/><path d='M40 135 Q100 115 160 135 Q100 155 40 135' fill='%2310B981' opacity='0.8'/><text x='100' y='175' font-family='sans-serif' font-size='12' font-weight='bold' fill='%2334D399' text-anchor='middle'>أسرة بني سويف</text></svg>",
    asyut: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='100' r='94' fill='%230F172A' stroke='%238B5CF6' stroke-width='6'/><path d='M100 30 V125 M70 60 H130' stroke='%23F59E0B' stroke-width='8' stroke-linecap='round'/><path d='M60 130 L100 110 L140 130 L100 150 Z' fill='%238B5CF6'/><text x='100' y='175' font-family='sans-serif' font-size='12' font-weight='bold' fill='%23A78BFA' text-anchor='middle'>أسرة أسيوط</text></svg>",
    'cairo-october': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='100' r='94' fill='%230F172A' stroke='%2338BDF8' stroke-width='6'/><path d='M100 30 V125 M70 60 H130' stroke='%23F59E0B' stroke-width='8' stroke-linecap='round'/><polygon points='100,105 125,145 100,135 75,145' fill='%2338BDF8'/><text x='100' y='175' font-family='sans-serif' font-size='11' font-weight='bold' fill='%237DD3FC' text-anchor='middle'>أسرة القاهرة و6 أكتوبر</text></svg>",
  },
  vision: "أن ينشأ كل طالب وطالبة مغمورين بمحبة المسيح، متسلحين بالإيمان الأرثوذكسي القويم والعلم النافع، ليصبحوا شعلة خدمة وشهادة حية للكنيسة والمجتمع في كافة الجامعات المصرية.",
  mission: "تقديم رعاية روحية وأكاديمية واجتماعية شاملة لأبناء إيبارشية مغاغة والعدوة الدارسين بالجامعات، وتوفير السكنات الآمنة، والربط بالآباء الكهنة والخدام، وتذليل كافة العقبات ليحققوا التفوق والقداسة.",
  goals: [
    "ترسيخ الحياة الروحية والعقيدة الأرثوذكسية الواعية لدى شباب وطلاب الجامعات.",
    "توفير سكنات جامعية ورعاية آمنة ومتكاملة للطالبات والطلاب المغتربين.",
    "المتابعة الأكاديمية والخدمية المستمرة وتقديم الدعم الاجتماعي والمالي للمحتاجين.",
    "ربط الخريجين والخدام برعاة الإيبارشية وبأسرهم الإقليمية بفاعلية وتواصل دائم."
  ],
  contactPhones: [
    "01280007788",
    "01280001122",
    "01280003344",
    "01280005566"
  ],
  contactEmail: "maghagha.university.youth@gmail.com",
  address: "مطرانية السيدة العذراء مريم - مغاغة والعدوة - محافظة المنيا",
};

export const COMMON_FACULTIES = [
  'كلية الطب البشري',
  'كلية الهندسة',
  'كلية الصيدلة',
  'كلية الحاسبات والذكاء الاصطناعي',
  'كلية طب وجراحة الفم والأسنان',
  'كلية التمريض',
  'كلية التجارة وإدارة الأعمال',
  'كلية العلوم',
  'كلية الآداب والتربية',
  'كلية الحقوق',
  'كلية الفنون الجميلة والتطبيقية',
  'كلية العلاج الطبيعي',
  'كلية تكنولوجيا العلوم الصحية',
  'أخرى',
];

// Color palette mapping specifically crafted to complement:
// Deep Sea Blue (#0F172A), Sky Blue (#0284C7), Nature Green (#10B981), Gold Accents (#F59E0B)
export const CHART_PALETTE = [
  '#0284C7', // Sky Blue
  '#10B981', // Nature Green
  '#F59E0B', // Gold Accent
  '#8B5CF6', // Purple
  '#EC4899', // Rose Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#EAB308', // Amber
  '#84CC16', // Lime
  '#A855F7', // Violet
];

// Empty initial state datasets - Strictly enforcing live data fetching from Supabase
export const INITIAL_STUDENTS: StudentRecord[] = [];

export const INITIAL_REGIONAL_ACCOUNTS: import('../types').RegionalAccount[] = [
  {
    id: 'acc-minia',
    regionId: 'minia',
    regionName: 'أسرة المنيا',
    username: 'admin-minia',
    password: 'Minia@2025!',
    lastUpdated: '2025-01-10 14:30',
    coordinatorName: 'د. بيتر عاطف',
    contactPhone: '01280001122',
    status: 'active',
  },
  {
    id: 'acc-benisuef',
    regionId: 'beni-suef',
    regionName: 'أسرة بني سويف',
    username: 'admin-benisuef',
    password: 'BeniSuef@2025!',
    lastUpdated: '2025-01-12 11:15',
    coordinatorName: 'م. مينا سمير',
    contactPhone: '01280003344',
    status: 'active',
  },
  {
    id: 'acc-asyut',
    regionId: 'asyut',
    regionName: 'أسرة أسيوط',
    username: 'admin-asyut',
    password: 'Asyut@2025!',
    lastUpdated: '2025-01-15 16:45',
    coordinatorName: 'أ. كيرلس مجدي',
    contactPhone: '01280005566',
    status: 'active',
  },
  {
    id: 'acc-cairo',
    regionId: 'cairo-october',
    regionName: 'أسرة القاهرة و٦ أكتوبر',
    username: 'admin-cairo',
    password: 'CairoOct@2025!',
    lastUpdated: '2025-01-20 09:20',
    coordinatorName: 'د. يوسف إبراهيم',
    contactPhone: '01280007788',
    status: 'active',
  },
];

export const INITIAL_HOUSING_LOCATIONS: import('../types').HousingLocation[] = [];

export const INITIAL_LEADERSHIP: import('../types').LeadershipMember[] = [];

export function resolveRegionIdFromText(text: string): RegionId | null {
  if (!text) return null;
  const clean = text.trim().toLowerCase();
  if (clean.includes('منيا') || clean.includes('minia')) return 'minia';
  if (clean.includes('سويف') || clean.includes('beni')) return 'beni-suef';
  if (clean.includes('أسيوط') || clean.includes('اسيوط') || clean.includes('asyut')) return 'asyut';
  if (clean.includes('قاهر') || clean.includes('أكتوبر') || clean.includes('اكتوبر') || clean.includes('cairo') || clean.includes('october') || clean.includes('جيزة') || clean.includes('giza')) return 'cairo-october';
  return null;
}
