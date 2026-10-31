import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit, GraduationCap, Building2, Phone, Church, Check, Home, MapPin, Compass, Navigation } from 'lucide-react';
import { StudentRecord, RegionId, HousingStatus, UserRole, HousingLocation } from '../types';
import { REGIONS, COMMON_FACULTIES } from '../data/constants';
import { classifyStudentGeographically, GEO_CLUSTERS } from '../utils/geoClassification';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<StudentRecord, 'id' | 'registrationDate'>, existingId?: string) => void;
  currentUserRole: UserRole;
  currentRegionId?: RegionId;
  studentToEdit?: StudentRecord | null;
  housingLocations?: HousingLocation[];
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUserRole,
  currentRegionId,
  studentToEdit,
  housingLocations = [],
}) => {
  const defaultRegion: RegionId = currentRegionId || 'cairo-october';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    regionId: defaultRegion,
    university: REGIONS[defaultRegion]?.universities[0] || 'جامعة القاهرة',
    faculty: COMMON_FACULTIES[0],
    academicYear: 'الفرقة الأولى' as StudentRecord['academicYear'],
    housingStatus: 'CAMPUS_HOUSING' as HousingStatus,
    housingDetails: '',
    housingUnitId: '',
    churchParish: '',
    notes: '',
    governorate: '',
    cityOrCenter: '',
    districtOrArea: '',
    detailedAddress: '',
    geoClusterId: '',
    isClusterManual: false,
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        fullName: studentToEdit.fullName,
        phone: studentToEdit.phone,
        regionId: studentToEdit.regionId,
        university: studentToEdit.university,
        faculty: studentToEdit.faculty,
        academicYear: studentToEdit.academicYear,
        housingStatus: studentToEdit.housingStatus,
        housingDetails: studentToEdit.housingDetails || '',
        housingUnitId: studentToEdit.housingUnitId || '',
        churchParish: studentToEdit.churchParish || '',
        notes: studentToEdit.notes || '',
        governorate: studentToEdit.governorate || '',
        cityOrCenter: studentToEdit.cityOrCenter || '',
        districtOrArea: studentToEdit.districtOrArea || '',
        detailedAddress: studentToEdit.detailedAddress || '',
        geoClusterId: studentToEdit.geoClusterId || '',
        isClusterManual: !!studentToEdit.isClusterManual,
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        regionId: defaultRegion,
        university: REGIONS[defaultRegion]?.universities[0] || 'جامعة القاهرة',
        faculty: COMMON_FACULTIES[0],
        academicYear: 'الفرقة الأولى',
        housingStatus: 'CAMPUS_HOUSING',
        housingDetails: '',
        housingUnitId: '',
        churchParish: '',
        notes: '',
        governorate: '',
        cityOrCenter: '',
        districtOrArea: '',
        detailedAddress: '',
        geoClusterId: '',
        isClusterManual: false,
      });
    }
  }, [studentToEdit, isOpen, defaultRegion]);

  if (!isOpen) return null;

  const handleRegionChange = (newRegion: RegionId) => {
    setFormData((prev) => ({
      ...prev,
      regionId: newRegion,
      university: REGIONS[newRegion]?.universities[0] || '',
      housingUnitId: '',
      geoClusterId: '',
      isClusterManual: false,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      return;
    }

    // Classify or preserve chosen cluster
    let finalClusterId = formData.geoClusterId;
    let finalClusterName = '';
    let finalLat = studentToEdit?.latitude;
    let finalLng = studentToEdit?.longitude;

    if (formData.geoClusterId) {
      const match = GEO_CLUSTERS.find((c) => c.id === formData.geoClusterId);
      if (match) {
        finalClusterName = match.name;
        finalLat = match.center.lat;
        finalLng = match.center.lng;
      }
    }

    if (!finalClusterId || !formData.isClusterManual) {
      const autoGeo = classifyStudentGeographically({
        regionId: formData.regionId,
        governorate: formData.governorate,
        cityOrCenter: formData.cityOrCenter,
        districtOrArea: formData.districtOrArea,
        detailedAddress: formData.detailedAddress || formData.housingDetails,
        university: formData.university,
        faculty: formData.faculty,
        churchParish: formData.churchParish,
        studentKey: formData.fullName,
      });
      finalClusterId = autoGeo.clusterId;
      finalClusterName = autoGeo.clusterName;
      finalLat = autoGeo.lat;
      finalLng = autoGeo.lng;
    }

    onSave(
      {
        fullName: formData.fullName,
        phone: formData.phone,
        regionId: formData.regionId,
        university: formData.university,
        faculty: formData.faculty,
        academicYear: formData.academicYear,
        housingStatus: formData.housingStatus,
        housingDetails: formData.housingDetails,
        housingUnitId: formData.housingUnitId || undefined,
        churchParish: formData.churchParish,
        notes: formData.notes,
        governorate: formData.governorate,
        cityOrCenter: formData.cityOrCenter,
        districtOrArea: formData.districtOrArea,
        detailedAddress: formData.detailedAddress,
        geoClusterId: finalClusterId,
        geoClusterName: finalClusterName,
        latitude: finalLat,
        longitude: finalLng,
        isClusterManual: formData.isClusterManual,
      },
      studentToEdit ? studentToEdit.id : undefined
    );
    onClose();
  };

  const availableUniversities = REGIONS[formData.regionId]?.universities || [];
  const availableHousings = housingLocations.filter((h) => h.regionId === formData.regionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col bg-slate-900/95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {studentToEdit ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {studentToEdit ? 'تعديل بيانات الطالب المسجل' : 'تسجيل طالب جديد بالمنصة'}
              </h2>
              <p className="text-xs text-slate-400">
                {studentToEdit
                  ? 'تحديث بيانات الطالب، النطاق الإقليمي، الكلية، والسكن الخارجي'
                  : 'إضافة بيانات الطالب والتوزيع الإقليمي والكلية الجامعية'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                اسم الطالب ثلاثي / رباعي *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="مثال: كيرلس بيتر عاطف"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                رقم الهاتف المحمول (واتساب) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="012XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 text-right transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Region / Family */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الأسرة الإقليمية التابع لها الطالب *
              </label>
              <select
                disabled={currentUserRole === 'REGIONAL_ADMIN'}
                value={formData.regionId}
                onChange={(e) => handleRegionChange(e.target.value as RegionId)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 disabled:opacity-60 cursor-pointer"
              >
                {Object.values(REGIONS).map((reg) => (
                  <option key={reg.id} value={reg.id} className="bg-slate-900 text-white">
                    {reg.name} ({reg.fullName})
                  </option>
                ))}
              </select>
            </div>

            {/* University */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الجامعة *
              </label>
              <select
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {availableUniversities.map((uni) => (
                  <option key={uni} value={uni} className="bg-slate-900 text-white">
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty / College Branch */}
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>الكلية / الفرع الجامعي *</span>
              </label>
              <select
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-amber-500/50 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {COMMON_FACULTIES.map((fac) => (
                  <option key={fac} value={fac} className="bg-slate-900 text-white">
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                السنة الدراسية
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value as StudentRecord['academicYear'] })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="الفرقة الأولى" className="bg-slate-900 text-white">الفرقة الأولى</option>
                <option value="الفرقة الثانية" className="bg-slate-900 text-white">الفرقة الثانية</option>
                <option value="الفرقة الثالثة" className="bg-slate-900 text-white">الفرقة الثالثة</option>
                <option value="الفرقة الرابعة" className="bg-slate-900 text-white">الفرقة الرابعة</option>
                <option value="الفرقة الخامسة" className="bg-slate-900 text-white">الفرقة الخامسة</option>
                <option value="الفرقة السادسة" className="bg-slate-900 text-white">الفرقة السادسة</option>
                <option value="دراسات عليا" className="bg-slate-900 text-white">دراسات عليا</option>
              </select>
            </div>

            {/* Housing Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                حالة الإقامة والسكن
              </label>
              <select
                value={formData.housingStatus}
                onChange={(e) => setFormData({ ...formData, housingStatus: e.target.value as HousingStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="CAMPUS_HOUSING" className="bg-slate-900 text-white">مدينة جامعية حكومية</option>
                <option value="PRIVATE_RENTAL" className="bg-slate-900 text-white">سكن خارجي / تابع للخدمة</option>
                <option value="COMMUTER_HOME" className="bg-slate-900 text-white">مقيم بالمنزل ومسافر يومياً</option>
              </select>
            </div>

            {/* Church Parish in Maghagha */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                كنيسة القرية أو المدينة بمغاغة والعدوة
              </label>
              <input
                type="text"
                value={formData.churchParish}
                onChange={(e) => setFormData({ ...formData, churchParish: e.target.value })}
                placeholder="مثال: كنيسة الشهيد مارجرجس - العدوة"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Off-Campus Housing Linking (if private rental) */}
          {formData.housingStatus === 'PRIVATE_RENTAL' && availableHousings.length > 0 && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
              <label className="block text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                <span>ربط الطالب بسكن خارجي مسجل بالمنظومة:</span>
              </label>
              <select
                value={formData.housingUnitId}
                onChange={(e) => setFormData({ ...formData, housingUnitId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-500/50 text-white text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="">-- غير محدد / سكن خاص مستقل --</option>
                {availableHousings.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.genderType}) - المشرف: {h.supervisorName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Geographic Classification & Google Maps Grouping Section */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>العنوان والتصنيف الجغرافي الذكي (Google Maps)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium">
                توزيع وتقارب تلقائي
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  المحافظة
                </label>
                <input
                  type="text"
                  value={formData.governorate}
                  onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                  placeholder="مثال: الجيزة، المنيا..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  المدينة / المركز
                </label>
                <input
                  type="text"
                  value={formData.cityOrCenter}
                  onChange={(e) => setFormData({ ...formData, cityOrCenter: e.target.value })}
                  placeholder="مثال: 6 أكتوبر، مغاغة..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  الحي / المنطقة
                </label>
                <input
                  type="text"
                  value={formData.districtOrArea}
                  onChange={(e) => setFormData({ ...formData, districtOrArea: e.target.value })}
                  placeholder="مثال: الحي الثالث، شلبي..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                العنوان التفصيلي وسكن الطالب
              </label>
              <input
                type="text"
                value={formData.detailedAddress}
                onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value, housingDetails: e.target.value })}
                placeholder="اسم الشارع، رقم العمارة، أو علامة مميزة بالقرب من الكلية..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Geographic Cluster Selection / Fine-Tuning */}
            <div>
              <label className="block text-[11px] font-semibold text-amber-300 mb-1 flex items-center justify-between">
                <span>تجمع النطاق الجغرافي المعين (الخريطة):</span>
                {formData.isClusterManual && (
                  <span className="text-[10px] text-amber-400 font-normal">تم التحديد يدوياً</span>
                )}
              </label>
              <select
                value={formData.geoClusterId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    geoClusterId: e.target.value,
                    isClusterManual: e.target.value !== '',
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-amber-500/40 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="">-- تصنيف تلقائي ذكي بناءً على العنوان والجامعة --</option>
                {GEO_CLUSTERS.filter((c) => c.regionId === formData.regionId).map((cluster) => (
                  <option key={cluster.id} value={cluster.id}>
                    {cluster.name} ({cluster.parentZone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ملاحظات الخدمة والتواصل
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات خاصة بالخدمة أو احتياجات الطالب..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{studentToEdit ? 'حفظ وتعديل البيانات' : 'حفظ وإضافة الطالب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
