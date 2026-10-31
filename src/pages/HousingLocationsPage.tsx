import React, { useState, useMemo } from 'react';
import {
  Home,
  MapPin,
  Phone,
  UserCheck,
  Shield,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Map,
  Users,
  Bed,
  Check,
  X,
  Trash2,
  Edit,
  Sparkles,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { AuthUser, HousingLocation, StudentRecord, RegionId } from '../types';
import { REGIONS } from '../data/constants';

interface HousingLocationsPageProps {
  user: AuthUser;
  housingLocations: HousingLocation[];
  students: StudentRecord[];
  onAddHousingLocation: (housing: Omit<HousingLocation, 'id'>) => void;
  onUpdateHousingLocation: (housing: HousingLocation) => void;
  onDeleteHousingLocation: (id: string) => void;
  onUpdateStudent: (student: StudentRecord) => void;
}

export const HousingLocationsPage: React.FC<HousingLocationsPageProps> = ({
  user,
  housingLocations,
  students,
  onAddHousingLocation,
  onUpdateHousingLocation,
  onDeleteHousingLocation,
  onUpdateStudent,
}) => {
  // Region filter: locked if regional admin
  const [selectedRegion, setSelectedRegion] = useState<string>(
    user.role === 'REGIONAL_ADMIN' && user.regionId ? user.regionId : 'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'شباب' | 'طالبات'>('all');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingHousing, setEditingHousing] = useState<HousingLocation | null>(null);

  // Link Students Modal
  const [managingStudentsHousing, setManagingStudentsHousing] = useState<HousingLocation | null>(null);

  // Embedded Map View toggle per card
  const [activeMapPreviewId, setActiveMapPreviewId] = useState<string | null>(null);

  // Housing Form State
  const [formData, setFormData] = useState({
    name: '',
    regionId: (user.role === 'REGIONAL_ADMIN' && user.regionId ? user.regionId : 'cairo-october') as RegionId,
    genderType: 'شباب' as 'شباب' | 'طالبات' | 'مشترك / استضافة عائلية',
    address: '',
    capacity: 15,
    supervisorName: '',
    supervisorPhone: '',
    googleMapsUrl: '',
    coordinates: '',
    monthlyRent: '',
    notes: '',
  });

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingHousing(null);
    setFormData({
      name: '',
      regionId: (user.role === 'REGIONAL_ADMIN' && user.regionId ? user.regionId : 'cairo-october') as RegionId,
      genderType: 'شباب',
      address: '',
      capacity: 15,
      supervisorName: '',
      supervisorPhone: '',
      googleMapsUrl: '',
      coordinates: '',
      monthlyRent: '',
      notes: '',
    });
    setIsAddEditModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (housing: HousingLocation) => {
    setEditingHousing(housing);
    setFormData({
      name: housing.name,
      regionId: housing.regionId,
      genderType: housing.genderType,
      address: housing.address,
      capacity: housing.capacity,
      supervisorName: housing.supervisorName,
      supervisorPhone: housing.supervisorPhone,
      googleMapsUrl: housing.googleMapsUrl || '',
      coordinates: housing.coordinates || '',
      monthlyRent: housing.monthlyRent || '',
      notes: housing.notes || '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveHousing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.supervisorName.trim()) {
      return;
    }

    // Auto-generate Google Maps URL from coordinates or address if empty
    let mapsUrl = formData.googleMapsUrl.trim();
    if (!mapsUrl) {
      if (formData.coordinates.trim()) {
        mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(formData.coordinates.trim())}`;
      } else {
        mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(formData.address.trim())}`;
      }
    }

    if (editingHousing) {
      onUpdateHousingLocation({
        ...editingHousing,
        ...formData,
        googleMapsUrl: mapsUrl,
      });
    } else {
      onAddHousingLocation({
        ...formData,
        googleMapsUrl: mapsUrl,
        amenities: ['إنترنت سريع', 'مطبخ مجهز', 'سخان مياه', 'غسالة ملابس'],
      });
    }

    setIsAddEditModalOpen(false);
  };

  // Filtered housings
  const filteredHousings = useMemo(() => {
    return housingLocations.filter((h) => {
      if (user.role === 'REGIONAL_ADMIN' && user.regionId && h.regionId !== user.regionId) {
        return false;
      }
      if (selectedRegion !== 'all' && h.regionId !== selectedRegion) {
        return false;
      }
      if (genderFilter !== 'all' && h.genderType !== genderFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = h.name.toLowerCase().includes(term);
        const matchAddress = h.address.toLowerCase().includes(term);
        const matchSupervisor = h.supervisorName.toLowerCase().includes(term);
        const matchPhone = h.supervisorPhone.includes(term);
        return matchName || matchAddress || matchSupervisor || matchPhone;
      }
      return true;
    });
  }, [housingLocations, user, selectedRegion, genderFilter, searchTerm]);

  // Aggregate stats
  const totalHousings = filteredHousings.length;
  const totalCapacity = filteredHousings.reduce((sum, h) => sum + (h.capacity || 0), 0);

  // Calculate residents count from students
  const getResidentsForHousing = (housingId: string) => {
    return students.filter((s) => s.housingUnitId === housingId);
  };

  const totalOccupied = filteredHousings.reduce((sum, h) => {
    return sum + getResidentsForHousing(h.id).length;
  }, 0);

  const totalVacancies = Math.max(0, totalCapacity - totalOccupied);

  // Link / Unlink student handler
  const handleToggleStudentHousing = (student: StudentRecord, housingId: string) => {
    const isCurrentlyLinked = student.housingUnitId === housingId;
    if (isCurrentlyLinked) {
      // Unlink
      onUpdateStudent({
        ...student,
        housingUnitId: undefined,
      });
    } else {
      // Link
      onUpdateStudent({
        ...student,
        housingUnitId: housingId,
        housingStatus: 'PRIVATE_RENTAL',
        housingDetails: `سكن خارجي: ${managingStudentsHousing?.name || ''}`,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Home className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                منظومة السكنات الخارجية وإشراف المغتربين
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                {totalHousings} سكن متاح
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white">
              إدارة السكنات الخارجية للطلاب المغتربين
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              تسجيل وحصر مقرات السكن الخارجي التابعة للخدمة، المشرفين، الخرائط التفاعلية، وتسكين وربط الطلاب المسجلين بالوحدات السكنية.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل سكن خارجي جديد</span>
            </button>
          </div>
        </div>

        {/* Region Filter Bar (if General Secretariat) */}
        {user.role === 'GENERAL_SECRETARIAT' && (
          <div className="mt-4 pt-3.5 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-1">
              <Filter className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold">تصفية حسب الأسرة:</span>
            </div>
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRegion === 'all'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              جميع الأسر
            </button>
            {Object.values(REGIONS).map((reg) => {
              const count = housingLocations.filter((h) => h.regionId === reg.id).length;
              return (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedRegion === reg.id
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{reg.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-900 text-slate-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي السكنات</span>
            <Home className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{totalHousings}</div>
          <span className="text-[10px] text-slate-400">وحدة سكنية تابعة للخدمة</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>الطاقة الاستيعابية</span>
            <Bed className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400">{totalCapacity}</div>
          <span className="text-[10px] text-slate-400">سرير متاح ومجهز</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>الطلاب المسكنون</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{totalOccupied}</div>
          <span className="text-[10px] text-slate-400">طالب مسجل بسكن خارجي</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>الأسرة الشاغرة</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-300">{totalVacancies}</div>
          <span className="text-[10px] text-slate-400">شاغر متاح للطلاب الجدد</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم السكن، العنوان، اسم المشرف، الهاتف..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع أنواع السكن (شباب / طالبات)</option>
              <option value="شباب">سكنات الشباب فقط</option>
              <option value="طالبات">سكنات الطالبات فقط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Off-Campus Housing Cards Grid */}
      {filteredHousings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <Home className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد سكنات خارجية مطابقة للبحث</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            يمكنك إضافة سكن جديد بالضغط على زر "تسجيل سكن خارجي جديد".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredHousings.map((h) => {
            const reg = REGIONS[h.regionId];
            const residents = getResidentsForHousing(h.id);
            const occupancyPct = Math.min(100, Math.round((residents.length / (h.capacity || 1)) * 100));
            const isMapPreviewOpen = activeMapPreviewId === h.id;

            // Generate embed map URL
            const mapQuery = h.coordinates || h.address;
            const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

            return (
              <div
                key={h.id}
                className="glass-card rounded-2xl p-5 border border-slate-700/80 shadow-xl space-y-4 hover:border-slate-600 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar with Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-800/80 text-[10px] font-bold">
                          {reg ? reg.name : h.regionId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                            h.genderType === 'طالبات'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                              : 'bg-blue-950/60 text-blue-300 border-blue-800/80'
                          }`}
                        >
                          {h.genderType}
                        </span>
                        {h.monthlyRent && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/80 text-[10px] font-semibold">
                            {h.monthlyRent}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-white mt-1 leading-snug">{h.name}</h2>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(h)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="تعديل بيانات السكن"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف ${h.name}؟`)) {
                            onDeleteHousingLocation(h.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="حذف السكن"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-200 block font-medium">{h.address}</span>
                      {h.coordinates && (
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5" dir="ltr">
                          الإحداثيات: {h.coordinates}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Supervisor & Contact */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">المشرف المسؤول:</span>
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {h.supervisorName}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">رقم هاتف المشرف:</span>
                      <a
                        href={`tel:${h.supervisorPhone}`}
                        className="font-mono font-bold text-sky-400 hover:underline flex items-center gap-1.5"
                        dir="ltr"
                      >
                        <Phone className="w-3.5 h-3.5 text-sky-400" />
                        {h.supervisorPhone}
                      </a>
                    </div>
                  </div>

                  {/* Capacity & Occupancy Bar */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-amber-400" />
                        <span>السعة والإشغال:</span>
                      </span>
                      <span className="font-bold text-white">
                        <span className="text-emerald-400">{residents.length}</span> / {h.capacity} سرير ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          occupancyPct >= 100
                            ? 'bg-rose-500'
                            : occupancyPct >= 75
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* MAP ACTIONS (External Google Maps & Embedded iFrame) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {h.googleMapsUrl && (
                        <a
                          href={h.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>عرض على خرائط Google</span>
                        </a>
                      )}

                      <button
                        onClick={() =>
                          setActiveMapPreviewId(isMapPreviewOpen ? null : h.id)
                        }
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                          isMapPreviewOpen
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>{isMapPreviewOpen ? 'إخفاء الخريطة' : 'معاينة تفاعلية'}</span>
                      </button>
                    </div>

                    {/* Embedded Google Maps iFrame */}
                    {isMapPreviewOpen && (
                      <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner animate-in fade-in duration-300">
                        <div className="p-2 bg-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between border-b border-slate-700">
                          <span className="font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-sky-400" />
                            <span>موقع السكن على الخريطة التفاعلية:</span>
                          </span>
                          <span className="text-[10px] text-slate-400">Google Maps Embedded</span>
                        </div>
                        <iframe
                          title={`خريطة ${h.name}`}
                          src={embedMapUrl}
                          width="100%"
                          height="220"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* RESIDENTS / LINKED STUDENTS SECTION */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        <span>الطلاب المسكنون حالياً ({residents.length})</span>
                      </span>

                      <button
                        onClick={() => setManagingStudentsHousing(h)}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>تسكين وربط الطلاب</span>
                      </button>
                    </div>

                    {residents.length === 0 ? (
                      <p className="text-[11px] text-slate-500 py-1.5 text-center bg-slate-900/40 rounded-lg">
                        لا يوجد طلاب مرتبطون بهذا السكن حالياً. اضغط "تسكين وربط الطلاب" لإضافة مقيمين.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {residents.map((st) => (
                          <span
                            key={st.id}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="font-medium">{st.fullName}</span>
                            <span className="text-amber-400 text-[10px]">({st.faculty})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT HOUSING MODAL */}
      {isAddEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddEditModalOpen(false);
          }}
        >
          <div className="glass-card w-full max-w-xl rounded-2xl border border-sky-500/40 shadow-2xl p-5 sm:p-6 bg-slate-900/95 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {editingHousing ? 'تعديل بيانات السكن الخارجي' : 'تسجيل سكن خارجي جديد'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    أدخل تفاصيل الوحدة السكنية والمشرف والموقع على الخرائط
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHousing} className="space-y-4 text-right text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Housing Name */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    اسم السكن الخارجي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: سكن شباب الخدمة - الحي الأول ٦ أكتوبر"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Regional Family */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    الأسرة الإقليمية التابع لها السكن *
                  </label>
                  <select
                    disabled={user.role === 'REGIONAL_ADMIN'}
                    value={formData.regionId}
                    onChange={(e) => setFormData({ ...formData, regionId: e.target.value as RegionId })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {Object.values(REGIONS).map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender Type */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    نوع الإقامة بالسكن *
                  </label>
                  <select
                    value={formData.genderType}
                    onChange={(e) => setFormData({ ...formData, genderType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="شباب">سكن شباب طلبة</option>
                    <option value="طالبات">سكن طالبات</option>
                    <option value="مشترك / استضافة عائلية">استضافة عائلية / مشتركة</option>
                  </select>
                </div>

                {/* Detailed Address */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    العنوان التفصيلي وموقع العمارة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="مثال: المجاورة الثانية - شارع التحرير - أمام الكلية"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Supervisor Name */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    اسم المشرف المسؤول *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                    placeholder="مثال: م. بولا سامي"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Supervisor Phone */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    رقم هاتف المشرف للتواصل *
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.supervisorPhone}
                    onChange={(e) => setFormData({ ...formData, supervisorPhone: e.target.value })}
                    placeholder="012XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-right placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Google Maps URL */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    رابط خرائط جوجل (Google Maps URL)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={formData.googleMapsUrl}
                    onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-left placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    الإحداثيات الجغرافية (Coordinates)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.coordinates}
                    onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                    placeholder="مثال: 29.9737, 30.9458"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-left placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    السعة الاستيعابية (عدد الأسِرة) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Monthly Rent */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    الإيجار الشهري / الدعم
                  </label>
                  <input
                    type="text"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                    placeholder="مثال: 1,200 ج.م شامل المرافق"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingHousing ? 'حفظ التعديلات' : 'تسجيل السكن'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK STUDENTS TO HOUSING MODAL */}
      {managingStudentsHousing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setManagingStudentsHousing(null);
          }}
        >
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-sky-500/40 shadow-2xl p-5 sm:p-6 bg-slate-900/95 space-y-4 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  إدارة وتسكين الطلاب بالوحدة
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {managingStudentsHousing.name}
                </h3>
                <p className="text-xs text-slate-400">
                  حدد الطلاب لتسكينهم بهذا المقر أو إلغاء تسكينهم
                </p>
              </div>
              <button
                onClick={() => setManagingStudentsHousing(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Students list */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1 max-h-[55vh]">
              {students
                .filter((s) => s.regionId === managingStudentsHousing.regionId)
                .slice(0, 50)
                .map((student) => {
                  const isAssignedToThis = student.housingUnitId === managingStudentsHousing.id;
                  const isAssignedToOther =
                    student.housingUnitId && student.housingUnitId !== managingStudentsHousing.id;

                  return (
                    <div
                      key={student.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isAssignedToThis
                          ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{student.fullName}</span>
                          <span className="text-amber-400 text-[11px] font-semibold">
                            {student.faculty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>{student.academicYear}</span>
                          <span dir="ltr" className="font-mono text-slate-300">
                            {student.phone}
                          </span>
                          {isAssignedToOther && (
                            <span className="text-amber-400 text-[10px]">
                              (مسكن بسكن خارجي آخر)
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStudentHousing(student, managingStudentsHousing.id)
                        }
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isAssignedToThis
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        }`}
                      >
                        {isAssignedToThis ? (
                          <>
                            <UserMinus className="w-3.5 h-3.5 text-rose-400" />
                            <span>إلغاء التسكين</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                            <span>تسكين بالسكن</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-400">
                المقيمون حالياً بهذا السكن:{' '}
                <strong className="text-emerald-400">
                  {getResidentsForHousing(managingStudentsHousing.id).length}
                </strong>{' '}
                / {managingStudentsHousing.capacity}
              </span>
              <button
                onClick={() => setManagingStudentsHousing(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                تم والعودة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
