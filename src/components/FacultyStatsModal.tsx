import React, { useState, useMemo } from 'react';
import {
  X,
  PieChart as PieChartIcon,
  GraduationCap,
  Users,
  Home,
  Building,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { StudentRecord, AuthUser, RegionId } from '../types';
import { REGIONS, CHART_PALETTE } from '../data/constants';

interface FacultyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  user: AuthUser;
  initialRegionFilter?: string;
}

export const FacultyStatsModal: React.FC<FacultyStatsModalProps> = ({
  isOpen,
  onClose,
  students,
  user,
  initialRegionFilter = 'all',
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(
    user.role === 'REGIONAL_ADMIN' && user.regionId ? user.regionId : initialRegionFilter
  );
  const [facultySearch, setFacultySearch] = useState('');

  // Filter students based on region selection
  const relevantStudents = useMemo(() => {
    if (user.role === 'REGIONAL_ADMIN' && user.regionId) {
      return students.filter((s) => s.regionId === user.regionId);
    }
    if (selectedRegion === 'all') {
      return students;
    }
    return students.filter((s) => s.regionId === selectedRegion);
  }, [students, user, selectedRegion]);

  // Aggregate student distribution by faculty
  const facultyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    relevantStudents.forEach((student) => {
      const branchName = student.faculty || 'غير محدد';
      counts[branchName] = (counts[branchName] || 0) + 1;
    });

    const total = relevantStudents.length || 1;

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: ((value / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);
  }, [relevantStudents]);

  // Filtered faculty list for search
  const filteredFacultyList = useMemo(() => {
    if (!facultySearch.trim()) return facultyDistribution;
    const term = facultySearch.trim().toLowerCase();
    return facultyDistribution.filter((f) => f.name.toLowerCase().includes(term));
  }, [facultyDistribution, facultySearch]);

  // Quick KPIs for the selected subset
  const totalCount = relevantStudents.length;
  const campusHousingCount = relevantStudents.filter((s) => s.housingStatus === 'CAMPUS_HOUSING').length;
  const privateRentalCount = relevantStudents.filter((s) => s.housingStatus === 'PRIVATE_RENTAL').length;
  const commuterCount = relevantStudents.filter((s) => s.housingStatus === 'COMMUTER_HOME').length;
  const uniqueFacultiesCount = facultyDistribution.length;

  if (!isOpen) return null;

  // Custom tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="glass-dropdown p-3 rounded-xl border border-sky-500/40 shadow-2xl text-right text-xs space-y-1.5 z-50">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span
              className="w-3 h-3 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: item.payload.fill || item.color }}
            />
            <span>{item.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>عدد الطلاب:</span>
            <span className="font-bold text-sky-400">{item.value} طالب</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>النسبة من الإجمالي:</span>
            <span className="font-bold text-amber-400">{item.payload.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentRegionName =
    selectedRegion === 'all'
      ? 'جميع الأسر الإقليمية'
      : REGIONS[selectedRegion as RegionId]?.name || selectedRegion;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-card w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-sky-500/30 shadow-2xl overflow-hidden bg-slate-900/95 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 flex items-center justify-between bg-slate-900/90 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-sky-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  إحصائيات وتحليلات توزيع الكليات
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {currentRegionName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مخطط بياني تفاعلي يوضح نسب تمثيل الطلاب حسب الكليات والتخصصات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Region Filter Bar (if General Secretariat) */}
        {user.role === 'GENERAL_SECRETARIAT' && (
          <div className="px-4 sm:px-5 py-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-1">
              <Filter className="w-3.5 h-3.5 text-sky-400" />
              <span>نطاق التحليل:</span>
            </div>
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedRegion === 'all'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              جميع الأسر ({students.length})
            </button>
            {Object.values(REGIONS).map((reg) => {
              const count = students.filter((s) => s.regionId === reg.id).length;
              const isSelected = selectedRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{reg.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-sky-700 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>إجمالي الطلاب</span>
              </div>
              <div className="text-xl font-black text-white">{totalCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>عدد الكليات</span>
              </div>
              <div className="text-xl font-black text-amber-400">{uniqueFacultiesCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>المدينة والسكن</span>
              </div>
              <div className="text-xl font-black text-emerald-400">
                {campusHousingCount + privateRentalCount}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Building className="w-3.5 h-3.5 text-purple-400" />
                <span>مسافر يومياً</span>
              </div>
              <div className="text-xl font-black text-purple-300">{commuterCount}</div>
            </div>
          </div>

          {totalCount === 0 ? (
            <div className="text-center py-12 space-y-2">
              <PieChartIcon className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">لا يوجد طلاب مسجلون في هذا النطاق</p>
              <p className="text-xs text-slate-500">قم بإضافة طلاب أولاً لعرض التوزيع البياني</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Pie Chart */}
              <div className="lg:col-span-7 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>الرسم البياني الدائري (Recharts)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    مرر المؤشر فوق القطاعات لمعاينة التفاصيل
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={facultyDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        innerRadius={45}
                        paddingAngle={3}
                        stroke="#0F172A"
                        strokeWidth={2}
                        label={(props: any) => `${props.percentage || ''}%`}
                        labelLine={{ stroke: '#64748B', strokeWidth: 1 }}
                      >
                        {facultyDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}-${index}`}
                            fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                            className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                          <span className="text-[11px] text-slate-300 font-medium px-1 inline-block" dir="rtl">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Faculty Breakdown List */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>قائمة الكليات والأعداد ({uniqueFacultiesCount})</span>
                  </h3>
                </div>

                {/* Search input for long faculty lists */}
                {facultyDistribution.length > 5 && (
                  <div className="relative mb-2.5">
                    <input
                      type="text"
                      value={facultySearch}
                      onChange={(e) => setFacultySearch(e.target.value)}
                      placeholder="بحث في الكليات..."
                      className="w-full pl-2 pr-7 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2" />
                  </div>
                )}

                <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
                  {filteredFacultyList.map((branch, idx) => {
                    const color = CHART_PALETTE[idx % CHART_PALETTE.length];
                    const numPct = parseFloat(branch.percentage);
                    return (
                      <div
                        key={branch.name}
                        className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-semibold text-white truncate text-[11px]">
                              {branch.name}
                            </span>
                          </div>
                          <span className="font-bold text-sky-400 flex-shrink-0 text-[11px]">
                            {branch.value} طالب ({branch.percentage}%)
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(numPct, 100)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {filteredFacultyList.length === 0 && (
                    <p className="text-center text-xs text-slate-500 py-4">
                      لا توجد كلية مطابقة للبحث
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-400">
            إيبارشية مغاغة والعدوة • خدمة أسر الجامعة
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
