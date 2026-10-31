import React from 'react';
import { Calendar, Clock, MapPin, User, Bus } from 'lucide-react';
import { AuthUser } from '../types';

interface SchedulePageProps {
  user: AuthUser;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ user }) => {
  const events = [
    {
      id: 'e-1',
      title: 'القداس الإلهي الأسبوعي لطلبة جامعة المنيا',
      type: 'قداس إلهي',
      date: 'كل يوم أحد',
      time: '6:30 ص - 8:30 ص',
      location: 'كنيسة الشهيد مارجرجس - مغاغة',
      leader: 'نيافة الأنبا أغابيوس أسقف مغاغة والعدوة',
      region: 'المنيا وبني سويف',
    },
    {
      id: 'e-2',
      title: 'لقاء خريجي وثانوي عام المقبلين على الجامعة',
      type: 'اجتماع روحي',
      date: 'الجمعة القادمة',
      time: '6:00 م - 8:30 م',
      location: 'مطرانية مغاغة - القاعة الكبرى',
      leader: 'خدام الأمانة العامة',
      region: 'جميع الأسر',
    },
    {
      id: 'e-3',
      title: 'باص عودة الطلاب المغتربين (القاهرة و٦ أكتوبر إلى مغاغة)',
      type: 'باص الانتقالات',
      date: 'كل يوم خميس',
      time: '3:00 م',
      location: 'نقطة التجمع: ميدان الرماية - 6 أكتوبر',
      leader: 'مسؤول الباصات: أ. يوسف إبراهيم',
      region: 'القاهرة و٦ أكتوبر',
    },
    {
      id: 'e-4',
      title: 'لقاء شباب أسرة أسيوط الشهري والمناقشة الروحية',
      type: 'اجتماع روحي',
      date: 'أول ثلاثاء من الشهر',
      time: '7:00 م',
      location: 'كنيسة رئيس الملائكة - أسيوط',
      leader: 'أبونا يوحنا كاهن خدمة الشباب',
      region: 'أسيوط',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Calendar className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-amber-400">الأنشطة والخدمات الميدانية</span>
        </div>
        <h1 className="text-lg sm:text-2xl font-black text-white">
          جدول المواعيد والأنشطة والانتقالات
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          مواعيد الاجتماعات الروحية، القداسات، باصات السفر والانتقال للمغتربين بين مغاغة ومحافظات الجامعات.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((ev) => (
          <div key={ev.id} className="glass-card rounded-2xl p-5 border border-slate-700/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  {ev.type}
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">{ev.title}</h3>
                <span className="text-[11px] text-sky-400 font-semibold">{ev.region}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  الموعد:
                </span>
                <span className="font-semibold text-white">{ev.date}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  التوقيت:
                </span>
                <span className="font-semibold text-white">{ev.time}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  المكان:
                </span>
                <span className="text-slate-200">{ev.location}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  المسؤول:
                </span>
                <span className="text-slate-200">{ev.leader}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
