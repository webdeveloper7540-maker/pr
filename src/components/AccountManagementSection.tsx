import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Phone,
  User,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { RegionalAccount, RegionId } from '../types';

interface AccountManagementSectionProps {
  accounts: RegionalAccount[];
  onUpdateAccount: (updatedAccount: RegionalAccount) => void;
  onResetAllToDefault: () => void;
}

export const AccountManagementSection: React.FC<AccountManagementSectionProps> = ({
  accounts,
  onUpdateAccount,
  onResetAllToDefault,
}) => {
  // State for showing password plain text per account
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  // Editing state
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editCoordinatorName, setEditCoordinatorName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Notification state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCredentials = (acc: RegionalAccount) => {
    const text = `حساب أسرة: ${acc.regionName}\nاسم المستخدم: ${acc.username}\nكلمة المرور: ${acc.password}\nالمنسق: ${acc.coordinatorName}\nهاتف التواصل: ${acc.contactPhone}`;
    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    setFeedback({
      type: 'success',
      message: `تم نسخ بيانات دخول ${acc.regionName} إلى الحافظة بنجاح`,
    });
    setTimeout(() => {
      setCopiedId(null);
      setFeedback(null);
    }, 3500);
  };

  const handleStartEdit = (acc: RegionalAccount) => {
    setEditingAccountId(acc.id);
    setNewPassword(acc.password);
    setConfirmPassword(acc.password);
    setEditCoordinatorName(acc.coordinatorName);
    setEditContactPhone(acc.contactPhone);
    setFeedback(null);
  };

  const handleCancelEdit = () => {
    setEditingAccountId(null);
    setNewPassword('');
    setConfirmPassword('');
    setEditCoordinatorName('');
    setEditContactPhone('');
  };

  // Password generator utility
  const handleGenerateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
  };

  // Password validation rules
  const isLengthValid = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z\u0621-\u064A]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const isMatch = newPassword === confirmPassword;
  const isStrong = isLengthValid && hasLetter && hasNumber;

  const handleSavePassword = (acc: RegionalAccount) => {
    if (!isLengthValid) {
      setFeedback({
        type: 'error',
        message: 'كلمة المرور ضعيفة: يجب ألا تقل عن 8 أحرف.',
      });
      return;
    }
    if (!hasLetter || !hasNumber) {
      setFeedback({
        type: 'error',
        message: 'يجب أن تحتوي كلمة المرور على أحرف وأرقام معاً.',
      });
      return;
    }
    if (!isMatch) {
      setFeedback({
        type: 'error',
        message: 'كلمتا المرور غير متطابقتين، يرجى التأكد وإعادة المحاولة.',
      });
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated: RegionalAccount = {
      ...acc,
      password: newPassword,
      coordinatorName: editCoordinatorName.trim() || acc.coordinatorName,
      contactPhone: editContactPhone.trim() || acc.contactPhone,
      lastUpdated: formattedDate,
    };

    onUpdateAccount(updated);
    setEditingAccountId(null);
    setNewPassword('');
    setConfirmPassword('');
    setEditCoordinatorName('');
    setEditContactPhone('');
    setFeedback({
      type: 'success',
      message: `تم تحديث وتفعيل بيانات الدخول والمسؤول لحساب ${acc.regionName} بنجاح.`,
    });

    setTimeout(() => {
      setFeedback(null);
    }, 6000);
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>إدارة حسابات وأمان الأسر الإقليمية</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                صلاحية الأمانة العامة
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              متابعة، إعادة تعيين، وتأمين كلمات المرور لحسابات أسر المنيا، بني سويف، أسيوط، والقاهرة
            </p>
          </div>
        </div>

        <button
          onClick={onResetAllToDefault}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="إعادة تعيين جميع الحسابات لكلمات المرور الافتراضية"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>استعادة الضبط الافتراضي</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Accounts List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {accounts.map((acc) => {
          const isEditing = editingAccountId === acc.id;
          const showPw = showPasswordMap[acc.id] || false;

          return (
            <div
              key={acc.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isEditing
                  ? 'bg-slate-900/90 border-amber-500/80 ring-2 ring-amber-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Account Title & Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{acc.regionName}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-400" />
                      <span>{acc.coordinatorName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    نشط
                  </span>
                </div>
              </div>

              {/* Username & Current Password Display */}
              <div className="space-y-2 text-xs text-slate-300 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">اسم المستخدم (Login):</span>
                  <span className="font-mono text-sky-300 font-semibold">{acc.username}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">كلمة المرور الحالية:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-300 font-bold tracking-wider" dir="ltr">
                      {showPw ? acc.password : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(acc.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                      title={showPw ? 'إخفاء' : 'عرض'}
                    >
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    آخر تحديث: {acc.lastUpdated}
                  </span>
                  <span className="font-mono text-slate-400" dir="ltr">
                    {acc.contactPhone}
                  </span>
                </div>
              </div>

              {/* Editing Form or Action Buttons */}
              {isEditing ? (
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      تعديل وتعيين كلمة مرور جديدة
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerateStrongPassword}
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-3 h-3" />
                      توليد كلمة قوية
                    </button>
                  </div>

                  {/* Coordinator & Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">اسم المنسق / مسؤول الأسرة:</label>
                      <input
                        type="text"
                        value={editCoordinatorName}
                        onChange={(e) => setEditCoordinatorName(e.target.value)}
                        placeholder="اسم المنسق"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">هاتف التواصل:</label>
                      <input
                        type="tel"
                        value={editContactPhone}
                        onChange={(e) => setEditContactPhone(e.target.value)}
                        placeholder="012XXXXXXXX"
                        dir="ltr"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400 text-right"
                      />
                    </div>
                  </div>

                  {/* Password Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">كلمة المرور الجديدة:</label>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        dir="ltr"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">تأكيد كلمة المرور:</label>
                      <input
                        type="text"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أعد كتابتها للتأكيد"
                        dir="ltr"
                        className={`w-full px-3 py-1.5 rounded-lg bg-slate-900 border text-white text-xs font-mono focus:outline-none ${
                          confirmPassword && !isMatch ? 'border-rose-500' : 'border-slate-700 focus:border-amber-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Password Rules Checklist */}
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={isLengthValid ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                        ✓ 8 أحرف على الأقل ({newPassword.length}/8)
                      </span>
                      <span className={hasLetter && hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                        ✓ تشمل أرقاماً وحروفاً
                      </span>
                      <span className={isMatch && newPassword ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                        ✓ تطابق الكلمتين
                      </span>
                    </div>
                  </div>

                  {/* Save / Cancel Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSavePassword(acc)}
                      disabled={!isStrong || !isMatch}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>حفظ وتفعيل</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(acc)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === acc.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>نسخ البيانات</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(acc)}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>تغيير كلمة المرور</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
