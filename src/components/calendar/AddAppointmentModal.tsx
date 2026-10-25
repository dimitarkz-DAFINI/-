import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Banknote
} from 'lucide-react';
import { useCalendarStore, calculateSessionTimes, BUFFER_MINUTES } from '../../stores/useCalendarStore';
import { useClientStore } from '../../stores/useClientStore';
import { useAuthStore } from '../../stores/useAuthStore';
import type { SlotAvailabilityResult } from '../../types';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  onOpenNewClientModal?: () => void;
}

const DURATION_OPTIONS = [
  { label: '1 час (60 мин.)', value: 60 },
  { label: '1.5 часа (90 мин.)', value: 90 },
  { label: '2 часа (120 мин.)', value: 120 },
  { label: '2.5 часа (150 мин.)', value: 150 },
  { label: '3 часа (180 мин.)', value: 180 },
  { label: '4 часа (240 мин.)', value: 240 },
  { label: '5 часа (300 мин.)', value: 300 },
  { label: '6 часа (360 мин.)', value: 360 }
];

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  onOpenNewClientModal
}) => {
  const { clients } = useClientStore();
  const { availableUsers, currentUser } = useAuthStore();
  const { addAppointment, checkSlotAvailability } = useCalendarStore();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState(currentUser?.id || 'dimitar');
  const [date, setDate] = useState(initialDate || '2026-10-14');
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [tattooType, setTattooType] = useState('');
  const [bodyLocation, setBodyLocation] = useState('Предмишница');
  const [estimatedPrice, setEstimatedPrice] = useState('200');
  const [deposit, setDeposit] = useState('50');
  const [notes, setNotes] = useState('');
  const [validationResult, setValidationResult] = useState<SlotAvailabilityResult>({ available: true });

  // Автоматично избиране на първи клиент при зареждане
  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  // Изчисляване на времената на сесията и 30-минутния буфер
  const timeCalc = calculateSessionTimes(startTime, durationMinutes);

  // Реално-времева проверка за застъпване при всяка промяна
  useEffect(() => {
    if (!date || !startTime || !durationMinutes || !selectedArtistId) return;

    const result = checkSlotAvailability(
      selectedArtistId,
      date,
      startTime,
      durationMinutes
    );
    setValidationResult(result);
  }, [date, startTime, durationMinutes, selectedArtistId, checkSlotAvailability]);

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedArtist = availableUsers.find((u) => u.id === selectedArtistId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validationResult.available) {
      return;
    }

    if (!selectedClient) {
      alert('Моля изберете клиент.');
      return;
    }

    const res = await addAppointment({
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientPhone: selectedClient.phone,
      artistId: selectedArtistId,
      artistName: selectedArtist?.name || 'Татуист',
      date,
      startTime,
      durationMinutes,
      tattooType: tattooType.trim() || 'Tattoo Project',
      bodyLocation: bodyLocation.trim() || undefined,
      estimatedPrice: Number(estimatedPrice) || 0,
      deposit: Number(deposit) || 0,
      status: 'confirmed',
      notes: notes.trim() || undefined
    });

    if (res.success) {
      onClose();
    } else {
      alert(res.error || 'Грешка при запазване на резервацията.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#233030] border border-[#3e4f4e] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Хедър */}
        <div className="px-5 py-3.5 border-b border-[#303d3c] flex items-center justify-between bg-[#1b2525]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#762685]/30 text-[#d48be6] border border-[#762685]/50 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Нова резервация</h3>
              <p className="text-[11px] text-slate-400">Smart Calendar с буфер за дезинфекция</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#303d3c] text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Индикатор за времеви конфликт (Критично правило) */}
          {!validationResult.available ? (
            <div className="p-3.5 bg-rose-950/80 border-2 border-rose-600 rounded-2xl flex items-start gap-3 text-xs text-rose-200 shadow-lg animate-in zoom-in-95">
              <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-white text-xs uppercase tracking-wide">
                  ⛔ Времеви конфликт! Часът е блокиран
                </p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  {validationResult.conflictReason}
                </p>
                <p className="mt-1.5 text-[10px] text-rose-300 font-semibold bg-rose-900/60 p-1.5 rounded-lg border border-rose-700/60">
                  Правило на студиото: Всяка сесия изисква задължителни 30 мин. буфер за дезинфекция след края си!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-950/50 border border-emerald-700/60 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span className="font-semibold text-[11px]">
                Времевият слот е свободен (вкл. 30 мин. буфер за стерилизация)
              </span>
            </div>
          )}

          {/* Избор на клиент */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Клиент от CRM *
              </label>
              {onOpenNewClientModal && (
                <button
                  type="button"
                  onClick={onOpenNewClientModal}
                  className="text-[11px] font-bold text-[#d48be6] hover:underline"
                >
                  + Нов клиент
                </button>
              )}
            </div>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#762685]"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) {c.allergies !== 'Няма алергии' ? '⚠️' : ''}
                </option>
              ))}
            </select>
            {selectedClient && selectedClient.allergies && selectedClient.allergies !== 'Няма алергии' && (
              <p className="text-[10px] text-amber-300 mt-1 flex items-center gap-1 font-semibold">
                ⚠️ Внимание: {selectedClient.allergies}
              </p>
            )}
          </div>

          {/* Избор на артист */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Татуист (Артист) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableUsers.map((user) => {
                const isSelected = selectedArtistId === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedArtistId(user.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#762685]/40 border-[#762685] text-white shadow-md'
                        : 'bg-[#303d3c] border-[#3e4f4e] text-slate-300 hover:bg-[#384746]'
                    }`}
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.specialty}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Дата и начален час */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Дата *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Начален час *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
              />
            </div>
          </div>

          {/* Продължителност на сесията */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Продължителност на татуиране *
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#762685]"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Визуален калкулатор на времето с 30-минутния буфер */}
          <div className="bg-[#1e2a29] p-3.5 rounded-2xl border border-[#3c4c4b] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Clock size={14} className="text-[#d48be6]" />
                Сесия с клиента:
              </span>
              <span className="font-bold text-white">
                {timeCalc.startTime} - {timeCalc.sessionEndTime} ({durationMinutes} мин.)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#2e3e3d]">
              <span className="text-amber-300 flex items-center gap-1.5 font-medium">
                <Sparkles size={14} className="text-amber-400" />
                Дезинфекция & подготовка на станцията:
              </span>
              <span className="font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                +30 мин. (до {timeCalc.totalSlotEndTime} ч.)
              </span>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              Следващ свободен час за {selectedArtist?.name}: от{' '}
              <strong className="text-white">{timeCalc.totalSlotEndTime} ч.</strong>
            </p>
          </div>

          {/* Проект и анатомична позиция */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Мотив / Проект *
              </label>
              <input
                type="text"
                required
                value={tattooType}
                onChange={(e) => setTattooType(e.target.value)}
                placeholder="напр. Dragon Realism"
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Анатомично място
              </label>
              <input
                type="text"
                value={bodyLocation}
                onChange={(e) => setBodyLocation(e.target.value)}
                placeholder="Предмишница, ребра..."
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
              />
            </div>
          </div>

          {/* Цена и депозит */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Ориентировъчна цена (лв)
              </label>
              <input
                type="number"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Капаро / Депозит (лв)
              </label>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
              />
            </div>
          </div>

          {/* Бутони */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#303d3c] hover:bg-[#3d4d4c] text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={!validationResult.available}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all ${
                !validationResult.available
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  : 'bg-[#762685] hover:bg-[#8d2fa0] text-white active:scale-98 shadow-[0_0_15px_rgba(118,38,133,0.4)]'
              }`}
            >
              Потвърди резервацията
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
