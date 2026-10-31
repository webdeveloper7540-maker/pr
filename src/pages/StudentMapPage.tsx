import React, { useState, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Compass,
  Navigation,
  Layers,
  Search,
  Filter,
  Phone,
  Building,
  GraduationCap,
  Users,
  Edit,
  Sparkles,
  Check,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { StudentRecord, RegionId, AuthUser, GeoClusterDefinition } from '../types';
import { REGIONS } from '../data/constants';
import { GEO_CLUSTERS, getClustersForRegion } from '../utils/geoClassification';

interface StudentMapPageProps {
  user: AuthUser;
  students: StudentRecord[];
  onUpdateStudent: (student: StudentRecord) => void;
  onNavigateToBulkImport?: () => void;
}

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDOPHD6BGr7_UsbU7rEPp_AVVzR-EmnrZA';

export const StudentMapPage: React.FC<StudentMapPageProps> = ({
  user,
  students,
  onUpdateStudent,
  onNavigateToBulkImport,
}) => {
  // Region filter: locked to assigned region for Regional Admin, or selectable for General Secretariat
  const [selectedRegion, setSelectedRegion] = useState<string>(
    user.role === 'REGIONAL_ADMIN' && user.regionId ? user.regionId : 'cairo-october'
  );

  // Sub-zone / Cluster filter
  const [selectedClusterId, setSelectedClusterId] = useState<string>('all');
  const [selectedHousing, setSelectedHousing] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Student on Map (for InfoWindow)
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Manual Reassignment Modal State
  const [reassigningStudent, setReassigningStudent] = useState<StudentRecord | null>(null);
  const [targetClusterId, setTargetClusterId] = useState<string>('');

  // Map viewport center & zoom state
  const regionCenters: Record<RegionId, { lat: number; lng: number; zoom: number }> = {
    'cairo-october': { lat: 30.0150, lng: 31.1400, zoom: 11 },
    minia: { lat: 28.3200, lng: 30.8000, zoom: 10 },
    'beni-suef': { lat: 29.0661, lng: 31.0994, zoom: 11 },
    asyut: { lat: 27.2000, lng: 31.1859, zoom: 10 },
  };

  const defaultCenter =
    selectedRegion !== 'all' && regionCenters[selectedRegion as RegionId]
      ? regionCenters[selectedRegion as RegionId]
      : { lat: 29.5000, lng: 31.1000, zoom: 8 };

  // Filter available clusters for current region selection
  const availableClusters = useMemo(() => {
    return getClustersForRegion(selectedRegion as RegionId | 'all');
  }, [selectedRegion]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Region enforcement
      if (user.role === 'REGIONAL_ADMIN' && user.regionId && s.regionId !== user.regionId) {
        return false;
      }
      if (selectedRegion !== 'all' && s.regionId !== selectedRegion) {
        return false;
      }
      // Cluster filter
      if (selectedClusterId !== 'all' && s.geoClusterId !== selectedClusterId) {
        return false;
      }
      // Housing filter
      if (selectedHousing !== 'all' && s.housingStatus !== selectedHousing) {
        return false;
      }
      // Text search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(term);
        const matchPhone = s.phone.includes(term);
        const matchFaculty = s.faculty.toLowerCase().includes(term);
        const matchDistrict = (s.districtOrArea || '').toLowerCase().includes(term);
        const matchCity = (s.cityOrCenter || '').toLowerCase().includes(term);
        const matchCluster = (s.geoClusterName || '').toLowerCase().includes(term);
        return matchName || matchPhone || matchFaculty || matchDistrict || matchCity || matchCluster;
      }
      return true;
    });
  }, [students, user, selectedRegion, selectedClusterId, selectedHousing, searchTerm]);

  // Cluster density aggregation for summary bars & metrics
  const clusterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredStudents.forEach((s) => {
      const cId = s.geoClusterId || 'unclassified';
      counts[cId] = (counts[cId] || 0) + 1;
    });
    return counts;
  }, [filteredStudents]);

  // Save manual cluster reassignment
  const handleSaveReassignment = () => {
    if (!reassigningStudent || !targetClusterId) return;

    const chosenDef = GEO_CLUSTERS.find((c) => c.id === targetClusterId);
    if (!chosenDef) return;

    const updated: StudentRecord = {
      ...reassigningStudent,
      geoClusterId: chosenDef.id,
      geoClusterName: chosenDef.name,
      latitude: chosenDef.center.lat,
      longitude: chosenDef.center.lng,
      isClusterManual: true,
    };

    onUpdateStudent(updated);

    if (selectedStudent && selectedStudent.id === updated.id) {
      setSelectedStudent(updated);
    }

    setReassigningStudent(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Compass className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-sky-400">
                المحرك الجغرافي الذكي وخرائط Google Maps
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                تجميع مكاني ونطاقات الأحياء
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white">
              الخريطة التفاعلية لتوزيع وتجمعات طلاب الجامعات
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              إسقاط وتصنيف مكاني تلقائي لطلاب الأسر حسب الأحياء والمراكز المتقاربة، مع إمكانية التصفية الدقيقة وإعادة التسكين المباشر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToBulkImport && (
              <button
                onClick={onNavigateToBulkImport}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>استيراد وتصنيف إكسيل مجمّع</span>
              </button>
            )}

            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-bold text-amber-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{filteredStudents.length} طالب بالخريطة</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/60">
          {/* Region Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              الأسرة الإقليمية
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedClusterId('all');
                setSelectedStudent(null);
              }}
              disabled={user.role === 'REGIONAL_ADMIN' && !!user.regionId}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-60"
            >
              {user.role === 'GENERAL_SECRETARIAT' && (
                <option value="all">كافة الأسر الإقليمية</option>
              )}
              {Object.values(REGIONS).map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-zone / Cluster Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-sky-300 mb-1">
              النطاق الجغرافي / القطاع
            </label>
            <select
              value={selectedClusterId}
              onChange={(e) => setSelectedClusterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-sky-500/40 text-white text-xs focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="all">جميع النطاقات والتجمعات</option>
              {availableClusters.map((cluster) => {
                const count = clusterCounts[cluster.id] || 0;
                return (
                  <option key={cluster.id} value={cluster.id}>
                    {cluster.name} ({count} طالب)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Housing Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              حالة السكن والإقامة
            </label>
            <select
              value={selectedHousing}
              onChange={(e) => setSelectedHousing(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">كافة أنواع الإقامة</option>
              <option value="CAMPUS_HOUSING">مدينة جامعية</option>
              <option value="PRIVATE_RENTAL">سكن خارجي / خاص</option>
              <option value="COMMUTER_HOME">مقيم بالمنزل ومسافر</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              بحث سريع بالاسم أو الحي
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم، الكلية، الشارع..."
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Density Stat Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedClusterId('all')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedClusterId === 'all'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <span>كافة النطاقات</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px]">
            {filteredStudents.length}
          </span>
        </button>

        {availableClusters.map((cluster) => {
          const count = clusterCounts[cluster.id] || 0;
          const isSelected = selectedClusterId === cluster.id;
          return (
            <button
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cluster.color }}
              />
              <span>{cluster.name.split('(')[0]}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  isSelected ? 'bg-black/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Map & Interactive Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Left Column: Interactive Google Map */}
        <div className="lg:col-span-3 glass-card rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl relative min-h-[560px] h-[640px]">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={defaultCenter.zoom}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full rounded-2xl"
              style={{ width: '100%', height: '100%', minHeight: '560px' }}
            >
              {/* Plot students as Advanced Markers */}
              {filteredStudents.map((student) => {
                const cluster = GEO_CLUSTERS.find((c) => c.id === student.geoClusterId);
                const pinColor = cluster?.color || '#0284C7';
                const lat = student.latitude || cluster?.center.lat || 30.0150;
                const lng = student.longitude || cluster?.center.lng || 31.1400;

                return (
                  <AdvancedMarker
                    key={student.id}
                    position={{ lat, lng }}
                    onClick={() => setSelectedStudent(student)}
                    title={`${student.fullName} - ${student.faculty}`}
                  >
                    <Pin
                      background={pinColor}
                      borderColor="#0F172A"
                      glyphColor="#FFFFFF"
                      scale={selectedStudent?.id === student.id ? 1.25 : 0.9}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for Clicked Student */}
              {selectedStudent && (
                <InfoWindow
                  position={{
                    lat: selectedStudent.latitude || 30.0150,
                    lng: selectedStudent.longitude || 31.1400,
                  }}
                  onCloseClick={() => setSelectedStudent(null)}
                >
                  <div className="p-2 text-right max-w-xs text-slate-900" dir="rtl">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                        {REGIONS[selectedStudent.regionId]?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {selectedStudent.academicYear}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {selectedStudent.fullName}
                    </h4>

                    <p className="text-xs text-sky-700 font-semibold mt-0.5">
                      {selectedStudent.faculty}
                    </p>
                    <p className="text-[11px] text-slate-500">{selectedStudent.university}</p>

                    <div className="my-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{selectedStudent.geoClusterName || 'نطاق تلقائي'}</span>
                      </div>
                      {(selectedStudent.districtOrArea || selectedStudent.detailedAddress) && (
                        <div className="text-[10px] text-slate-600">
                          {selectedStudent.detailedAddress || selectedStudent.districtOrArea}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={`tel:${selectedStudent.phone}`}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-mono text-xs font-bold flex items-center gap-1 hover:bg-emerald-700"
                        dir="ltr"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{selectedStudent.phone}</span>
                      </a>

                      {user.role === 'GENERAL_SECRETARIAT' && (
                        <button
                          onClick={() => {
                            setReassigningStudent(selectedStudent);
                            setTargetClusterId(selectedStudent.geoClusterId || '');
                          }}
                          className="px-2 py-1 rounded-md bg-amber-100 text-amber-900 hover:bg-amber-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>تعديل النطاق</span>
                        </button>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Floating Map Legend */}
          <div className="absolute bottom-3 right-3 z-10 glass-card p-2.5 rounded-xl border border-slate-700/80 bg-slate-950/85 backdrop-blur-md shadow-xl text-xs max-w-xs space-y-1.5 hidden sm:block">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>دليل النطاقات الجغرافية:</span>
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>أكتوبر (1-5) / وسط القاهرة</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>شرق القاهرة / المتميز</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>حدائق أكتوبر / شمال القاهرة</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>جنوب القاهرة / التوسعات</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Student Cluster Feed & Quick Navigation */}
        <div className="glass-card rounded-2xl border border-slate-700/80 p-4 shadow-2xl flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-white text-xs sm:text-sm">
                قائمة الطلاب ({filteredStudents.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">انقر للتركيز</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                لا يوجد طلاب مطابقين لفلاتر البحث الحالية.
              </div>
            ) : (
              filteredStudents.map((st) => {
                const isSelected = selectedStudent?.id === st.id;
                const cluster = GEO_CLUSTERS.find((c) => c.id === st.geoClusterId);

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-400 ring-1 ring-sky-400/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{st.fullName}</h4>
                      <span className="text-[10px] text-amber-400 font-mono whitespace-nowrap">
                        {st.academicYear.replace('الفرقة ', 'ف')}
                      </span>
                    </div>

                    <div className="text-[11px] text-sky-300 font-medium line-clamp-1">
                      {st.faculty}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin
                          className="w-3 h-3 flex-shrink-0"
                          style={{ color: cluster?.color || '#0284C7' }}
                        />
                        <span className="truncate">{st.geoClusterName || st.districtOrArea || 'نطاق تلقائي'}</span>
                      </span>

                      <a
                        href={`tel:${st.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-emerald-400 hover:underline flex items-center gap-0.5"
                        dir="ltr"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>{st.phone.slice(-4)}</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Manual Cluster Reassignment Modal */}
      {reassigningStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-amber-500/50 shadow-2xl p-5 bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>إعادة تسكين وتعديل النطاق الجغرافي للطالب</span>
              </div>
              <button
                onClick={() => setReassigningStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
              <div className="text-white font-bold text-sm">{reassigningStudent.fullName}</div>
              <div className="text-sky-300">{reassigningStudent.faculty} - {reassigningStudent.university}</div>
              <div className="text-slate-400 text-[11px]">
                العنوان المسجل: {reassigningStudent.detailedAddress || reassigningStudent.housingDetails || '—'}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                اختر النطاق الجغرافي الجديد (Google Maps Cluster):
              </label>
              <select
                value={targetClusterId}
                onChange={(e) => setTargetClusterId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-amber-500/50 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {GEO_CLUSTERS.filter((c) => c.regionId === reassigningStudent.regionId).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.parentZone})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                سيتم تحديث إحداثيات الطالب ونطاقه المكاني فوراً على الخريطة وسجلات الخدمة.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReassigningStudent(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveReassignment}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Check className="w-4 h-4" />
                <span>حفظ التسكين المكاني الجديد</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
