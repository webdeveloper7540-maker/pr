import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  MapPin,
  Sparkles,
  RefreshCw,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  FileSpreadsheet,
  UserPlus,
  KeyRound,
  Eye,
  Edit,
  SlidersHorizontal,
  Crown,
} from 'lucide-react';
import { AuthUser, StudentRecord, RegionId, ActivePage, RegionalAccount } from '../types';
import { REGIONS, COMMON_FACULTIES } from '../data/constants';
import { FacultyStatsModal } from '../components/FacultyStatsModal';
import { AccountManagementSection } from '../components/AccountManagementSection';

interface AdminDashboardPageProps {
  user: AuthUser;
  students: StudentRecord[];
  accounts: RegionalAccount[];
  onUpdateAccount: (account: RegionalAccount) => void;
  onResetAccountsToDefault?: () => void;
  onOpenAddStudent: () => void;
  onNavigate: (page: ActivePage) => void;
  onResetData?: () => void;
  onDeleteStudent?: (id: string) => void;
  onEditStudent?: (student: StudentRecord) => void;
  onOpenIdentitySettings?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  user,
  students,
  accounts,
  onUpdateAccount,
  onResetAccountsToDefault,
  onOpenAddStudent,
  onNavigate,
  onResetData,
  onDeleteStudent,
  onEditStudent,
  onOpenIdentitySettings,
}) => {
  // Region filter: locked to assigned region for Regional Admin, or selectable for General Secretariat
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>(
    user.role === 'REGIONAL_ADMIN' && user.regionId ? user.regionId : 'all'
  );

  // Search & Filters within the student directory
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedHousing, setSelectedHousing] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Modal State for On-Demand Faculty Statistics
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Detail Modal for Student
  const [selectedStudentForView, setSelectedStudentForView] = useState<StudentRecord | null>(null);

  // Filter students based on region selection and active search filters
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Role enforcement
      if (user.role === 'REGIONAL_ADMIN' && user.regionId && s.regionId !== user.regionId) {
        return false;
      }
      // Region filter for General Secretariat
      if (selectedRegionFilter !== 'all' && s.regionId !== selectedRegionFilter) {
        return false;
      }
      // Faculty / Branch filter
      if (selectedFaculty !== 'all' && s.faculty !== selectedFaculty) {
        return false;
      }
      // Housing filter
      if (selectedHousing !== 'all' && s.housingStatus !== selectedHousing) {
        return false;
      }
      // Academic year filter
      if (selectedYear !== 'all' && s.academicYear !== selectedYear) {
        return false;
      }
      // Text search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(term);
        const matchPhone = s.phone.includes(term);
        const matchFaculty = s.faculty.toLowerCase().includes(term);
        const matchUniversity = s.university.toLowerCase().includes(term);
        const matchParish = s.churchParish?.toLowerCase().includes(term);
        return matchName || matchPhone || matchFaculty || matchUniversity || matchParish;
      }
      return true;
    });
  }, [students, user, selectedRegionFilter, selectedFaculty, selectedHousing, selectedYear, searchTerm]);

  // Reset to page 1 whenever filters change
  const totalCount = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Current page records slice
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Quick count for active region or all
  const activeRegionObj =
    selectedRegionFilter !== 'all' ? REGIONS[selectedRegionFilter as RegionId] : null;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header Control Bar with On-Demand Statistics Button */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                قاعدة بيانات الطلاب المسجلين
              </span>
              <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {totalCount} طالب مقيد
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {user.role === 'GENERAL_SECRETARIAT'
                ? 'لوحة إدارة طلاب أسر الجامعة المركزية'
                : `إدارة طلاب ${user.regionId ? REGIONS[user.regionId].name : 'الأسرة الإقليمية'}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              عرض مباشر وسريع لكافة السجلات الطلابية مع التصفية والبحث الفوري والتحكم الكامل في السجلات.
            </p>
          </div>

          {/* Action Buttons in Header Control Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* CORE REQUIREMENT: Compact "عرض إحصائيات الكليات" button */}
            <button
              onClick={() => setIsStatsModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
              title="عرض المخطط البياني وتوزيع الكليات في نافذة منبثقة دون حجب الجدول"
            >
              <PieChartIcon className="w-4 h-4 text-amber-400" />
              <span>عرض إحصائيات الكليات</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 font-mono">
                مخطط بياني
              </span>
            </button>

            {/* Interactive Student Map Button */}
            <button
              onClick={() => onNavigate('geomap')}
              className="px-3.5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 hover:border-sky-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              title="عرض الخريطة التفاعلية والتصنيف الجغرافي للطلاب"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>خريطة الطلاب</span>
            </button>

            {/* Add Student Button */}
            <button
              onClick={onOpenAddStudent}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>تسجيل طالب جديد</span>
            </button>

            {/* Bulk Excel Import Button */}
            <button
              onClick={() => onNavigate('bulk-import')}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">استيراد إكسيل</span>
            </button>

            {/* Leadership Directory Shortcut (Admin only) */}
            {user.role === 'GENERAL_SECRETARIAT' && (
              <button
                onClick={() => onNavigate('leadership')}
                className="px-3 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="إدارة الهيكل الإداري والكهنة وأمناء الأسر والخدام"
              >
                <Crown className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">الهيكل والخدام</span>
              </button>
            )}

            {/* Security Accounts Management (Admin only) */}
            {user.role === 'GENERAL_SECRETARIAT' && (
              <button
                onClick={() => {
                  const el = document.getElementById('security-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onNavigate('security');
                  }
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">أمان الحسابات</span>
              </button>
            )}

            {/* Identity & Footer Settings (Admin only) */}
            {user.role === 'GENERAL_SECRETARIAT' && onOpenIdentitySettings && (
              <button
                onClick={onOpenIdentitySettings}
                className="px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="تعديل لوجو الأمانة، لوجو الأسر، الرؤية والرسالة، وأرقام الفوتر"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">الهوية والفوتر</span>
              </button>
            )}

            {/* Reset Data Button */}
            {onResetData && (
              <button
                onClick={onResetData}
                title="استعادة البيانات الاسترشادية الأصلية"
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Region Filter Bar (if General Secretariat) */}
        {user.role === 'GENERAL_SECRETARIAT' && (
          <div className="mt-4 pt-3.5 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-1">
              <Filter className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold">الأسرة الإقليمية:</span>
            </div>
            <button
              onClick={() => {
                setSelectedRegionFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRegionFilter === 'all'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/80'
              }`}
            >
              جميع الأسر ({students.length})
            </button>
            {Object.values(REGIONS).map((reg) => {
              const regCount = students.filter((s) => s.regionId === reg.id).length;
              const isSelected = selectedRegionFilter === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => {
                    setSelectedRegionFilter(reg.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/80'
                  }`}
                >
                  <span>{reg.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-sky-700 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {regCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="بحث بالاسم، الكلية، الجامعة، الهاتف، الكنيسة..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Faculty Filter */}
          <div>
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع الكليات والفروع</option>
              {COMMON_FACULTIES.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          {/* Housing Status Filter */}
          <div>
            <select
              value={selectedHousing}
              onChange={(e) => {
                setSelectedHousing(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع حالات الإقامة</option>
              <option value="CAMPUS_HOUSING">مدينة جامعية</option>
              <option value="PRIVATE_RENTAL">سكن خاص / تابع للخدمة</option>
              <option value="COMMUTER_HOME">مقيم بالمنزل (مسافر يومياً)</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع السنوات الدراسية</option>
              <option value="الفرقة الأولى">الفرقة الأولى</option>
              <option value="الفرقة الثانية">الفرقة الثانية</option>
              <option value="الفرقة الثالثة">الفرقة الثالثة</option>
              <option value="الفرقة الرابعة">الفرقة الرابعة</option>
              <option value="الفرقة الخامسة">الفرقة الخامسة</option>
              <option value="الفرقة السادسة / الامتياز">الفرقة السادسة / الامتياز</option>
              <option value="دراسات عليا / ماجستير">دراسات عليا / ماجستير</option>
            </select>
          </div>
        </div>

        {/* Filter stats & Reset bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              إجمالي النتائج: <strong className="text-white font-bold">{totalCount}</strong> طالب
            </span>
            {selectedRegionFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-800 text-[11px]">
                نطاق: {activeRegionObj?.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {(searchTerm || selectedFaculty !== 'all' || selectedHousing !== 'all' || selectedYear !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFaculty('all');
                  setSelectedHousing('all');
                  setSelectedYear('all');
                  setCurrentPage(1);
                }}
                className="text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
              >
                مسح معايير البحث
              </button>
            )}

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>عرض في الصفحة:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CORE VIEWPORT OPTIMIZATION: MAIN STUDENT DIRECTORY TABLE */}
      {filteredStudents.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد سجلات مطابقة لمعايير البحث</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            يمكنك مسح البحث أو الضغط على زر "تسجيل طالب جديد" أو "استيراد إكسيل" لإضافة بيانات جديدة.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFaculty('all');
                setSelectedHousing('all');
                setSelectedYear('all');
                if (user.role === 'GENERAL_SECRETARIAT') setSelectedRegionFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              عرض كل الطلاب
            </button>
            <button
              onClick={onOpenAddStudent}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold cursor-pointer"
            >
              تسجيل طالب جديد
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col">
          {/* Table Container with priority height */}
          <div className="overflow-x-auto min-h-[380px] max-h-[650px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/90 sticky top-0 z-20 border-b border-slate-700 text-slate-300 backdrop-blur-md">
                <tr>
                  <th className="p-3.5 font-bold whitespace-nowrap">#</th>
                  <th className="p-3.5 font-bold whitespace-nowrap min-w-[170px]">اسم الطالب</th>
                  <th className="p-3.5 font-bold whitespace-nowrap min-w-[170px]">الكلية والجامعة</th>
                  <th className="p-3.5 font-bold whitespace-nowrap min-w-[130px]">الأسرة الإقليمية</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">الفرقة الدراسية</th>
                  <th className="p-3.5 font-bold whitespace-nowrap min-w-[130px]">حالة السكن</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">رقم الهاتف</th>
                  <th className="p-3.5 font-bold text-center whitespace-nowrap">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {paginatedStudents.map((st, index) => {
                  const reg = REGIONS[st.regionId];
                  const absoluteIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {absoluteIndex}
                      </td>

                      {/* Name & Parish */}
                      <td className="p-3.5">
                        <div className="font-bold text-white group-hover:text-sky-300 transition-colors">
                          {st.fullName}
                        </div>
                        {st.churchParish && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                            {st.churchParish}
                          </div>
                        )}
                      </td>

                      {/* Faculty & University */}
                      <td className="p-3.5">
                        <div className="font-semibold text-amber-300">{st.faculty}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {st.university}
                        </div>
                      </td>

                      {/* Regional Family */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-800/60 font-medium text-[11px] whitespace-nowrap">
                          <MapPin className="w-3 h-3 text-sky-400" />
                          {reg ? reg.name : st.regionId}
                        </span>
                      </td>

                      {/* Academic Year */}
                      <td className="p-3.5 text-slate-300 whitespace-nowrap">
                        {st.academicYear}
                      </td>

                      {/* Housing Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {st.housingStatus === 'CAMPUS_HOUSING' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                            مدينة جامعية
                          </span>
                        )}
                        {st.housingStatus === 'PRIVATE_RENTAL' && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-semibold">
                            سكن خاص
                          </span>
                        )}
                        {st.housingStatus === 'COMMUTER_HOME' && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">
                            مسافر يومياً
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap" dir="ltr">
                        <a
                          href={`tel:${st.phone}`}
                          className="hover:text-sky-400 hover:underline"
                        >
                          {st.phone}
                        </a>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudentForView(st)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
                            title="عرض تفاصيل الطالب"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onEditStudent && (
                            <button
                              onClick={() => onEditStudent(st)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                              title="تعديل بيانات الطالب"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {onDeleteStudent && (
                            <button
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف الطالب ${st.fullName} من السجل؟`)) {
                                  onDeleteStudent(st.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="حذف الطالب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER WITH PAGINATION CONTROLS */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              عرض <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> إلى{' '}
              <strong className="text-white">
                {Math.min(currentPage * pageSize, totalCount)}
              </strong>{' '}
              من أصل <strong className="text-sky-400">{totalCount}</strong> طالباً
              {totalPages > 1 && (
                <span className="mr-2 text-slate-500">
                  (الصفحة {currentPage} من {totalPages})
                </span>
              )}
            </div>

            {/* Pagination Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="الصفحة الأولى"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>

                {/* Prev Page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Page Number Chips */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Show current page, first, last, and immediate neighbors
                      return (
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1
                      );
                    })
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;

                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && (
                            <span className="px-1 text-slate-500 text-xs">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentPage === p
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="الصفحة الأخيرة"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REGIONAL FAMILIES OVERVIEW (COMPACT CARDS AT BOTTOM) */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-700/80">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              الأسر الإقليمية التابعة للإيبارشية
            </h2>
            <p className="text-xs text-slate-400">
              توزيع الطلاب والجامعات حسب مناطق المنيا، بني سويف، أسيوط، والقاهرة و٦ أكتوبر
            </p>
          </div>
          <button
            onClick={() => onNavigate('families')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline cursor-pointer"
          >
            عرض الهيكل الكامل
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(REGIONS).map((region) => {
            const regionCount = students.filter((s) => s.regionId === region.id).length;
            const isUserRegion = user.role === 'REGIONAL_ADMIN' && user.regionId === region.id;
            const isSelected = selectedRegionFilter === region.id;

            return (
              <div
                key={region.id}
                onClick={() => {
                  if (user.role === 'GENERAL_SECRETARIAT') {
                    setSelectedRegionFilter(region.id);
                    setCurrentPage(1);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all ${
                  user.role === 'GENERAL_SECRETARIAT' ? 'cursor-pointer' : ''
                } ${
                  isSelected || isUserRegion
                    ? 'bg-sky-950/40 border-sky-500/70 ring-1 ring-sky-500/40 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{region.name}</span>
                  <div className="p-1 rounded-lg bg-sky-500/20 text-sky-400">
                    <MapPin className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">الطلاب المسجلين:</span>
                  <span className="font-bold text-amber-400">{regionCount} طالب</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>المنسق:</span>
                  <span className="text-slate-300">{region.coordinator}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACCOUNT & PASSWORD MANAGEMENT SECTION FOR GENERAL SECRETARIAT */}
      {user.role === 'GENERAL_SECRETARIAT' && (
        <div id="security-section">
          <AccountManagementSection
            accounts={accounts}
            onUpdateAccount={onUpdateAccount}
            onResetAllToDefault={onResetAccountsToDefault || (() => {})}
          />
        </div>
      )}

      {/* ON-DEMAND FACULTY STATISTICS MODAL */}
      <FacultyStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        students={students}
        user={user}
        initialRegionFilter={selectedRegionFilter}
      />

      {/* STUDENT DETAIL MODAL */}
      {selectedStudentForView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudentForView(null);
          }}
        >
          <div className="glass-card w-full max-w-lg rounded-2xl border border-sky-500/40 shadow-2xl p-5 sm:p-6 bg-slate-900/95 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  بطاقة بيانات الطالب
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedStudentForView.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">الكلية:</span>
                <span className="font-bold text-amber-300 mt-0.5 block">
                  {selectedStudentForView.faculty}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">الجامعة:</span>
                <span className="font-bold text-white mt-0.5 block">
                  {selectedStudentForView.university}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">الأسرة الإقليمية:</span>
                <span className="font-bold text-sky-400 mt-0.5 block">
                  {REGIONS[selectedStudentForView.regionId]?.name || selectedStudentForView.regionId}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">الفرقة الدراسية:</span>
                <span className="font-bold text-white mt-0.5 block">
                  {selectedStudentForView.academicYear}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">حالة السكن:</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">
                  {selectedStudentForView.housingStatus === 'CAMPUS_HOUSING'
                    ? 'مدينة جامعية'
                    : selectedStudentForView.housingStatus === 'PRIVATE_RENTAL'
                    ? 'سكن خاص'
                    : 'مسافر يومياً'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">رقم الهاتف:</span>
                <span className="font-mono text-white mt-0.5 block" dir="ltr">
                  {selectedStudentForView.phone}
                </span>
              </div>
            </div>

            {selectedStudentForView.housingDetails && (
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
                <span className="text-slate-400 block text-[11px]">تفاصيل ومقر السكن:</span>
                <span className="text-slate-200 mt-0.5 block">
                  {selectedStudentForView.housingDetails}
                </span>
              </div>
            )}

            {selectedStudentForView.churchParish && (
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
                <span className="text-slate-400 block text-[11px]">الكنيسة التابع لها بالإيبارشية:</span>
                <span className="text-slate-200 mt-0.5 block">
                  {selectedStudentForView.churchParish}
                </span>
              </div>
            )}

            {selectedStudentForView.notes && (
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
                <span className="text-slate-400 block text-[11px]">ملاحظات الخدمة:</span>
                <span className="text-slate-200 mt-0.5 block">
                  {selectedStudentForView.notes}
                </span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
