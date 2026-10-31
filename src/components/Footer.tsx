import React from 'react';
import {
  Church,
  Heart,
  Shield,
  Phone,
  MapPin,
  Target,
  Compass,
  CheckCircle2,
  Mail,
  Edit,
  Sparkles,
} from 'lucide-react';
import { ServiceIdentityConfig, AuthUser, RegionId } from '../types';
import { REGIONS, INITIAL_IDENTITY_CONFIG } from '../data/constants';

interface FooterProps {
  identityConfig?: ServiceIdentityConfig;
  user?: AuthUser | null;
  onOpenIdentitySettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  identityConfig = INITIAL_IDENTITY_CONFIG,
  user,
  onOpenIdentitySettings,
}) => {
  const generalLogo = identityConfig.generalLogoUrl || INITIAL_IDENTITY_CONFIG.generalLogoUrl;
  const familyLogos = {
    ...INITIAL_IDENTITY_CONFIG.familyLogos,
    ...identityConfig.familyLogos,
  };

  return (
    <footer className="w-full glass-panel border-t border-slate-700/80 mt-auto py-8 sm:py-10 bg-slate-950/90 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Row: Logos & Service Branding */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          {/* General Secretariat Logo & Title */}
          <div className="flex items-center gap-3.5">
            {generalLogo ? (
              <img
                src={generalLogo}
                alt="لوجو الأمانة العامة"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-2xl bg-slate-900 border border-amber-500/40 p-1 shadow-lg shadow-amber-500/10 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Church className="w-7 h-7" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-400">
                  إيبارشية مغاغة والعدوة للأقباط الأرثوذكس
                </span>
                {user?.role === 'GENERAL_SECRETARIAT' && onOpenIdentitySettings && (
                  <button
                    onClick={onOpenIdentitySettings}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="تعديل الشعارات والرؤية والفوتر"
                  >
                    <Edit className="w-3 h-3 text-amber-400" />
                    <span>تعديل الهوية والفوتر</span>
                  </button>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                منصة الأمانة العامة لخدمة أسر شباب الجامعات
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                خدمة ورعاية أسر شباب الجامعات (المنيا، بني سويف، أسيوط، والقاهرة و٦ أكتوبر)
              </p>
            </div>
          </div>

          {/* Regional Family Logos Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap pl-1">
              شعارات الأسر:
            </span>
            {(Object.keys(REGIONS) as RegionId[]).map((regId) => {
              const regObj = REGIONS[regId];
              const logo = familyLogos[regId];
              return (
                <div
                  key={regId}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
                  title={regObj.fullName}
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt={regObj.name}
                      className="w-7 h-7 object-contain rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <Compass className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  )}
                  <span className="text-[11px] font-bold text-slate-300">{regObj.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Section: Vision, Mission, and Strategic Goals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right">
          {/* Vision Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-slate-900/60 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Target className="w-4 h-4" />
              <span>الرؤية (Vision):</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {identityConfig.vision || INITIAL_IDENTITY_CONFIG.vision}
            </p>
          </div>

          {/* Mission Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-sky-500/10 to-slate-900/60 border border-sky-500/30 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <Compass className="w-4 h-4" />
              <span>الرسالة (Mission):</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {identityConfig.mission || INITIAL_IDENTITY_CONFIG.mission}
            </p>
          </div>

          {/* Strategic Goals List */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-slate-900/60 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>الأهداف الإستراتيجية:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              {(identityConfig.goals || INITIAL_IDENTITY_CONFIG.goals).map((goal, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-tight">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Contact Section & Phone Numbers Strip */}
        <div className="pt-5 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Contact Phones */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold text-xs flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>أرقام التواصل المباشر:</span>
            </span>
            {(identityConfig.contactPhones || INITIAL_IDENTITY_CONFIG.contactPhones).map((ph, idx) => (
              <a
                key={idx}
                href={`tel:${ph}`}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-xs transition-colors"
                dir="ltr"
              >
                {ph}
              </a>
            ))}
          </div>

          {/* Address & Rights */}
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{identityConfig.address || INITIAL_IDENTITY_CONFIG.address}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>نظام مؤمّن © {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Copyright Banner */}
        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1 border-t border-slate-900">
          <span>صُمم بكل</span>
          <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
          <span>لخدمة شباب جامعة إيبارشية مغاغة والعدوة للأقباط الأرثوذكس</span>
        </div>
      </div>
    </footer>
  );
};
