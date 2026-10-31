import React, { useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Crown,
  ChevronDown,
  ChevronLeft,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Church,
  MapPin,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  Layers,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { AuthUser, LeadershipMember, LeadershipTier, RegionId } from '../types';
import { REGIONS } from '../data/constants';

interface LeadershipManagementPageProps {
  user: AuthUser;
  leadershipList: LeadershipMember[];
  onAddMember: (member: Omit<LeadershipMember, 'id'>) => void;
  onUpdateMember: (member: LeadershipMember) => void;
  onDeleteMember: (id: string) => void;
}

export const LeadershipManagementPage: React.FC<LeadershipManagementPageProps> = ({
  user,
  leadershipList,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  // View mode: 'tree' (Hierarchy mapping) or 'directory' (List / Table)
  const [viewMode, setViewMode] = useState<'tree' | 'directory'>('tree');

  // Filters
  const [tierFilter, setTierFilter] = useState<'all' | LeadershipTier>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<LeadershipMember | null>(null);

  // Reassignment / Confirm Action Modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tier: 'FAMILY_SERVANT' as LeadershipTier,
    roleTitle: '',
    regionId: 'cairo-october' as RegionId | 'all',
    churchOrSector: '',
    phone: '',
    email: '',
    priestInChargeId: '',
    notes: '',
    status: 'active' as 'active' | 'on_leave',
    appointedDate: new Date().toISOString().split('T')[0],
  });

  // Priests list for supervisor dropdown
  const priests = useMemo(() => {
    return leadershipList.filter((m) => m.tier === 'PRIEST');
  }, [leadershipList]);

  // Open modal for add
  const handleOpenAdd = (presetTier?: LeadershipTier) => {
    setEditingMember(null);
    setFormData({
      name: '',
      tier: presetTier || 'FAMILY_SERVANT',
      roleTitle: presetTier === 'PRIEST' ? 'كاهن مشرف على الأسرة' : presetTier === 'SECTOR_LEADER' ? 'مسؤول أمانة الجامعة بالقطاع' : 'أمين أسرة شباب الجامعة',
      regionId: 'cairo-october',
      churchOrSector: 'مطرانية السيدة العذراء - مغاغة',
      phone: '',
      email: '',
      priestInChargeId: priests[0]?.id || '',
      notes: '',
      status: 'active',
      appointedDate: new Date().toISOString().split('T')[0],
    });
    setIsAddEditModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (member: LeadershipMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      tier: member.tier,
      roleTitle: member.roleTitle,
      regionId: member.regionId,
      churchOrSector: member.churchOrSector,
      phone: member.phone,
      email: member.email || '',
      priestInChargeId: member.priestInChargeId || '',
      notes: member.notes || '',
      status: member.status,
      appointedDate: member.appointedDate,
    });
    setIsAddEditModalOpen(true);
  };

  // Submit add / edit
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.roleTitle.trim() || !formData.phone.trim()) {
      return;
    }

    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        ...formData,
      });
    } else {
      onAddMember(formData);
    }

    setIsAddEditModalOpen(false);
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return leadershipList.filter((m) => {
      if (tierFilter !== 'all' && m.tier !== tierFilter) return false;
      if (regionFilter !== 'all' && m.regionId !== regionFilter && m.regionId !== 'all') return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = m.name.toLowerCase().includes(term);
        const matchRole = m.roleTitle.toLowerCase().includes(term);
        const matchChurch = m.churchOrSector.toLowerCase().includes(term);
        const matchPhone = m.phone.includes(term);
        return matchName || matchRole || matchChurch || matchPhone;
      }
      return true;
    });
  }, [leadershipList, tierFilter, regionFilter, searchTerm]);

  // Aggregate stats
  const priestCount = leadershipList.filter((m) => m.tier === 'PRIEST').length;
  const sectorLeaderCount = leadershipList.filter((m) => m.tier === 'SECTOR_LEADER').length;
  const familyServantCount = leadershipList.filter((m) => m.tier === 'FAMILY_SERVANT').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Control Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Crown className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-amber-400">
                الهيكل الإداري والتنظيمي للخدمة
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                إيبارشية مغاغة والعدوة
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white">
              إدارة الهيكل الإداري والقيادات الكنسية والخدام
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              حصر وتنظيم الهيكل التراتبي للآباء الكهنة المشرفين، مسؤولي قطاعات الكنائس، وأمناء الأسر الإقليمية وإعادة التعيين والتنسيق المباشر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'tree'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>المخطط الشجري</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('directory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'directory'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>السجل الكامل</span>
              </button>
            </div>

            {/* Add Member Button */}
            {user.role === 'GENERAL_SECRETARIAT' && (
              <button
                onClick={() => handleOpenAdd()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>تعيين قيادة جديدة</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-700/60">
          <div
            onClick={() => setTierFilter(tierFilter === 'PRIEST' ? 'all' : 'PRIEST')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              tierFilter === 'PRIEST'
                ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Crown className="w-4 h-4" />
                الكهنة المسؤولون (الإرشاد الروحي)
              </span>
              <span className="text-base font-black text-white">{priestCount}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              الآباء الكهنة المشرفون على الأسر والقطاعات
            </p>
          </div>

          <div
            onClick={() => setTierFilter(tierFilter === 'SECTOR_LEADER' ? 'all' : 'SECTOR_LEADER')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              tierFilter === 'SECTOR_LEADER'
                ? 'bg-sky-500/15 border-sky-500/60 ring-1 ring-sky-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                مسؤولو القطاعات والكنائس
              </span>
              <span className="text-base font-black text-white">{sectorLeaderCount}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              منسقو الخدمة بقطاعات مغاغة، العدوة، وقرى الإيبارشية
            </p>
          </div>

          <div
            onClick={() => setTierFilter(tierFilter === 'FAMILY_SERVANT' ? 'all' : 'FAMILY_SERVANT')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              tierFilter === 'FAMILY_SERVANT'
                ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                أمناء الأسر ومساعدوهم
              </span>
              <span className="text-base font-black text-white">{familyServantCount}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              الخدام الميدانيون المتابعون للطلاب والجامعات
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم، الكنيسة، المنصب، الهاتف..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Tier Filter */}
          <div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع المستويات الإدارية</option>
              <option value="PRIEST">الكهنة المسؤولون فقط</option>
              <option value="SECTOR_LEADER">مسؤولو القطاعات والكنائس</option>
              <option value="FAMILY_SERVANT">أمناء الأسر والخدام</option>
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع النطاقات والأسر الإقليمية</option>
              {Object.values(REGIONS).map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
          <span>النتائج المعروضة: <strong className="text-white">{filteredList.length}</strong> قيادة وخادم</span>
          {(tierFilter !== 'all' || regionFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setTierFilter('all');
                setRegionFilter('all');
                setSearchTerm('');
              }}
              className="text-sky-400 hover:underline cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: ORGANIZATIONAL HIERARCHY TREE MAPPING (المخطط الهيكلي والشجري) */}
      {viewMode === 'tree' && (
        <div className="space-y-6">
          {priests.map((priest) => {
            // Find downstream sector coordinators or family servants supervised by this priest
            const downstreamSectorLeaders = leadershipList.filter(
              (m) => m.tier === 'SECTOR_LEADER' && m.priestInChargeId === priest.id
            );
            const downstreamFamilyServants = leadershipList.filter(
              (m) => m.tier === 'FAMILY_SERVANT' && (m.priestInChargeId === priest.id || priest.regionId === 'all' || priest.regionId === m.regionId)
            );

            // If filtered by search/tier/region, check if priest or any downstream matches
            const priestMatches = filteredList.some((m) => m.id === priest.id);
            const hasMatchingDownstream =
              downstreamSectorLeaders.some((s) => filteredList.some((f) => f.id === s.id)) ||
              downstreamFamilyServants.some((s) => filteredList.some((f) => f.id === s.id));

            if (!priestMatches && !hasMatchingDownstream && (tierFilter !== 'all' || regionFilter !== 'all' || searchTerm)) {
              return null;
            }

            return (
              <div
                key={priest.id}
                className="glass-card rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4"
              >
                {/* Tier 1: Responsible Priest Node (الرأس الهيكلي) */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-900/80 to-slate-900/80 border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-md">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          كاهن مشرف
                        </span>
                        {priest.regionId !== 'all' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                            {REGIONS[priest.regionId as RegionId]?.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white mt-0.5">{priest.name}</h3>
                      <p className="text-xs text-amber-300/90 font-medium">{priest.roleTitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                      <Church className="w-3.5 h-3.5 text-amber-400" />
                      <span>{priest.churchOrSector}</span>
                    </div>

                    <a
                      href={`tel:${priest.phone}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-mono font-bold transition-colors"
                      dir="ltr"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{priest.phone}</span>
                    </a>

                    {user.role === 'GENERAL_SECRETARIAT' && (
                      <button
                        onClick={() => handleOpenEdit(priest)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="تعديل بيانات الكاهن المشرف"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tree Connector Line and Downstream Nodes */}
                <div className="mr-6 pr-4 border-r-2 border-dashed border-amber-500/30 space-y-4">
                  {/* Tier 2: Sector Coordinators (إن وجد) */}
                  {downstreamSectorLeaders.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>منسقو أمانة الجامعة بالقطاعات التابعة:</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {downstreamSectorLeaders.map((sec) => (
                          <div
                            key={sec.id}
                            className="p-3.5 rounded-xl bg-slate-900/70 border border-sky-500/30 hover:border-sky-500/50 transition-colors flex items-start justify-between gap-2"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 font-bold border border-sky-800">
                                مسؤول قطاع
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-white">{sec.name}</h4>
                              <p className="text-[11px] text-slate-400">{sec.roleTitle}</p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Church className="w-3 h-3 text-slate-400" />
                                {sec.churchOrSector}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              <a
                                href={`tel:${sec.phone}`}
                                className="font-mono text-xs text-sky-400 hover:underline flex items-center gap-1"
                                dir="ltr"
                              >
                                <Phone className="w-3 h-3" />
                                {sec.phone}
                              </a>
                              {user.role === 'GENERAL_SECRETARIAT' && (
                                <button
                                  onClick={() => handleOpenEdit(sec)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tier 3: Family Servants (أمناء الأسر ومساعدوهم) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>أمناء الأسر والخدام التابعون للإشراف:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {downstreamFamilyServants.map((fam) => {
                        const reg = REGIONS[fam.regionId as RegionId];
                        return (
                          <div
                            key={fam.id}
                            className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                                  {reg ? reg.name : 'أمين أسرة'}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  منذ {fam.appointedDate}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-white">{fam.name}</h4>
                              <p className="text-[11px] text-slate-300 mt-0.5">{fam.roleTitle}</p>
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-sky-400" />
                                {fam.churchOrSector}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                              <a
                                href={`tel:${fam.phone}`}
                                className="font-mono text-xs text-sky-400 hover:underline flex items-center gap-1"
                                dir="ltr"
                              >
                                <Phone className="w-3 h-3" />
                                {fam.phone}
                              </a>

                              {user.role === 'GENERAL_SECRETARIAT' && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEdit(fam)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                                    title="تعديل بيانات الخادم"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(fam.id)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                                    title="حذف من الهيكل"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: FULL DIRECTORY TABLE VIEW (السجل الكامل للقيادات) */}
      {viewMode === 'directory' && (
        <div className="glass-card rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col">
          <div className="overflow-x-auto min-h-[380px] max-h-[650px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/90 sticky top-0 z-20 border-b border-slate-700 text-slate-300 backdrop-blur-md">
                <tr>
                  <th className="p-3.5 font-bold whitespace-nowrap">الاسم والصفة</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">المستوى الإداري</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">المسؤولية / الأسرة</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">الكنيسة / القطاع</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">الكاهن المشرف</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">رقم التواصل</th>
                  <th className="p-3.5 font-bold text-center whitespace-nowrap">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredList.map((m) => {
                  const reg = m.regionId !== 'all' ? REGIONS[m.regionId as RegionId] : null;
                  const supervisingPriest = priests.find((p) => p.id === m.priestInChargeId);

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs sm:text-sm">{m.name}</div>
                        <div className="text-[10px] text-amber-400 mt-0.5">{m.roleTitle}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {m.tier === 'PRIEST' && (
                          <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            كاهن مشرف
                          </span>
                        )}
                        {m.tier === 'SECTOR_LEADER' && (
                          <span className="px-2.5 py-1 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                            مسؤول قطاع
                          </span>
                        )}
                        {m.tier === 'FAMILY_SERVANT' && (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            أمين أسرة
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium">
                          <MapPin className="w-3 h-3 text-sky-400" />
                          {reg ? reg.name : 'عام لجميع القطاعات'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Church className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span>{m.churchOrSector}</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-400">
                        {supervisingPriest ? (
                          <span className="text-amber-300 text-[11px] font-semibold">
                            {supervisingPriest.name}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap" dir="ltr">
                        <a href={`tel:${m.phone}`} className="hover:text-sky-400 hover:underline">
                          {m.phone}
                        </a>
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {user.role === 'GENERAL_SECRETARIAT' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(m)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                                title="تعديل أو إعادة تعيين"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(m.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title="حذف العضو"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT LEADERSHIP MEMBER MODAL */}
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
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {editingMember ? 'تعديل بيانات القيادة أو الخادم' : 'تعيين رتبة أو خادم جديد بالهيكل'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    تسجيل وتعيين المسؤوليات الكنسية والإدارية لخدمة أسر الجامعة
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

            <form onSubmit={handleSaveMember} className="space-y-4 text-right text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    الاسم بالكامل (أب كاهن أو خادم) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: القس بيمن مكرم / د. بيتر عاطف"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Tier */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    المستوى الإداري والكنسي *
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as LeadershipTier })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="PRIEST">كاهن مسؤول (إرشاد روحي ورعاية)</option>
                    <option value="SECTOR_LEADER">مسؤول أمانة الجامعة بالقطاع / الكنيسة</option>
                    <option value="FAMILY_SERVANT">أمين أسرة إقليمية / خادم ميداني</option>
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    الأسرة الإقليمية / النطاق *
                  </label>
                  <select
                    value={formData.regionId}
                    onChange={(e) => setFormData({ ...formData, regionId: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="all">عام لجميع الأسر والقطاعات</option>
                    {Object.values(REGIONS).map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Title */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    المسمى الوظيفي والمسؤولية الخدمية *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="مثال: الكاهن المشرف على أسر القاهرة و٦ أكتوبر / أمين أسرة المنيا"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Church / Sector */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    الكنيسة التابع لها أو القطاع الجغرافي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.churchOrSector}
                    onChange={(e) => setFormData({ ...formData, churchOrSector: e.target.value })}
                    placeholder="مثال: مطرانية السيدة العذراء - مغاغة / كنيسة مارجرجس - العدوة"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    رقم الهاتف المحمول (واتساب) *
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-right placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    البريد الإلكتروني الرسمي
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="servant@maghagha-youth.org"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-left placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Supervising Priest (if not Priest) */}
                {formData.tier !== 'PRIEST' && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-amber-300 mb-1">
                      الأب الكاهن المشرف على هذه الخدمة أو القطاع:
                    </label>
                    <select
                      value={formData.priestInChargeId}
                      onChange={(e) => setFormData({ ...formData, priestInChargeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-amber-500/40 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="">-- اختياري / إشراف الأمانة العامة --</option>
                      {priests.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.roleTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    ملاحظات واختصاصات الخدمة
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أي مهام أو اختصاصات تفصيلية مكلف بها..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMember ? 'حفظ التعديلات' : 'اعتماد التعيين'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETION */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDeleteId(null);
          }}
        >
          <div className="glass-card w-full max-w-md rounded-2xl border border-rose-500/40 p-5 bg-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">تأكيد حذف أو إعفاء القيادة</h3>
                <p className="text-xs text-slate-400">هل أنت متأكد من حذف هذا العضو من الهيكل الإداري؟</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              لن يتم حذف أي بيانات أو سجلات طلاب مرتبطة بهذا الإجراء، وسيتم إخلاء المنصب ليتم تعيين خادم بديل من قبل الأمانة العامة.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMember(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                تأكيد الحذف والإعفاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
