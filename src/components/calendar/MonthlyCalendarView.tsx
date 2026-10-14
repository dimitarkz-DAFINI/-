import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  User,
  Plus,
  ShieldCheck,
  Calendar as CalendarIcon,
  Flame,
  Filter
} from 'lucide-react';
import { useCalendarStore } from '../../stores/useCalendarStore';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Appointment } from '../../types';

interface MonthlyCalendarViewProps {
  onOpenAddModal: (date?: string) => void;
}

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const MONTH_NAMES = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
];

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ onOpenAddModal }) => {
  const {
    appointments,
    selectedDate,
    setSelectedDate,
    selectedArtistFilter,
    setSelectedArtistFilter,
    getAppointmentsByDate
  } = useCalendarStore();
  const { availableUsers } = useAuthStore();

  // Инициализиране на текущ месец (Октомври 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // 0-based: 9 = Октомври

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  // Изчисляване на дни в месеца
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  // Ден от седмицата за 1-во число (0 = Неделя, 1 = Понеделник)
  let firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay();
  // Преобразуване към европейски стандарт (Пн = 0, Нд = 6)
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Филтрирани часове за избрания ден
  const dayAppointments = getAppointmentsByDate(selectedDate, selectedArtistFilter);

  return (
    <div className="space-y-4">
      {/* Хедър с месец и навигация */}
      <div className="bg-[#243130] p-3.5 rounded-2xl border border-[#3e4f4e] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#d48be6]" />
            <h3 className="text-base font-extrabold text-white">
              {MONTH_NAMES[currentMonthIndex]} {currentYear}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-[#303d3c] text-slate-300 hover:text-white transition-colors"
              title="Предишен месец"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => {
                setCurrentYear(2026);
                setCurrentMonthIndex(9);
                setSelectedDate('2026-10-14');
              }}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#303d3c] text-slate-300 hover:text-white"
            >
              Днес
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-[#303d3c] text-slate-300 hover:text-white transition-colors"
              title="Следващ месец"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Филтриране по артист (Димитър / Ивана / Всички) */}
        <div className="flex items-center gap-1.5 bg-[#1b2525] p-1 rounded-xl border border-[#303d3c] mb-3">
          <button
            onClick={() => setSelectedArtistFilter('all')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
              selectedArtistFilter === 'all'
                ? 'bg-[#762685] text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Всички артисти
          </button>
          {availableUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedArtistFilter(u.id)}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                selectedArtistFilter === u.id
                  ? 'bg-[#762685] text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: u.colorBadge }}
              />
              {u.name}
            </button>
          ))}
        </div>

        {/* Заглавия на дните от седмицата */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS_OF_WEEK.map((day) => (
            <span key={day} className="text-[11px] font-bold text-slate-400 py-1">
              {day}
            </span>
          ))}
        </div>

        {/* Месечна решетка */}
        <div className="grid grid-cols-7 gap-1">
          {/* Празни клетки преди първия ден */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 rounded-xl bg-transparent" />
          ))}

          {/* Дните от месеца */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${pad(currentMonthIndex + 1)}-${pad(dayNum)}`;
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === '2026-10-14';

            // Часове за този ден съобразени с филтъра
            const dayApts = appointments.filter((a) => {
              if (a.date !== dateStr || a.status === 'cancelled') return false;
              if (selectedArtistFilter !== 'all' && a.artistId !== selectedArtistFilter) return false;
              return true;
            });

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-11 rounded-xl p-1 flex flex-col items-center justify-between transition-all relative ${
                  isSelected
                    ? 'bg-[#762685] text-white font-black shadow-[0_0_12px_rgba(118,38,133,0.6)] scale-105 z-10 border border-[#b853cb]'
                    : isToday
                    ? 'bg-[#303d3c] border border-amber-400/80 text-amber-300 font-bold'
                    : 'bg-[#1e2a29] hover:bg-[#2c3c3a] text-slate-200 border border-[#303d3c]/50'
                }`}
              >
                <span className="text-xs leading-none">{dayNum}</span>

                {/* Точки за сесии */}
                <div className="flex items-center gap-0.5 justify-center min-h-[6px]">
                  {dayApts.slice(0, 3).map((apt) => (
                    <span
                      key={apt.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          apt.artistId === 'dimitar' ? '#d48be6' : '#f59e0b'
                      }}
                    />
                  ))}
                  {dayApts.length > 3 && (
                    <span className="text-[8px] font-bold text-slate-400">+</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* График за избрания ден с буфери за дезинфекция */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              График за {selectedDate}
            </h4>
            <p className="text-[11px] text-slate-400">
              {dayAppointments.length} записани сесии
            </p>
          </div>
          <button
            onClick={() => onOpenAddModal(selectedDate)}
            className="flex items-center gap-1.5 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus size={14} />
            <span>Нов час</span>
          </button>
        </div>

        {dayAppointments.length === 0 ? (
          <div className="bg-[#243130] p-6 rounded-2xl border border-dashed border-[#3e4f4e] text-center space-y-2">
            <p className="text-xs text-slate-400">Няма записани часове за тази дата.</p>
            <button
              onClick={() => onOpenAddModal(selectedDate)}
              className="inline-flex items-center gap-1.5 text-xs text-[#d48be6] font-bold hover:underline"
            >
              <Plus size={14} /> Добави резервация
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-[#2d3a39] rounded-2xl border border-[#3e4f4e] overflow-hidden shadow-sm hover:border-[#762685]/60 transition-all"
              >
                {/* Карта на сесията */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#762685]/50 px-2.5 py-0.5 rounded-lg border border-[#762685]">
                      <Clock size={12} className="text-[#d48be6]" />
                      {apt.startTime} - {apt.sessionEndTime} ({apt.durationMinutes} мин.)
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 bg-[#1e2a29] px-2.5 py-0.5 rounded-full border border-[#3e4f4e] flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            apt.artistId === 'dimitar' ? '#762685' : '#b87333'
                        }}
                      />
                      {apt.artistName}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <User size={14} className="text-slate-400" />
                      {apt.clientName}
                    </h5>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      {apt.tattooType} {apt.bodyLocation && `• ${apt.bodyLocation}`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#3a4a49] flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Ориентир: <strong className="text-white">{apt.estimatedPrice} лв</strong>
                    </span>
                    <span>
                      Депозит: <strong className="text-emerald-400">{apt.deposit} лв</strong>
                    </span>
                  </div>
                </div>

                {/* ВИЗУАЛЕН БУФЕР ЗА ДЕЗИНФЕКЦИЯ (КРИТИЧНО ПРАВИЛО) */}
                <div className="bg-[#1e2928] px-3.5 py-2 border-t border-[#3a4a49] flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Дезинфекция & подготовка на станцията ({apt.bufferMinutes} мин.)</span>
                  </div>
                  <span className="font-mono text-slate-300 bg-[#283635] px-2 py-0.5 rounded border border-[#3c4c4b]">
                    {apt.sessionEndTime} - {apt.totalSlotEndTime} ч.
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
