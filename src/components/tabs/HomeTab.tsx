import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCalendarStore } from '../../stores/useCalendarStore';
import { useClientStore } from '../../stores/useClientStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import {
  Calendar,
  Clock,
  Sparkles,
  Users,
  Zap,
  Plus,
  Flame,
  Banknote,
  DollarSign
} from 'lucide-react';
import { AddAppointmentModal } from '../calendar/AddAppointmentModal';
import { AddClientModal } from '../crm/AddClientModal';
import { PaymentModal } from '../finances/PaymentModal';
import { AIComplexityModal } from '../ai/AIComplexityModal';

export const HomeTab: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { getAppointmentsByDate } = useCalendarStore();
  const { clients } = useClientStore();
  const { payments } = useFinanceStore();

  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Днешни сесии
  const todayDate = '2026-10-14';
  const todayAppointments = getAppointmentsByDate(todayDate, currentUser?.id);
  const allTodayAppointments = getAppointmentsByDate(todayDate, 'all');
  const nextAppointment = todayAppointments[0] || allTodayAppointments[0];

  // Дневен оборот на касата
  const todayRevenue = payments
    .filter((p) => p.date === todayDate)
    .reduce((sum, p) => sum + p.finalPaidAmount, 0);

  return (
    <div className="space-y-4">
      {/* Студиен банер */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#303d3c] via-[#243130] to-[#1a2323] p-5 border border-[#3e4f4e] shadow-lg">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#762685]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#d48be6] uppercase tracking-widest bg-[#762685]/30 px-2.5 py-0.5 rounded-full border border-[#762685]/50">
              Студио Табло • Фаза 4 Finances & AI
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Каса & AI На линия
            </span>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">
            Здравей, {currentUser?.name}!
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {currentUser?.specialty}
          </p>

          <div className="mt-4 pt-3 border-t border-[#3e4f4e]/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#d48be6]" />
              <span>Днес: {todayAppointments.length} сесии за теб ({allTodayAppointments.length} в студиото)</span>
            </div>
            {nextAppointment && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" />
                <span>Следващ: {nextAppointment.startTime} ч.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Бързи показатели */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#303d3c] p-3.5 rounded-xl border border-[#3c4c4b] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Сесии днес</span>
            <Zap size={16} className="text-[#d48be6]" />
          </div>
          <p className="text-2xl font-black text-white">{allTodayAppointments.length}</p>
          <p className="text-[10px] text-amber-300 mt-1 flex items-center gap-0.5">
            <Sparkles size={11} /> +30 мин. буфер за дезинфекция
          </p>
        </div>

        <div className="bg-[#303d3c] p-3.5 rounded-xl border border-[#3c4c4b] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Дневен оборот каса</span>
            <Banknote size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{todayRevenue} лв</p>
          <p className="text-[10px] text-emerald-400 mt-1">
            С автоматичен сплит
          </p>
        </div>
      </div>

      {/* Предстояща сесия */}
      {nextAppointment && (
        <div className="bg-[#243130] p-4 rounded-2xl border border-[#762685]/50 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#d48be6] bg-[#762685]/30 px-2.5 py-0.5 rounded-full border border-[#762685]/50 flex items-center gap-1">
              <Flame size={12} className="text-amber-400" />
              Предстояща сесия на фокус
            </span>
            <span className="text-xs font-bold text-amber-300">
              {nextAppointment.startTime} - {nextAppointment.sessionEndTime}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white">
            {nextAppointment.clientName} • {nextAppointment.tattooType}
          </h4>
          <p className="text-xs text-slate-300">
            Артист: <strong className="text-white">{nextAppointment.artistName}</strong> • {nextAppointment.bodyLocation || 'Татуировка'}
          </p>

          <div className="pt-2 border-t border-[#3a4a49] flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-amber-300">
              🧹 Станцията е свободна в: {nextAppointment.totalSlotEndTime} ч.
            </span>
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="text-emerald-400 font-bold hover:underline"
            >
              Маркирай плащане &gt;
            </button>
          </div>
        </div>
      )}

      {/* Бързи студийни действия: 4 бутона */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 px-0.5">
          Студийни операции
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsAddAptOpen(true)}
            className="flex items-center gap-2.5 bg-[#303d3c] hover:bg-[#3a4948] active:scale-98 p-3 rounded-xl border border-[#3e4f4e] text-left transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#762685] text-white flex items-center justify-center font-bold text-sm shadow">
              <Plus size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Нов час</p>
              <p className="text-[10px] text-slate-400">Smart Calendar</p>
            </div>
          </button>

          <button
            onClick={() => setIsPaymentOpen(true)}
            className="flex items-center gap-2.5 bg-[#303d3c] hover:bg-[#3a4948] active:scale-98 p-3 rounded-xl border border-[#3e4f4e] text-left transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-900/40 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-800 shadow">
              <Banknote size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Приеми плащане</p>
              <p className="text-[10px] text-slate-400">Сплит каса & артист</p>
            </div>
          </button>

          <button
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-2.5 bg-[#303d3c] hover:bg-[#3a4948] active:scale-98 p-3 rounded-xl border border-[#3e4f4e] text-left transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#762685]/30 text-[#d48be6] flex items-center justify-center font-bold text-sm border border-[#762685]/50 shadow">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">AI Оценка</p>
              <p className="text-[10px] text-slate-400">Gemini Cloud Function</p>
            </div>
          </button>

          <button
            onClick={() => setIsAddClientOpen(true)}
            className="flex items-center gap-2.5 bg-[#303d3c] hover:bg-[#3a4948] active:scale-98 p-3 rounded-xl border border-[#3e4f4e] text-left transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center font-bold text-sm border border-[#38bdf8]/30 shadow">
              <Users size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Нов клиент</p>
              <p className="text-[10px] text-slate-400">CRM регистър</p>
            </div>
          </button>
        </div>
      </div>

      {/* Модали */}
      <AddAppointmentModal
        isOpen={isAddAptOpen}
        onClose={() => setIsAddAptOpen(false)}
        onOpenNewClientModal={() => {
          setIsAddAptOpen(false);
          setIsAddClientOpen(true);
        }}
      />

      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />

      <AIComplexityModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />
    </div>
  );
};
