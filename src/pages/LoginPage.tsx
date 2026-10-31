import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  ShieldCheck,
  MapPin,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AuthUser, RegionId } from '../types';
import { REGIONS, INITIAL_REGIONAL_ACCOUNTS } from '../data/constants';
import { TurnstileProtection } from '../components/TurnstileProtection';
import { RegionalAccount } from '../types';

import { authenticateUser } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [selectedPreset, setSelectedPreset] = useState<'admin' | RegionId>('admin');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [simulateBotFail, setSimulateBotFail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Retrieve current active regional accounts (including any updated passwords)
  const getActiveAccounts = (): RegionalAccount[] => {
    try {
      const saved = localStorage.getItem('maghagha_youth_accounts');
      return saved ? JSON.parse(saved) : INITIAL_REGIONAL_ACCOUNTS;
    } catch {
      return INITIAL_REGIONAL_ACCOUNTS;
    }
  };

  // Quick preset login handler
  const handlePresetSelect = (preset: 'admin' | RegionId) => {
    setSelectedPreset(preset);
    setErrorMsg(null);
    if (preset === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      const accounts = getActiveAccounts();
      const account = accounts.find((a) => a.regionId === preset);
      setUsername(account ? account.username : `admin-${preset}`);
      setPassword(account ? account.password : '123456');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // CRITICAL: Strict Bot Security Token Validation
    if (!turnstileToken) {
      setErrorMsg('فشل التحقق الأمني من بروتوكول مكافحة البوتات (Google reCAPTCHA v3). تم حظر محاولة تسجيل الدخول لمنع السكربتات والهجمات المؤتمتة.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await authenticateUser(username, password, turnstileToken);
      onLoginSuccess(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('حدث خطأ غير متوقع أثناء تسجيل الدخول');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0F172A]">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5 animate-in fade-in zoom-in-95 duration-300">
        {/* Service Branding & Diocese Identity */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-xl shadow-sky-500/25 border border-sky-400/40 mb-1">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            منصة الأمانة العامة لخدمة أسر الجامعات
          </h1>
          <p className="text-xs sm:text-sm text-amber-400 font-semibold">
            إيبارشية مغاغة والعدوة للأقباط الأرثوذكس
          </p>
          <p className="text-[11px] text-slate-400">
            منصة تسجيل الدخول الآمن للخدام وأمناء الأسر الإقليمية
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-700/80 shadow-2xl space-y-5">
          {/* Quick Role / Preset Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 text-right">
              اختر نوع الحساب وصلاحية الدخول السريعة:
            </label>
            <div className="grid grid-cols-2 gap-2 text-right">
              <button
                type="button"
                onClick={() => handlePresetSelect('admin')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer col-span-2 justify-center ${
                  selectedPreset === 'admin'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900/80 text-amber-400 hover:bg-slate-800 border border-amber-500/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>الأمانة العامة (صلاحية كاملة لجميع الأسر)</span>
              </button>

              {Object.values(REGIONS).map((reg) => (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => handlePresetSelect(reg.id)}
                  className={`p-2 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedPreset === reg.id
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span className="truncate">{reg.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                اسم المستخدم / كود الخادم
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Google reCAPTCHA v3 & Cloudflare Turnstile Bot Protection */}
            <div className="pt-1">
              <TurnstileProtection
                onVerified={(token) => {
                  setTurnstileToken(token);
                  if (token) setErrorMsg(null);
                }}
                forceFailMode={simulateBotFail}
              />
            </div>

            {/* Simulated Bot Security Test Toggle for QA */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>اختبار فحص البوتات:</span>
              <button
                type="button"
                onClick={() => {
                  setSimulateBotFail(!simulateBotFail);
                  setTurnstileToken(null);
                }}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  simulateBotFail
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {simulateBotFail ? 'وضع الروبوت مفعل (محاكاة فشل التحقق)' : 'محاكاة هجوم بوت آلي'}
              </button>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-300 bg-rose-500/15 p-3 rounded-xl border border-rose-500/40 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'جاري التحقق...' : 'منصة تسجيل الدخول للنظام'}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-400">
            <span>تنبيه: هذا النظام مخصص فقط لأمناء الأسر والخدام المعتمدين بإيبارشية مغاغة والعدوة.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
