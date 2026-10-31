import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Compass,
  Home,
  Calendar,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  MapPin,
  KeyRound,
  FileSpreadsheet,
  Crown,
} from 'lucide-react';
import { AuthUser, ActivePage } from '../types';
import { REGIONS } from '../data/constants';

interface HeaderProps {
  user: AuthUser;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onLogout: () => void;
  generalLogoUrl?: string;
  onOpenIdentitySettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activePage,
  onNavigate,
  onLogout,
  generalLogoUrl,
  onOpenIdentitySettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActivePage; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'geomap', label: 'خريطة الطلاب', icon: MapPin },
    { id: 'leadership', label: 'الهيكل والخدام', icon: Crown },
    { id: 'students', label: 'سجل الطلاب', icon: Users },
    { id: 'housing', label: 'السكنات الخارجية', icon: Home },
    { id: 'bulk-import', label: 'استيراد إكسيل', icon: FileSpreadsheet },
    ...(user.role === 'GENERAL_SECRETARIAT'
      ? [{ id: 'security' as ActivePage, label: 'أمان الحسابات', icon: KeyRound, adminOnly: true }]
      : []),
    { id: 'families', label: 'الأسر الإقليمية', icon: Compass },
    { id: 'schedule', label: 'المواعيد', icon: Calendar },
  ];

  const handleNavClick = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const assignedRegion = user.regionId ? REGIONS[user.regionId] : null;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-700/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Service Title */}
          <div className="flex items-center gap-3">
            {generalLogoUrl ? (
              <img
                src={generalLogoUrl}
                alt="لوجو الأمانة العامة"
                onClick={user.role === 'GENERAL_SECRETARIAT' ? onOpenIdentitySettings : undefined}
                className={`w-11 h-11 sm:w-13 sm:h-13 object-contain rounded-2xl bg-slate-900 border border-amber-500/40 p-1 shadow-lg shadow-amber-500/10 flex-shrink-0 ${
                  user.role === 'GENERAL_SECRETARIAT' ? 'cursor-pointer hover:scale-105 transition-transform' : ''
                }`}
                title={user.role === 'GENERAL_SECRETARIAT' ? 'انقر لتعديل هوية المنصة والشعارات' : 'الأمانة العامة'}
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30 flex-shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
            <div className="text-right">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight leading-tight">
                منصة الأمانة العامة لخدمة أسر الجامعات
              </h1>
              <p className="text-[11px] sm:text-xs text-amber-400/90 font-medium">
                إيبارشية مغاغة والعدوة للأقباط الأرثوذكس
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-left bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold text-slate-100">{user.fullName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1 justify-end text-[10px] text-slate-400">
                {user.role === 'GENERAL_SECRETARIAT' ? (
                  <span className="text-amber-400 font-semibold">الأمانة العامة (صلاحية شاملة)</span>
                ) : (
                  <span className="text-sky-300 font-medium flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {assignedRegion?.name || 'مسؤول إقليمي'}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">خروج</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700 focus:outline-none"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-sky-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-dropdown border-b border-slate-700/80 px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{user.fullName}</p>
              <p className="text-[11px] text-amber-400">
                {user.role === 'GENERAL_SECRETARIAT'
                  ? 'الأمانة العامة (جميع الفروع)'
                  : `${assignedRegion?.name || 'مسؤول إقليمي'}`}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs border border-rose-500/40 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
