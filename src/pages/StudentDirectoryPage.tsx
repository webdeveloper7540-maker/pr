import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Trash2,
  GraduationCap,
  MapPin,
  FileSpreadsheet,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Edit,
} from 'lucide-react';
import { StudentRecord, AuthUser, RegionId } from '../types';
import { REGIONS, COMMON_FACULTIES } from '../data/constants';
import { FacultyStatsModal } from '../components/FacultyStatsModal';

interface StudentDirectoryPageProps {
  user: AuthUser;
  students: StudentRecord[];
  onOpenAddStudent: () => void;
  onDeleteStudent: (id: string) => void;
  onNavigateToBulkImport?: () => void;
  onEditStudent?: (student: StudentRecord) => void;
}

export const StudentDirectoryPage: React.FC<StudentDirectoryPageProps> = ({
  user,
  students,
  onOpenAddStudent,
  onDeleteStudent,
  onNavigateToBulkImport,
  onEditStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedHousing, setSelectedHousing] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>(
    user.role === 'REGIONAL_ADMIN' && user.regionId ? user.regionId : 'all'
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Modal State for On-Demand Faculty Statistics
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<StudentRecord | null>(null);

  // Filter students based on role and active search/filters
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Role enforcement
      if (user.role === 'REGIONAL_ADMIN' && user.regionId && s.regionId !== user.regionId) {
        return false;
      }
      // Region filter for General Secretariat
      if (selectedRegion !== 'all' && s.regionId !== selectedRegion) {
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
      // Year filter
      if (selectedYear !== 'all' && s.academicYear !== selectedYear) {
        return false;
      }
      // Search term
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
  }, [students, user, selectedRegion, selectedFaculty, selectedHousing, selectedYear, searchTerm]);

  // Pagination calculations
  const totalCount = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-400">قاعدة البيانات الطلابية</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white">سجل طلاب أسر الجامعة</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {user.role === 'GENERAL_SECRETARIAT'
              ? 'إدارة وحصر جميع الطلاب المسجلين بكافة الأسر الإقليمية والجامعات'
              : `إدارة الطلاب المسجلين بـ ${user.regionId ? REGIONS[user.regionId].name : 'الأسرة الإقليمية'}`}
          </p>
        </div>

        {/* Action Buttons in Header Control Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* On-Demand Statistics Button */}
          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
            title="عرض المخطط البياني وتوزيع الكليات في نافذة منبثقة"
          >
            <PieChartIcon className="w-4 h-4 text-amber-400" />
            <span>عرض إحصائيات الكليات</span>
          </button>

          {onNavigateToBulkImport && (
            <button
              onClick={onNavigateToBulkImport}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>استيراد إكسيل</span>
            </button>
          )}

          <button
            onClick={onOpenAddStudent}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="بحث بالاسم، الكلية، الهاتف، الكنيسة..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Region Filter (only if General Secretariat) */}
          {user.role === 'GENERAL_SECRETARIAT' && (
            <div>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="all">جميع الأسر الإقليمية</option>
                {Object.values(REGIONS).map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              <option value="all">جميع الفروع والكليات</option>
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
        </div>

        {/* Counter of results and Page size */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span>
              إجمالي النتائج: <strong className="text-white">{totalCount}</strong> طالب
            </span>
          </div>

          <div className="flex items-center gap-3">
            {(searchTerm || selectedFaculty !== 'all' || selectedHousing !== 'all' || selectedRegion !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFaculty('all');
                  setSelectedHousing('all');
                  if (user.role === 'GENERAL_SECRETARIAT') setSelectedRegion('all');
                  setCurrentPage(1);
                }}
                className="text-sky-400 hover:underline cursor-pointer"
              >
                إعادة ضبط الفلاتر
              </button>
            )}

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

      {/* Students List / Table */}
      {filteredStudents.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-slate-800 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد سجلات مطابقة</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            لم يتم العثور على أي طالب يطابق معايير البحث الحالية. يمكنك تعديل البحث أو إضافة طالب جديد.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl flex flex-col">
          <div className="overflow-x-auto min-h-[380px] max-h-[650px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/90 sticky top-0 z-20 border-b border-slate-700 text-slate-300 backdrop-blur-md">
                <tr>
                  <th className="p-3.5 font-bold whitespace-nowrap">#</th>
                  <th className="p-3.5 font-bold whitespace-nowrap min-w-[170px]">اسم الطالب</th>
                  <th className="p-3.5 font-bold whitespace-nowrap min-w-[170px]">الكلية والجامعة</th>
                  <th className="p-3.5 font-bold whitespace-nowrap min-w-[130px]">الأسرة الإقليمية</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">السنة الدراسية</th>
                  <th className="p-3.5 font-bold whitespace-nowrap min-w-[130px]">حالة السكن</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">الهاتف</th>
                  <th className="p-3.5 font-bold text-center whitespace-nowrap">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {paginatedStudents.map((st, index) => {
                  const reg = REGIONS[st.regionId];
                  const absoluteIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {absoluteIndex}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white group-hover:text-sky-300 transition-colors">
                          {st.fullName}
                        </div>
                        {st.churchParish && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{st.churchParish}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-amber-300">{st.faculty}</div>
                        <div className="text-[10px] text-slate-400">{st.university}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-800/60 font-medium text-[11px] whitespace-nowrap">
                          <MapPin className="w-3 h-3 text-sky-400" />
                          {reg ? reg.name : st.regionId}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 whitespace-nowrap">{st.academicYear}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        {st.housingStatus === 'CAMPUS_HOUSING' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold">
                            مدينة جامعية
                          </span>
                        )}
                        {st.housingStatus === 'PRIVATE_RENTAL' && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-semibold">
                            سكن خاص
                          </span>
                        )}
                        {st.housingStatus === 'COMMUTER_HOME' && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                            مسافر يومياً
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap" dir="ltr">
                        <a href={`tel:${st.phone}`} className="hover:text-sky-400 hover:underline">
                          {st.phone}
                        </a>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudentForView(st)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
                            title="عرض التفاصيل"
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
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف الطالب ${st.fullName} من السجل؟`)) {
                                onDeleteStudent(st.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="حذف الطالب من السجل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
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

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="الصفحة الأولى"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span className="px-1 text-slate-500 text-xs">...</span>}
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

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="الصفحة الأخيرة"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* On-Demand Faculty Statistics Modal */}
      <FacultyStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        students={students}
        user={user}
        initialRegionFilter={selectedRegion}
      />

      {/* Student Detail Modal */}
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
