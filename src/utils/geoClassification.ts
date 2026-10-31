import { RegionId, GeoClusterDefinition } from '../types';

/**
 * Intelligent Geographic Classification Definitions
 * Grouped into logical sectors and close neighborhood clusters
 */
export const GEO_CLUSTERS: GeoClusterDefinition[] = [
  // ==========================================
  // CAIRO & 6TH OF OCTOBER REGION
  // ==========================================
  // --- Cairo Sectors ---
  {
    id: 'cairo-central',
    name: 'وسط القاهرة (شبرا والعباسية ووسط البلد)',
    regionId: 'cairo-october',
    parentZone: 'القاهرة',
    center: { lat: 30.0610, lng: 31.2460 },
    color: '#0284C7', // Sky Blue
    description: 'شبرا، العباسية، رمسيس، باب الشعرية، روض الفرج، الفجالة، عابدين',
    keywords: [
      'شبرا', 'شبرا مصر', 'العباسية', 'عباسية', 'وسط البلد', 'رمسيس', 'الفجالة',
      'باب الشعرية', 'روض الفرج', 'الظاهر', 'عابدين', 'التحرير', 'الأزبكية',
      'جامعة عين شمس - العباسية', 'كلية الهندسة بالعباسية'
    ],
  },
  {
    id: 'cairo-east',
    name: 'شرق القاهرة (مدينة نصر ومصر الجديدة)',
    regionId: 'cairo-october',
    parentZone: 'القاهرة',
    center: { lat: 30.0684, lng: 31.3402 },
    color: '#10B981', // Nature Green
    description: 'مدينة نصر، مصر الجديدة، النزهة، عين شمس، ألماظة، روكسي، مكرم عبيد',
    keywords: [
      'مدينة نصر', 'نصر', 'الحي السابع', 'الحي السادس', 'الحي العاشر', 'مكرم عبيد',
      'عباس العقاد', 'مصر الجديدة', 'روكسي', 'الكوربة', 'ألماظة', 'النزهة',
      'عين شمس', 'المطرية', 'الألف مسكن', 'جسر السويس', 'سانت فاتيما'
    ],
  },
  {
    id: 'cairo-north',
    name: 'شمال القاهرة (شبرا الخيمة وحدائق القبة)',
    regionId: 'cairo-october',
    parentZone: 'القاهرة',
    center: { lat: 30.1012, lng: 31.2721 },
    color: '#F59E0B', // Gold
    description: 'شبرا الخيمة، الزاوية الحمراء، الشرابية، حدائق القبة، الساحل، الأميرية',
    keywords: [
      'شبرا الخيمة', 'الخيمة', 'الزاوية الحمراء', 'الشرابية', 'حدائق القبة',
      'الساحل', 'الأميرية', 'سراي القبة', 'مستطرد', 'بهتيم'
    ],
  },
  {
    id: 'cairo-south-giza',
    name: 'جنوب القاهرة والجيزة (المعادي والدقي وحلوان)',
    regionId: 'cairo-october',
    parentZone: 'القاهرة',
    center: { lat: 29.9702, lng: 31.2650 },
    color: '#8B5CF6', // Purple
    description: 'المعادي، حلوان، المقطم، الدقي، المهندسين، الجيزة، الهرم، فيصل',
    keywords: [
      'المعادي', 'معادي', 'دجلة المعادي', 'حلوان', 'المقطم', 'مقطم',
      'الدقي', 'المهندسين', 'العجوزة', 'الجيزة', 'بين السرايات',
      'الهرم', 'فيصل', 'شارع الهرم', 'العمرانية', 'جامعة القاهرة'
    ],
  },
  {
    id: 'cairo-new',
    name: 'القاهرة الجديدة والتجمعات والشروق',
    regionId: 'cairo-october',
    parentZone: 'القاهرة',
    center: { lat: 30.0131, lng: 31.4989 },
    color: '#EC4899', // Pink
    description: 'التجمع الخامس، التجمع الأول، الرحاب، الشروق، مدينتي، بدر، المستقبل',
    keywords: [
      'القاهرة الجديدة', 'التجمع', 'التجمع الخامس', 'التجمع الاول', 'التجمع الأول',
      'الرحاب', 'الشروق', 'مدينتي', 'بدر', 'مدينة بدر', 'الجامعة الألمانية',
      'الجامعة الأمريكية', 'المستقبل'
    ],
  },

  // --- 6th of October Sectors & Neighborhoods ---
  {
    id: 'october-central-1-5',
    name: 'أكتوبر - الأحياء المركزية (1 إلى 5 والحصري)',
    regionId: 'cairo-october',
    parentZone: '6 أكتوبر',
    center: { lat: 29.9737, lng: 30.9520 },
    color: '#0284C7',
    description: 'الحي الأول، الحي الثاني، الحي الثالث، الحي الرابع، الحي الخامس، ميدان الحصري',
    keywords: [
      'الحي الاول', 'الحي الأول', 'الحي الثاني', 'الحي الثالث', 'الحي الرابع',
      'الحي الخامس', 'الحصري', 'ميدان الحصري', 'جامع الحصري', 'المحور المركزي',
      'المجاورة الاولى', 'المجاورة الثانية', 'المجاورة الثالثة', 'أكتوبر - مركزي'
    ],
  },
  {
    id: 'october-west-6-12',
    name: 'أكتوبر - الأحياء الغربية (6 إلى 12 والشباب)',
    regionId: 'cairo-october',
    parentZone: '6 أكتوبر',
    center: { lat: 29.9540, lng: 30.9170 },
    color: '#06B6D4',
    description: 'الحي السادس، الحي السابع، الحي الثامن، الحي العاشر، الحي 11، الحي 12، مساكن الشباب',
    keywords: [
      'الحي السادس', 'الحي السابع', 'الحي الثامن', 'الحي التاسع', 'الحي العاشر',
      'الحي الحادي عشر', 'الحي الثاني عشر', 'الحي 11', 'الحي 12', 'مساكن الشباب',
      'ليلة القدر', 'ابني بيتك', 'صينية ليلة القدر'
    ],
  },
  {
    id: 'october-distinguished-khamael',
    name: 'أكتوبر - الأحياء المتميزة والخمائل وسوميد',
    regionId: 'cairo-october',
    parentZone: '6 أكتوبر',
    center: { lat: 29.9890, lng: 31.0020 },
    color: '#10B981',
    description: 'الحي المتميز، غرب سوميد، كومباوند الخمائل، بالم هيلز، البشاير، طيبة جاردنز',
    keywords: [
      'المتميز', 'الحي المتميز', 'غرب سوميد', 'سوميد', 'الخمائل', 'بالم هيلز',
      'البشاير', 'طيبة جاردنز', 'فاميلي لاند', 'ميدان فودافون'
    ],
  },
  {
    id: 'october-gardens-pyramids',
    name: 'أكتوبر - حدائق أكتوبر وهضبة الأهرام',
    regionId: 'cairo-october',
    parentZone: '6 أكتوبر',
    center: { lat: 29.9320, lng: 31.0650 },
    color: '#F59E0B',
    description: 'حدائق أكتوبر، الفردوس، دجلة بالمز، هضبة الأهرام، الرماية، صبحي حسين',
    keywords: [
      'حدائق أكتوبر', 'حدائق اكتوبر', 'الفردوس', 'دجلة بالمز', 'هضبة الأهرام',
      'هضبة الاهرام', 'الرماية', 'حي الأشجار', 'كمبوند كنز', 'سكن مصر حدائق'
    ],
  },
  {
    id: 'october-extensions-zayed',
    name: 'أكتوبر - التوسعات الشمالية والشيخ زايد',
    regionId: 'cairo-october',
    parentZone: '6 أكتوبر',
    center: { lat: 30.0250, lng: 30.9580 },
    color: '#6366F1',
    description: 'التوسعات الشمالية، منطقة الشماليات، الشيخ زايد، دهشور، بيفرلي هيلز',
    keywords: [
      'التوسعات الشمالية', 'الشماليات', 'الشيخ زايد', 'زايد', 'دهشور',
      'وصلة دهشور', 'بيفرلي هيلز', 'جامعة 6 أكتوبر', 'جامعة مصر للعلوم والتكنولوجيا',
      'جامعة MSA', 'جامعة نوال الدجوي'
    ],
  },

  // ==========================================
  // MINIA REGION
  // ==========================================
  {
    id: 'minia-city-university',
    name: 'المنيا - مدينة المنيا والجامعة والمجمع',
    regionId: 'minia',
    parentZone: 'مدينة المنيا',
    center: { lat: 28.1099, lng: 30.7503 },
    color: '#0284C7',
    description: 'مدينة المنيا، شلبي، الإخصاص، أرض سلطان، كورنيش النيل، سكن الجامعة، كدوان',
    keywords: [
      'مدينة المنيا', 'المنيا', 'شلبي', 'حي شلبي', 'الإخصاص', 'الاخصاص',
      'أرض سلطان', 'مجمع الكليات', 'سكن الجامعة', 'المدينة الجامعية',
      'كورنيش المنيا', 'كدوان', 'ماقوسة', 'شارع عدنان المالكي', 'طه حسين'
    ],
  },
  {
    id: 'minia-maghagha-adwa',
    name: 'المنيا - قطاع مغاغة والعدوة (مقر الإيبارشية)',
    regionId: 'minia',
    parentZone: 'مغاغة والعدوة',
    center: { lat: 28.6489, lng: 30.8415 },
    color: '#10B981',
    description: 'مغاغة، العدوة، أبا البلد، بني والمس، الشيخ مسعود، صفانية، زاوية الجدامي، طمبدي',
    keywords: [
      'مغاغة', 'العدوة', 'أبا البلد', 'بني والمس', 'الشيخ مسعود', 'صفانية',
      'زاوية الجدامي', 'طمبدي', 'شارونة', 'دهروط', 'القرى التابعة لمغاغة'
    ],
  },
  {
    id: 'minia-benu-mazar-samalut',
    name: 'المنيا - قطاع بني مزار ومطاي وسمالوط',
    regionId: 'minia',
    parentZone: 'شمال المنيا',
    center: { lat: 28.5020, lng: 30.7950 },
    color: '#F59E0B',
    description: 'بني مزار، مطاي، سمالوط، صندفا، البهنسا، بردنوها، طحا الأعمدة',
    keywords: [
      'بني مزار', 'مطاي', 'سمالوط', 'صندفا', 'البهنسا', 'بردنوها',
      'دير جبل الطير', 'طحا الأعمدة', 'بني صامت'
    ],
  },
  {
    id: 'minia-south-mallawi',
    name: 'المنيا - قطاع جنوب المنيا (أبو قرقاص وملوي وديرمواس)',
    regionId: 'minia',
    parentZone: 'جنوب المنيا',
    center: { lat: 27.7314, lng: 30.8410 },
    color: '#8B5CF6',
    description: 'ملوي، أبو قرقاص، ديرمواس، تونة الجبل، الأشمونين، الروضة',
    keywords: [
      'ملوي', 'ابو قرقاص', 'أبو قرقاص', 'ديرمواس', 'دير مواس',
      'تونة الجبل', 'الأشمونين', 'الروضة', 'دلجا'
    ],
  },

  // ==========================================
  // BENI SUEF REGION
  // ==========================================
  {
    id: 'benisuef-city-university',
    name: 'بني سويف - مدينة بني سويف ومجمع الجامعة',
    regionId: 'beni-suef',
    parentZone: 'مدينة بني سويف',
    center: { lat: 29.0661, lng: 31.0994 },
    color: '#0284C7',
    description: 'مدينة بني سويف، صلاح سالم، بني سويف الجديدة، شرق النيل، أرض المحلج',
    keywords: [
      'بني سويف', 'مدينة بني سويف', 'صلاح سالم', 'شرق النيل', 'بني سويف الجديدة',
      'أرض المحلج', 'عبد السلام عارف', 'المدينة الجامعية بني سويف', 'مجمع الجامعة'
    ],
  },
  {
    id: 'benisuef-wasta-nasser',
    name: 'بني سويف - قطاع الواسطى وناصر وإهناسيا',
    regionId: 'beni-suef',
    parentZone: 'شمال بني سويف',
    center: { lat: 29.3330, lng: 31.2050 },
    color: '#10B981',
    description: 'الواسطى، ناصر، إهناسيا، قمن العروس، بهبشين، دير الميمون',
    keywords: [
      'الواسطى', 'مركز الواسطى', 'ناصر', 'مركز ناصر', 'إهناسيا', 'اهناسيا',
      'قمن العروس', 'بهبشين', 'دير الميمون', 'أبو صير'
    ],
  },
  {
    id: 'benisuef-fashn-beba',
    name: 'بني سويف - قطاع الفشن وببا وسمسطا (الأقرب لمغاغة)',
    regionId: 'beni-suef',
    parentZone: 'جنوب بني سويف',
    center: { lat: 28.8240, lng: 30.8980 },
    color: '#F59E0B',
    description: 'الفشن، ببا، سمسطا، شنرا، صفط راشين، نزلة البرقي، تلت',
    keywords: [
      'الفشن', 'مركز الفشن', 'ببا', 'مركز ببا', 'سمسطا', 'مركز سمسطا',
      'شنرا', 'صفط راشين', 'نزلة البرقي', 'تلت', 'سدس'
    ],
  },

  // ==========================================
  // ASYUT REGION
  // ==========================================
  {
    id: 'asyut-city-university',
    name: 'أسيوط - مدينة أسيوط والجامعة والجمهورية',
    regionId: 'asyut',
    parentZone: 'مدينة أسيوط',
    center: { lat: 27.1828, lng: 31.1859 },
    color: '#0284C7',
    description: 'مدينة أسيوط، حي شرق، حي غرب، شارع الجمهورية، شركة قلتة، المعلمين، الأزهر',
    keywords: [
      'أسيوط', 'مدينة أسيوط', 'شارع الجمهورية', 'شركة قلتة', 'المعلمين',
      'حي شرق', 'حي غرب', 'الوليدية', 'سكن الجامعة', 'المدينة الجامعية بأسيوط',
      'الأزهر', 'ميدان المحطة أسيوط', 'الهلالي'
    ],
  },
  {
    id: 'asyut-new-city-fath',
    name: 'أسيوط - أسيوط الجديدة والفتح وأبنوب',
    regionId: 'asyut',
    parentZone: 'شرق أسيوط',
    center: { lat: 27.2340, lng: 31.3320 },
    color: '#10B981',
    description: 'مدينة أسيوط الجديدة، الكوم الأحمر، الفتح، أبنوب، ساحل سليم',
    keywords: [
      'أسيوط الجديدة', 'اسيوط الجديدة', 'الفتح', 'أبنوب', 'ابنوب',
      'ساحل سليم', 'الكوم الأحمر', 'الجامعة الأهلية بأسيوط'
    ],
  },
  {
    id: 'asyut-north-dayrut-qusiya',
    name: 'أسيوط - قطاع شمال أسيوط (ديروط والقوصية ومنفلوط)',
    regionId: 'asyut',
    parentZone: 'شمال أسيوط',
    center: { lat: 27.5580, lng: 30.8120 },
    color: '#F59E0B',
    description: 'ديروط، القوصية، منفلوط، صنبو، مير، دير المحرق، بني شقير',
    keywords: [
      'ديروط', 'مركز ديروط', 'القوصية', 'مركز القوصية', 'منفلوط', 'مركز منفلوط',
      'صنبو', 'مير', 'دير المحرق', 'دير العذراء المحرق', 'بني شقير'
    ],
  },
  {
    id: 'asyut-south-abutig-sidfa',
    name: 'أسيوط - قطاع جنوب أسيوط (أبو تيج وصدفا والغنايم)',
    regionId: 'asyut',
    parentZone: 'جنوب أسيوط',
    center: { lat: 26.9850, lng: 31.3190 },
    color: '#8B5CF6',
    description: 'أبو تيج، صدفا، الغنايم، البداري، دير الجنادلة، النخيلة',
    keywords: [
      'أبو تيج', 'ابو تيج', 'صدفا', 'الغنايم', 'البداري',
      'دير الجنادلة', 'النخيلة', 'الزاوية أسيوط'
    ],
  },
];

/**
 * Normalizes Arabic text for flexible matching (removes accents, normalizes alef, teh marbuta, etc.)
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/[\u064B-\u065F]/g, '') // Remove harakat (tashkeel)
    .replace(/[-_.,;/\\()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates a deterministic small jitter around a center coordinate
 * so students within the same neighborhood cluster spread gracefully on the map.
 */
export function generateClusterJitter(seed: string, index: number = 0): { latOffset: number; lngOffset: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const factor1 = Math.sin(hash + index * 1.618);
  const factor2 = Math.cos(hash * 1.33 + index * 2.718);
  // Spread radius roughly 200m - 800m
  const latOffset = factor1 * 0.0045;
  const lngOffset = factor2 * 0.0055;
  return { latOffset, lngOffset };
}

/**
 * Intelligent Geographic Classification Engine:
 * Analyzes location fields (Governorate, City/Center, District/Area, Detailed Address, University, Faculty)
 * and accurately maps the student to the optimal geographic cluster.
 */
export function classifyStudentGeographically(params: {
  regionId: RegionId;
  governorate?: string;
  cityOrCenter?: string;
  districtOrArea?: string;
  detailedAddress?: string;
  university?: string;
  faculty?: string;
  churchParish?: string;
  studentKey?: string;
}): {
  clusterId: string;
  clusterName: string;
  parentZone: string;
  lat: number;
  lng: number;
  color: string;
  confidence: 'high' | 'medium' | 'default';
} {
  const {
    regionId,
    governorate = '',
    cityOrCenter = '',
    districtOrArea = '',
    detailedAddress = '',
    university = '',
    faculty = '',
    churchParish = '',
    studentKey = 'student',
  } = params;

  // Filter candidate clusters for this region
  const candidateClusters = GEO_CLUSTERS.filter((c) => c.regionId === regionId);

  // Combine and normalize full address text tokens
  const fullLocationText = normalizeArabic(
    `${districtOrArea} ${cityOrCenter} ${detailedAddress} ${governorate} ${university} ${faculty} ${churchParish}`
  );

  let bestCluster: GeoClusterDefinition | null = null;
  let highestScore = 0;

  for (const cluster of candidateClusters) {
    let score = 0;

    for (const kw of cluster.keywords) {
      const normKw = normalizeArabic(kw);
      if (!normKw) continue;

      // Higher weight if matched in district or city
      if (normalizeArabic(districtOrArea).includes(normKw)) {
        score += 8;
      }
      if (normalizeArabic(cityOrCenter).includes(normKw)) {
        score += 6;
      }
      if (normalizeArabic(detailedAddress).includes(normKw)) {
        score += 4;
      }
      if (fullLocationText.includes(normKw)) {
        score += 2;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCluster = cluster;
    }
  }

  // Fallback defaults per region if no specific keyword matched
  if (!bestCluster || highestScore === 0) {
    if (regionId === 'cairo-october') {
      // Differentiate between Cairo and 6th of October
      const isOctober =
        fullLocationText.includes('اكتوبر') ||
        fullLocationText.includes('زايد') ||
        fullLocationText.includes('حصري') ||
        university.includes('6 أكتوبر') ||
        university.includes('مصر للعلوم');
      bestCluster = isOctober
        ? candidateClusters.find((c) => c.id === 'october-central-1-5') || candidateClusters[5]
        : candidateClusters.find((c) => c.id === 'cairo-central') || candidateClusters[0];
    } else if (regionId === 'minia') {
      bestCluster = candidateClusters.find((c) => c.id === 'minia-city-university') || candidateClusters[0];
    } else if (regionId === 'beni-suef') {
      bestCluster = candidateClusters.find((c) => c.id === 'benisuef-city-university') || candidateClusters[0];
    } else {
      bestCluster = candidateClusters.find((c) => c.id === 'asyut-city-university') || candidateClusters[0];
    }
  }

  // Add deterministic scatter jitter
  const { latOffset, lngOffset } = generateClusterJitter(studentKey);
  const lat = Number((bestCluster.center.lat + latOffset).toFixed(6));
  const lng = Number((bestCluster.center.lng + lngOffset).toFixed(6));

  return {
    clusterId: bestCluster.id,
    clusterName: bestCluster.name,
    parentZone: bestCluster.parentZone,
    lat,
    lng,
    color: bestCluster.color,
    confidence: highestScore >= 6 ? 'high' : highestScore > 0 ? 'medium' : 'default',
  };
}

/**
 * Returns all clusters for a given region or all regions
 */
export function getClustersForRegion(regionId: RegionId | 'all'): GeoClusterDefinition[] {
  if (regionId === 'all') {
    return GEO_CLUSTERS;
  }
  return GEO_CLUSTERS.filter((c) => c.regionId === regionId);
}
