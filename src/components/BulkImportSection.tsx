import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  RefreshCw,
  MapPin,
  Trash2,
  Sparkles,
  ArrowRight,
  Compass,
  Navigation,
  Check,
  X,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { StudentRecord, AuthUser, RegionId, ParsedImportRow, HousingStatus } from '../types';
import { REGIONS, resolveRegionIdFromText } from '../data/constants';
import { generateAndDownloadExcelTemplate } from '../utils/excelTemplate';
import { classifyStudentGeographically } from '../utils/geoClassification';
import {
  buildHeaderMapping,
  sanitizePhoneNumber,
  FIELD_DEFINITIONS,
  HeaderMappingResult,
  MappedDbField,
} from '../utils/excelColumnMapper';

interface BulkImportSectionProps {
  user: AuthUser;
  onImportStudents: (students: Omit<StudentRecord, 'id' | 'registrationDate'>[]) => void;
  onNavigateToStudents?: () => void;
}

export const BulkImportSection: React.FC<BulkImportSectionProps> = ({
  user,
  onImportStudents,
  onNavigateToStudents,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Column Mapping Analysis State
  const [mappingResult, setMappingResult] = useState<HeaderMappingResult | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'invalid'>('all');

  // Summary Modal State
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Download template
  const handleDownloadTemplate = () => {
    generateAndDownloadExcelTemplate();
  };

  // Process uploaded file
  const processFile = async (file: File) => {
    if (!file) return;
    setIsParsing(true);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setImportSuccessMsg(null);
    setImportSuccessCount(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      // First sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawData.length === 0) {
        setParsedRows([]);
        setMappingResult(null);
        setIsParsing(false);
        return;
      }

      // 1. Analyze Spreadsheet Headers for Translation & Mapping
      const sheetHeaders = Object.keys(rawData[0] || {});
      const mapping = buildHeaderMapping(sheetHeaders);
      setMappingResult(mapping);

      // Helper to extract value using mapped header
      const getValue = (row: Record<string, any>, fieldKey: MappedDbField): string => {
        const headerName = mapping.detectedFields[fieldKey];
        if (headerName && row[headerName] !== undefined && row[headerName] !== null) {
          return String(row[headerName]).trim();
        }
        return '';
      };

      // 2. Parse & Validate each row using mapped fields
      const evaluated: ParsedImportRow[] = rawData.map((row, idx) => {
        const errors: string[] = [];

        // Extracted Mapped Attributes
        const rawName = getValue(row, 'fullName');
        const rawPhone = getValue(row, 'phone');
        const rawRegion = getValue(row, 'regionId');
        const rawUniversity = getValue(row, 'university');
        const rawFaculty = getValue(row, 'faculty');
        const rawYear = getValue(row, 'academicYear');
        const rawHousing = getValue(row, 'housingStatus');
        const rawChurch = getValue(row, 'churchParish');
        const rawGov = getValue(row, 'governorate');
        const rawCity = getValue(row, 'cityOrCenter');
        const rawDistrict = getValue(row, 'districtOrArea');
        const rawAddress = getValue(row, 'detailedAddress');
        const rawHousingDetails = getValue(row, 'housingDetails');
        const rawNotes = getValue(row, 'notes');

        // Sanitization & Trimming
        const cleanedName = rawName.replace(/\s+/g, ' ').trim();
        const cleanedPhone = sanitizePhoneNumber(rawPhone);
        const cleanedFaculty = rawFaculty.trim();
        const cleanedUniversity = rawUniversity.trim();

        // Validation 1: Student Name
        if (!cleanedName || cleanedName.length < 3) {
          errors.push('اسم الطالب مفقود أو أقل من 3 أحرف');
        }

        // Validation 2: Egyptian Mobile Phone Number (11 digits starting with 01)
        if (!cleanedPhone || cleanedPhone.length !== 11 || !cleanedPhone.startsWith('01')) {
          errors.push('رقم الهاتف غير صحيح (يجب أن يكون 11 رقماً يبدأ بـ 01)');
        }

        // Validation 3: Faculty
        if (!cleanedFaculty) {
          errors.push('اسم الكلية / التخصص مفقود');
        }

        // Auto-Assignment of Regional Family
        let assignedRegionId: RegionId = 'minia';
        let regionNameLabel = 'أسرة المنيا';

        if (user.role === 'REGIONAL_ADMIN' && user.regionId) {
          // Locked to admin's assigned region
          assignedRegionId = user.regionId;
          regionNameLabel = REGIONS[user.regionId].name;
        } else {
          // General Secretariat: resolve from row text
          const resolved = resolveRegionIdFromText(rawRegion);
          if (resolved) {
            assignedRegionId = resolved;
            regionNameLabel = REGIONS[resolved].name;
          } else {
            errors.push('الأسرة الإقليمية غير محددة أو غير معروفة (يرجى تحديد: المنيا، بني سويف، أسيوط، أو القاهرة)');
          }
        }

        // University fallback
        const resolvedUni =
          cleanedFaculty && !cleanedUniversity
            ? REGIONS[assignedRegionId].universities[0] || 'الجامعة الإقليمية'
            : cleanedUniversity || REGIONS[assignedRegionId].universities[0];

        // Academic Year mapping
        let academicYear: StudentRecord['academicYear'] = 'الفرقة الأولى';
        const yearStr = rawYear.toLowerCase();
        if (yearStr.includes('ثاني') || yearStr.includes('2')) academicYear = 'الفرقة الثانية';
        else if (yearStr.includes('ثالث') || yearStr.includes('3')) academicYear = 'الفرقة الثالثة';
        else if (yearStr.includes('رابع') || yearStr.includes('4')) academicYear = 'الفرقة الرابعة';
        else if (yearStr.includes('خامس') || yearStr.includes('5')) academicYear = 'الفرقة الخامسة';
        else if (yearStr.includes('سادس') || yearStr.includes('6')) academicYear = 'الفرقة السادسة';
        else if (yearStr.includes('عليا') || yearStr.includes('ماجستير')) academicYear = 'دراسات عليا';

        // Housing mapping
        let housingStatus: HousingStatus = 'CAMPUS_HOUSING';
        const houseStr = rawHousing.toLowerCase();
        if (houseStr.includes('خاص') || houseStr.includes('شقة')) housingStatus = 'PRIVATE_RENTAL';
        else if (houseStr.includes('منزل') || houseStr.includes('سفر') || houseStr.includes('يومي')) housingStatus = 'COMMUTER_HOME';

        // Automated Geographic Classification
        const geoResult = classifyStudentGeographically({
          regionId: assignedRegionId,
          governorate: rawGov,
          cityOrCenter: rawCity,
          districtOrArea: rawDistrict,
          detailedAddress: rawAddress || rawHousingDetails,
          university: resolvedUni,
          faculty: cleanedFaculty,
          churchParish: rawChurch,
          studentKey: `${cleanedName}-${idx}`,
        });

        return {
          rowNumber: idx + 2, // Excel 1-based row number
          fullName: cleanedName,
          phone: cleanedPhone,
          university: resolvedUni,
          faculty: cleanedFaculty,
          academicYear,
          regionId: assignedRegionId,
          regionName: regionNameLabel,
          housingStatus,
          churchParish: rawChurch,
          housingDetails: rawAddress || rawHousingDetails,
          notes: rawNotes,
          governorate: rawGov,
          cityOrCenter: rawCity,
          districtOrArea: rawDistrict,
          detailedAddress: rawAddress,
          geoClusterId: geoResult.clusterId,
          geoClusterName: geoResult.clusterName,
          latitude: geoResult.lat,
          longitude: geoResult.lng,
          isValid: errors.length === 0,
          errors,
        };
      });

      setParsedRows(evaluated);
    } catch (err) {
      console.error('Error parsing excel file', err);
      alert('حدث خطأ أثناء قراءة ملف الإكسيل. يرجى التأكد من صيغة الملف (.xlsx أو .csv).');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const displayedRows =
    filterView === 'valid'
      ? validRows
      : filterView === 'invalid'
      ? invalidRows
      : parsedRows;

  // Confirm Import
  const handleConfirmImport = () => {
    if (validRows.length === 0) return;

    const toImport: Omit<StudentRecord, 'id' | 'registrationDate'>[] = validRows.map((r) => ({
      fullName: r.fullName,
      phone: r.phone,
      regionId: r.regionId,
      university: r.university,
      faculty: r.faculty,
      academicYear: r.academicYear,
      housingStatus: r.housingStatus,
      housingDetails: r.housingDetails,
      churchParish: r.churchParish,
      notes: r.notes,
      governorate: r.governorate,
      cityOrCenter: r.cityOrCenter,
      districtOrArea: r.districtOrArea,
      detailedAddress: r.detailedAddress,
      geoClusterId: r.geoClusterId,
      geoClusterName: r.geoClusterName,
      latitude: r.latitude,
      longitude: r.longitude,
    }));

    onImportStudents(toImport);
    setImportSuccessCount(validRows.length);
    setImportSuccessMsg(
      `تم استيراد وحفظ ${validRows.length} طالباً بنجاح في قاعدة البيانات وتصنيفهم جغرافياً!`
    );
    setIsSummaryModalOpen(true);
  };

  const handleClear = () => {
    setParsedRows([]);
    setMappingResult(null);
    setFileName(null);
    setFileSize(null);
    setImportSuccessMsg(null);
    setImportSuccessCount(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Template Banner */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              استيراد مجمّع (Bulk Excel Translation & Import)
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white">
            محرك استيراد ومطابقة أعمدة ملفات Excel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            محرك ذكي لترجمة ومطابقة أعمدة الإكسيل العربية والإنجليزية مع قاعدة البيانات وتصفية الأخطاء مع تصنيف موقع الطالب جغرافياً.
          </p>
        </div>

        {/* Template Download Button */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>تحميل نموذج الإكسيل المعتمد (.xlsx)</span>
        </button>
      </div>

      {/* Upload Dropzone */}
      {parsedRows.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-card rounded-2xl p-8 sm:p-12 border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
            isDragging
              ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-sky-500/60 hover:bg-slate-800/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white">
            اضغط هنا لاختيار ملف الإكسيل أو اسحبه وأفلته هنا
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            يدعم الملفات بصيغة <span className="text-sky-300 font-mono font-semibold">.XLSX</span> أو{' '}
            <span className="text-sky-300 font-mono font-semibold">.XLS</span> أو{' '}
            <span className="text-sky-300 font-mono font-semibold">.CSV</span>
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-[11px] text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>محرك الترجمة يطابق عناوين الأعمدة العربية والإنجليزية تلقائياً</span>
          </div>

          {isParsing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-2 text-sky-400 text-sm font-bold">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>جاري تحليل ومطابقة أعمدة ملف الإكسيل...</span>
            </div>
          )}
        </div>
      )}

      {/* Parsed Results & Column Mapping Analysis */}
      {parsedRows.length > 0 && mappingResult && (
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-2xl space-y-5">
          {/* File Overview and Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>معاينة وتحليل الملف:</span>
                  <span className="text-xs text-sky-400 font-mono">{fileName}</span>
                  {fileSize && <span className="text-[10px] text-slate-400">({fileSize})</span>}
                </h3>
                <p className="text-xs text-slate-400">
                  تم فحص ومطابقة الأعمدة والتحقق من صحة البيانات المسجلة بالصفوف.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>إلغاء واختيار ملف آخر</span>
              </button>

              <button
                type="button"
                disabled={validRows.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد واستيراد السجلات الصالحة ({validRows.length})</span>
              </button>
            </div>
          </div>

          {/* Missing Required Fields Alert Banner */}
          {mappingResult.missingRequiredFields.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">تنبيه لمطابقة هيدر الملف:</span>
                <span>
                  لم يتم العثور على حقول إجبارية بالملف:{' '}
                  <strong className="text-white">
                    {mappingResult.missingRequiredFields.map((f) => f.labelArabic).join('، ')}
                  </strong>
                  . يرجى مراجعة عناوين الأعمدة في ملفك أو استخدام النموذج المعتمد.
                </span>
              </div>
            </div>
          )}

          {/* COLUMN MAPPING BREAKDOWN CARD */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>مطابقة الهيكل الديناميكي مع قواعد بيانات Supabase (Schema Matching):</span>
              </span>
              <span className="text-[10px] text-slate-400">
                الحقول المطابقة:{' '}
                <strong className="text-emerald-400">
                  {Object.keys(mappingResult.detectedFields).length}
                </strong>{' '}
                من {FIELD_DEFINITIONS.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px]">
              {FIELD_DEFINITIONS.map((def) => {
                const matchedHeader = mappingResult.detectedFields[def.fieldKey];
                return (
                  <div
                    key={def.fieldKey}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1 ${
                      matchedHeader
                        ? 'bg-slate-800/80 border-emerald-500/40 text-slate-200'
                        : def.required
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span>{def.labelArabic}</span>
                      {matchedHeader ? (
                        <span className="text-emerald-400 font-bold">✓ مطابق</span>
                      ) : def.required ? (
                        <span className="text-rose-400 font-bold">! مفقود</span>
                      ) : (
                        <span className="text-slate-500">اختياري</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono truncate text-sky-300" title={matchedHeader}>
                      {matchedHeader ? `← "${matchedHeader}"` : '— غير موجود بالملف'}
                    </div>
                    <div className="text-[9px] font-mono text-amber-400/90 pt-0.5 border-t border-slate-800/60 flex items-center justify-between">
                      <span>العمود بقاعدة البيانات:</span>
                      <span className="font-bold text-sky-400">{def.supabaseColumn}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Metrics Badges & Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterView('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterView === 'all'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                إجمالي السجلات المقروءة ({parsedRows.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterView('valid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterView === 'valid'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>جاهزة للحفظ بـ Supabase ({validRows.length})</span>
              </button>

              {invalidRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterView('invalid')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterView === 'invalid'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-slate-900 text-rose-400 hover:bg-slate-800 border border-rose-500/30'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>تتطلب تصحيح ({invalidRows.length})</span>
                </button>
              )}
            </div>

            {invalidRows.length > 0 && (
              <span className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                سيتم رفع الصفوف المستوفية فقط واستثناء الصفوف غير الصالحة تلقائياً
              </span>
            )}
          </div>

          {/* Interactive Preview Table with Explicit Supabase Attributes */}
          <div className="overflow-x-auto rounded-xl border border-slate-700/80">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-700/80">
                <tr>
                  <th className="p-3 font-bold w-12 text-center">#</th>
                  <th className="p-3 font-bold">
                    <div>اسم الطالب</div>
                    <div className="text-[9px] font-mono text-sky-400 font-normal">full_name</div>
                  </th>
                  <th className="p-3 font-bold">
                    <div>الهاتف المحمول</div>
                    <div className="text-[9px] font-mono text-sky-400 font-normal">phone</div>
                  </th>
                  <th className="p-3 font-bold">
                    <div>الأسرة الإقليمية</div>
                    <div className="text-[9px] font-mono text-sky-400 font-normal">region_id / family_id</div>
                  </th>
                  <th className="p-3 font-bold">
                    <div>الكلية والجامعة</div>
                    <div className="text-[9px] font-mono text-sky-400 font-normal">faculty, university</div>
                  </th>
                  <th className="p-3 font-bold">
                    <div>التصنيف والحي</div>
                    <div className="text-[9px] font-mono text-sky-400 font-normal">city_or_center, district_or_area</div>
                  </th>
                  <th className="p-3 font-bold">
                    <div>السنة الدراسية</div>
                    <div className="text-[9px] font-mono text-sky-400 font-normal">academic_year</div>
                  </th>
                  <th className="p-3 font-bold text-center">حالة الفحص والمطابقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {displayedRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      !row.isValid ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="p-3 text-center text-slate-400 font-mono">{row.rowNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{row.fullName || '— مفقود —'}</div>
                      {row.churchParish && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{row.churchParish}</div>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-300" dir="ltr">
                      {row.phone || '—'}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-800/60 font-semibold text-[11px]">
                        <MapPin className="w-3 h-3 text-sky-400" />
                        {row.regionName}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-amber-300">{row.faculty || '— مفقود —'}</div>
                      <div className="text-[10px] text-slate-400">{row.university}</div>
                    </td>
                    <td className="p-3">
                      {row.geoClusterName ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            <Compass className="w-3 h-3 text-emerald-400" />
                            {row.geoClusterName}
                          </span>
                          {(row.districtOrArea || row.cityOrCenter) && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Navigation className="w-2.5 h-2.5 text-sky-400" />
                              <span>{row.districtOrArea || row.cityOrCenter}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">{row.academicYear}</td>
                    <td className="p-3 text-center">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>مطابق وجاهز</span>
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            <span>غير صالح</span>
                          </span>
                          <div className="text-[10px] text-rose-400 max-w-xs text-right">
                            {row.errors.join(' • ')}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUMMARY MODAL AFTER IMPORT */}
      {isSummaryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSummaryModalOpen(false);
          }}
        >
          <div className="glass-card w-full max-w-lg rounded-2xl border border-emerald-500/40 shadow-2xl p-6 bg-slate-900/95 space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">تقرير اكتمال الاستيراد والمزامنة</h3>
                  <p className="text-xs text-slate-400">منصة الأمانة العامة - قاعدة بيانات Supabase</p>
                </div>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 block text-[11px]">إجمالي الصفوف المقروءة:</span>
                <span className="text-lg font-black text-white mt-1 block font-mono">
                  {parsedRows.length}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-emerald-400 block text-[11px]">تم استيرادهم بنجاح:</span>
                <span className="text-lg font-black text-emerald-300 mt-1 block font-mono">
                  {importSuccessCount || 0}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-xl border border-slate-700">
              {importSuccessMsg}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  setIsSummaryModalOpen(false);
                  handleClear();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                إغلاق ورفع ملف جديد
              </button>

              {onNavigateToStudents && (
                <button
                  onClick={() => {
                    setIsSummaryModalOpen(false);
                    onNavigateToStudents();
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>عرض سجل الطلاب</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
