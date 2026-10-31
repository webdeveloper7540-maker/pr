import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  Phone,
  Target,
  Compass,
  FileText,
  Building,
  UploadCloud,
} from 'lucide-react';
import { ServiceIdentityConfig, RegionId, AuthUser } from '../types';
import { REGIONS, INITIAL_IDENTITY_CONFIG } from '../data/constants';

interface IdentitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ServiceIdentityConfig;
  onSaveConfig: (newConfig: ServiceIdentityConfig) => void;
  user: AuthUser;
}

export const IdentitySettingsModal: React.FC<IdentitySettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<'logos' | 'vision' | 'contacts'>('logos');

  const [generalLogo, setGeneralLogo] = useState(config.generalLogoUrl || '');
  const [familyLogos, setFamilyLogos] = useState<Record<RegionId, string>>({
    minia: config.familyLogos.minia || '',
    'beni-suef': config.familyLogos['beni-suef'] || '',
    asyut: config.familyLogos.asyut || '',
    'cairo-october': config.familyLogos['cairo-october'] || '',
  });

  const [vision, setVision] = useState(config.vision || '');
  const [mission, setMission] = useState(config.mission || '');
  const [goals, setGoals] = useState<string[]>(config.goals || []);
  const [newGoal, setNewGoal] = useState('');

  const [contactPhones, setContactPhones] = useState<string[]>(config.contactPhones || []);
  const [newPhone, setNewPhone] = useState('');
  const [contactEmail, setContactEmail] = useState(config.contactEmail || '');
  const [address, setAddress] = useState(config.address || '');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeneralLogo(config.generalLogoUrl || '');
      setFamilyLogos({
        minia: config.familyLogos.minia || '',
        'beni-suef': config.familyLogos['beni-suef'] || '',
        asyut: config.familyLogos.asyut || '',
        'cairo-october': config.familyLogos['cairo-october'] || '',
      });
      setVision(config.vision || '');
      setMission(config.mission || '');
      setGoals(config.goals || []);
      setContactPhones(config.contactPhones || []);
      setContactEmail(config.contactEmail || '');
      setAddress(config.address || '');
      setSaveSuccessMsg(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // Handle image upload from computer (reads as Base64 Data URL)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'general' | RegionId
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'general') {
        setGeneralLogo(dataUrl);
      } else {
        setFamilyLogos((prev) => ({ ...prev, [target]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Goals operations
  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    setGoals((prev) => [...prev, newGoal.trim()]);
    setNewGoal('');
  };

  const handleRemoveGoal = (idx: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== idx));
  };

  // Phones operations
  const handleAddPhone = () => {
    if (!newPhone.trim()) return;
    setContactPhones((prev) => [...prev, newPhone.trim()]);
    setNewPhone('');
  };

  const handleRemovePhone = (idx: number) => {
    setContactPhones((prev) => prev.filter((_, i) => i !== idx));
  };

  // Reset all logos to default SVG graphics
  const handleResetLogosToDefault = () => {
    setGeneralLogo(INITIAL_IDENTITY_CONFIG.generalLogoUrl || '');
    setFamilyLogos({ ...INITIAL_IDENTITY_CONFIG.familyLogos });
  };

  // Submit and save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ServiceIdentityConfig = {
      generalLogoUrl: generalLogo.trim(),
      familyLogos,
      vision: vision.trim(),
      mission: mission.trim(),
      goals: goals.filter((g) => g.trim().length > 0),
      contactPhones: contactPhones.filter((p) => p.trim().length > 0),
      contactEmail: contactEmail.trim(),
      address: address.trim(),
    };

    onSaveConfig(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-amber-500/50 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col bg-slate-900/95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                إعدادات هوية المنصة والشعارات والرؤية والفوتر
              </h3>
              <p className="text-xs text-slate-400">
                تعديل لوجو الأمانة العامة، لوجو الأسر الإقليمية، الرؤية والرسالة، وأرقام التواصل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('logos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'logos'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>لوجو الأمانة والأسر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vision')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'vision'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>الرؤية والرسالة والأهداف</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>أرقام التواصل والفوتر</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>تم حفظ وتطبيق التغييرات بنجاح وتحديث كافة مكونات المنصة والفوتر!</span>
            </div>
          )}

          {/* TAB 1: LOGOS MANAGEMENT */}
          {activeTab === 'logos' && (
            <div className="space-y-6">
              {/* General Secretariat Logo */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    <span>شعار لوجو الأمانة العامة (الرئيسي):</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetLogosToDefault}
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>استعادة الشعار الأصلي</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 h-28 text-center">
                    {generalLogo ? (
                      <img
                        src={generalLogo}
                        alt="لوجو الأمانة العامة"
                        className="h-20 w-20 object-contain rounded-xl drop-shadow-md"
                      />
                    ) : (
                      <span className="text-slate-500 text-xs">لا يوجد شعار</span>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">
                        رابط صورة الشعار (URL):
                      </label>
                      <input
                        type="text"
                        value={generalLogo}
                        onChange={(e) => setGeneralLogo(e.target.value)}
                        placeholder="https://example.com/logo.png أو رابط صورة..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                        <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                        <span>رفع صورة من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'general')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Regional Family Logos */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>شعارات الأسر الإقليمية الأربع (كل أسرة منفصلة):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(REGIONS) as RegionId[]).map((regId) => {
                    const regObj = REGIONS[regId];
                    const logoVal = familyLogos[regId] || '';

                    return (
                      <div
                        key={regId}
                        className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{regObj.name}</span>
                          <span className="text-[10px] text-slate-400">{regObj.fullName}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 p-1">
                            {logoVal ? (
                              <img
                                src={logoVal}
                                alt={regObj.name}
                                className="w-full h-full object-contain rounded-lg"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-500">لا يوجد</span>
                            )}
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              value={logoVal}
                              onChange={(e) =>
                                setFamilyLogos({ ...familyLogos, [regId]: e.target.value })
                              }
                              placeholder="رابط شعار الأسرة..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                            />

                            <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 cursor-pointer">
                              <UploadCloud className="w-3 h-3 text-sky-400" />
                              <span>رفع لوجو</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, regId)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISION, MISSION, AND GOALS */}
          {activeTab === 'vision' && (
            <div className="space-y-5">
              {/* Vision */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>رؤية الخدمة والأمانة العامة (Vision):</span>
                </label>
                <textarea
                  rows={3}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="اكتب رؤية منصة أمانة خدمة أسر الجامعات..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {/* Mission */}
              <div>
                <label className="block text-xs font-bold text-sky-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>رسالة الخدمة (Mission):</span>
                </label>
                <textarea
                  rows={3}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="اكتب رسالة وأنشطة الخدمة الميدانية والرعوية..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400 leading-relaxed"
                />
              </div>

              {/* Strategic Goals List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>الأهداف الإستراتيجية للخدمة:</span>
                </label>

                <div className="space-y-2">
                  {goals.map((g, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-slate-200">{g}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="إضافة هدف إستراتيجي جديد..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT PHONES & FOOTER INFO */}
          {activeTab === 'contacts' && (
            <div className="space-y-5">
              {/* Phone Numbers List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>أرقام الهواتف والتواصل المباشر (تظهر بالفوتر):</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {contactPhones.map((ph, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-2 text-xs font-mono"
                      dir="ltr"
                    >
                      <span className="text-emerald-300 font-bold">{ph}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhone(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="إضافة رقم هاتف تواصل مصري (مثال: 01280001122)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400 font-mono"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhone}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة رقم</span>
                  </button>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-sky-300 mb-1">
                  البريد الإلكتروني للخدمة:
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="maghagha.university.youth@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400 font-mono"
                  dir="ltr"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  عنوان مقر المطرانية والأمانة العامة:
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مطرانية السيدة العذراء - مغاغة..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Submit Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتطبيق إعدادات الهوية والفوتر</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
