import React, { useState, useMemo } from 'react';
import {
  Compass,
  Users,
  MapPin,
  GraduationCap,
  Phone,
  Building,
  ShieldCheck,
  PieChart as PieChartIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
} from 'lucide-react';
import { ServiceIdentityConfig, AuthUser, StudentRecord, RegionId } from '../types';
import { REGIONS, COMMON_FACULTIES, INITIAL_IDENTITY_CONFIG } from '../data/constants';
import { FacultyStatsModal } from '../components/FacultyStatsModal';

interface FamilyRegionalPageProps {
  user: AuthUser;
  students: StudentRecord[];
  identityConfig?: ServiceIdentityConfig;
}

export const FamilyRegionalPage: React.FC<FamilyRegionalPageProps> = ({
  user,
  students,
  identityConfig = INITIAL_IDENTITY_CONFIG,
}) => {
  // Active selected family: default to user's assigned region or 'cairo-october'
  const [selectedFamilyId, setSelectedFamilyId] = useState<RegionId>(
    user.role === 'REGIONAL_ADMIN' && user.regionId
      ? user.regionId
      : 'cairo-october'
  );

  // Search & filter within the regional family students
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('all');

  // Pagination for the student table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // On-demand Statistics Modal
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<StudentRecord | null>(null);

  const selectedRegion = REGIONS[selectedFamilyId];

  // Filter students for the selected family
  const familyStudents = useMemo(() => {
    return students.filter((s) => {
      if (s.regionId !== selectedFamilyId) return false;
      if (facultyFilter !== 'all' && s.faculty !== facultyFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(term);
        const matchPhone = s.phone.includes(term);
        const matchFaculty = s.faculty.toLowerCase().includes(term);
        const matchUni = s.university.toLowerCase().includes(term);
        return matchName || matchPhone || matchFaculty || matchUni;
      }
      return true;
    });
  }, [students, selectedFamilyId, facultyFilter, searchTerm]);

  // Pagination calculations
  const totalCount = familyStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return familyStudents.slice(startIndex, startIndex + pageSize);
  }, [familyStudents, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const isUserAssigned =
    user.role === 'REGIONAL_ADMIN' && user.regionId === selectedFamilyId;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header Control Bar with On-Demand Statistics Button */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-amber-400">
              الهيكل التنظيمي وسجلات الأسر الإقليمية
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white">
            {selectedRegion ? selectedRegion.fullName : 'أسر شباب الجامعة'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            متابعة الطلاب المسجلين بالأسرة مع إمكانية عرض إحصائيات الكليات عند الطلب
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* On-Demand Statistics Button */}
          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
            title="عرض المخطط البياني وتوزيع الكليات دون حجب جدول الطلاب"
          >
            <PieChartIcon className="w-4 h-4 text-amber-400" />
            <span>عرض إحصائيات الكليات</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200">
              {students.filter((s) => s.regionId === selectedFamilyId).length} طالب
            </span>
          </button>
        </div>
      </div>

      {/* Regional Family Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {Object.values(REGIONS).map((reg) => {
          const isSelected = selectedFamilyId === reg.id;
          const regStudentsCount = students.filter((s) => s.regionId === reg.id).length;
          const isMyRegion = user.role === 'REGIONAL_ADMIN' && user.regionId === reg.id;
          const logo = identityConfig.familyLogos[reg.id] || INITIAL_IDENTITY_CONFIG.familyLogos[reg.id];

          return (
            <button
              key={reg.id}
              onClick={() => {
                setSelectedFamilyId(reg.id);
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                isSelected
                  ? 'bg-sky-500/15 border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {logo ? (
                <img
                  src={logo}
                  alt={reg.name}
                  className="w-10 h-10 object-contain rounded-lg flex-shrink-0 bg-slate-950 p-0.5 border border-slate-800"
                />
              ) : (
                <Compass className="w-8 h-8 text-sky-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-sky-300' : 'text-white'}`}>
                    {reg.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 font-mono">
                    {regStudentsCount}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {reg.coordinator}
                </div>
                {isMyRegion && (
                  <div className="text-[9px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> أسرتك المعينة
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`بحث في طلاب ${selectedRegion?.name || 'الأسرة'} بالاسم، الكلية، الهاتف...`}
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div>
            <select
              value={facultyFilter}
              onChange={(e) => {
                setFacultyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع الكليات بالأسرة</option>
              {COMMON_FACULTIES.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
          <div>
            الطلاب المعروضون: <strong className="text-white">{totalCount}</strong> طالب في{' '}
            <strong className="text-sky-400">{selectedRegion?.name}</strong>
          </div>

          <div className="flex items-center gap-3">
            {(searchTerm || facultyFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFacultyFilter('all');
                  setCurrentPage(1);
                }}
                className="text-sky-400 hover:underline cursor-pointer"
              >
                إعادة ضبط الفلاتر
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>عرض:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
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

      {/* STUDENT DIRECTORY TABLE WITH FULL VIEWPORT PRIORITY */}
      {familyStudents.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-slate-800 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد سجلات مطابقة في هذه الأسرة</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            لم يتم العثور على أي طالب يطابق معايير البحث الحالية. يمكنك مسح البحث أو تغيير الكلية.
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
                  <th className="p-3.5 font-bold whitespace-nowrap">الفرقة الدراسية</th>
                  <th className="p-3.5 font-bold whitespace-nowrap min-w-[130px]">حالة السكن</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">رقم الهاتف</th>
                  <th className="p-3.5 font-bold text-center whitespace-nowrap">معاينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {paginatedStudents.map((st, index) => {
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
                        <button
                          onClick={() => setSelectedStudentForView(st)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
                          title="عرض تفاصيل الطالب"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER WITH PAGINATION */}
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

      {/* On-Demand Faculty Statistics Modal for this family */}
      <FacultyStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        students={students}
        user={user}
        initialRegionFilter={selectedFamilyId}
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
                <span className="text-slate-400 block text-[11px]">الأسرة:</span>
                <span className="font-bold text-sky-400 mt-0.5 block">
                  {REGIONS[selectedStudentForView.regionId]?.name}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">الفرقة:</span>
                <span className="font-bold text-white mt-0.5 block">
                  {selectedStudentForView.academicYear}
                </span>
              </div>
            </div>

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
