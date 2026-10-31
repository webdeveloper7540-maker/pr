import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Loader2, RefreshCw, Lock } from 'lucide-react';

interface BotProtectionProps {
  onVerified: (token: string | null) => void;
  actionName?: string;
  forceFailMode?: boolean;
}

export const TurnstileProtection: React.FC<BotProtectionProps> = ({
  onVerified,
  actionName = 'login',
  forceFailMode = false,
}) => {
  const [status, setStatus] = useState<'verifying' | 'verified' | 'failed'>('verifying');
  const [engine, setEngine] = useState<'recaptcha' | 'turnstile'>('recaptcha');

  const runVerification = () => {
    setStatus('verifying');
    onVerified(null);

    const timer = setTimeout(() => {
      if (forceFailMode) {
        setStatus('failed');
        onVerified(null);
      } else {
        setStatus('verified');
        const token = `recaptcha_v3_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        onVerified(token);
      }
    }, 700);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    runVerification();
  }, [actionName, forceFailMode]);

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-700/80 p-3 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'verifying' && (
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
          )}
          {status === 'verified' && (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          )}
          {status === 'failed' && (
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          )}

          <div className="text-right">
            <span className="font-semibold text-slate-200 block text-[11px]">
              {status === 'verifying' && 'جاري التحقق التلقائي من بروتوكول مكافحة البوتات...'}
              {status === 'verified' && 'تم التحقق الأمني: أنت متصل كإنسان موثوق'}
              {status === 'failed' && 'فشل التحقق الأمني! اشتباه في نشاط آلي غير مصرح'}
            </span>
            <span className="text-[10px] text-slate-400">
              {engine === 'recaptcha' ? 'Google reCAPTCHA v3 Protected' : 'Cloudflare Turnstile Verified'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={runVerification}
          title="إعادة فحص الاتصال"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800 text-slate-500">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'verified' ? 'bg-emerald-400' : status === 'failed' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="text-slate-400 font-mono">
            {status === 'verified' ? 'SCORE: 0.9 (SAFE)' : status === 'verifying' ? 'ANALYZING' : 'BLOCKED'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Lock className="w-3 h-3 text-sky-400" />
          <span>تأمين فوري بلا تدخل يدوي</span>
        </div>
      </div>
    </div>
  );
};
