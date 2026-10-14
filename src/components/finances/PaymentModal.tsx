import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Percent,
  CheckCircle2,
  DollarSign,
  User,
  Sparkles,
  PieChart,
  ArrowRight
} from 'lucide-react';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useCalendarStore } from '../../stores/useCalendarStore';
import type { Appointment, PaymentMethod } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  onPaymentCompleted?: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'В брой (Кеш)', icon: '💵' },
  { id: 'card', label: 'ПОС / Карта', icon: '💳' },
  { id: 'revolut', label: 'Revolut Pay', icon: '⚡' },
  { id: 'bank_transfer', label: 'Банков път', icon: '🏦' }
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onPaymentCompleted
}) => {
  const { settings, calculateSplit, addPayment } = useFinanceStore();
  const { appointments, updateAppointment } = useCalendarStore();

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointment?.id || '');
  const [totalAmount, setTotalAmount] = useState<number>(appointment?.estimatedPrice || 250);
  const [depositDeducted, setDepositDeducted] = useState<number>(appointment?.deposit || 0);
  const [materialFee, setMaterialFee] = useState<number>(settings.materialFeeDefault || 0);
  const [studioCutPercent, setStudioCutPercent] = useState<number>(settings.defaultStudioCutPercent);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<boolean>(false);

  // Синхронизация при отваряне с подадена резервация
  useEffect(() => {
    if (appointment) {
      setSelectedAppointmentId(appointment.id);
      setTotalAmount(appointment.estimatedPrice);
      setDepositDeducted(appointment.deposit);
    } else if (appointments.length > 0 && !selectedAppointmentId) {
      const firstApt = appointments[0];
      setSelectedAppointmentId(firstApt.id);
      setTotalAmount(firstApt.estimatedPrice);
      setDepositDeducted(firstApt.deposit);
    }
  }, [appointment, appointments, selectedAppointmentId]);

  if (!isOpen) return null;

  const currentApt = appointments.find((a) => a.id === selectedAppointmentId) || appointment;

  // Автоматично изчисляване на сплита в реално време
  const split = calculateSplit(
    Number(totalAmount) || 0,
    Number(depositDeducted) || 0,
    Number(materialFee) || 0,
    Number(studioCutPercent)
  );

  const handleAppointmentChange = (aptId: string) => {
    setSelectedAppointmentId(aptId);
    const chosen = appointments.find((a) => a.id === aptId);
    if (chosen) {
      setTotalAmount(chosen.estimatedPrice);
      setDepositDeducted(chosen.deposit);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApt) return;

    setIsSubmitting(true);

    const res = await addPayment({
      appointmentId: currentApt.id,
      clientId: currentApt.clientId,
      clientName: currentApt.clientName,
      artistId: currentApt.artistId,
      artistName: currentApt.artistName,
      tattooTitle: currentApt.tattooType,
      totalAmount: Number(totalAmount),
      depositDeducted: Number(depositDeducted),
      finalPaidAmount: split.finalPaidAmount,
      materialFee: split.materialFee,
      studioCutPercent: split.studioCutPercent,
      studioAmount: split.studioAmount,
      artistAmount: split.artistAmount,
      paymentMethod,
      notes: notes.trim() || undefined,
      date: new Date().toISOString().split('T')[0]
    });

    setIsSubmitting(false);

    if (res.success) {
      // Маркираме резервацията като завършена
      updateAppointment(currentApt.id, { status: 'completed' });
      setSuccessReceipt(true);
      if (onPaymentCompleted) onPaymentCompleted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#233030] border border-[#3e4f4e] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Хедър */}
        <div className="px-5 py-3.5 border-b border-[#303d3c] flex items-center justify-between bg-[#1b2525]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#762685]/30 text-[#d48be6] border border-[#762685]/50 flex items-center justify-center">
              <Banknote size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Приемане на плащане</h3>
              <p className="text-[11px] text-slate-400">Автоматичен сплит за каса и татуист</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#303d3c] text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Съдържание */}
        <div className="p-5 overflow-y-auto flex-1">
          {successReceipt ? (
            /* Успешна разписка */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-950/80 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">
                  Плащането е записано успешно!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Записано във Firestore колекция <strong className="text-white">payments</strong>
                </p>
              </div>

              <div className="p-4 bg-[#1e2a29] border border-[#3e4f4e] rounded-2xl max-w-sm mx-auto text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Обща стойност на сесията:</span>
                  <span className="font-bold text-white">{totalAmount} лв</span>
                </div>
                {depositDeducted > 0 && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Приспаднато капаро:</span>
                    <span className="text-amber-300">-{depositDeducted} лв</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-200 font-bold pt-1 border-t border-[#303d3c]">
                  <span>Платено на каса:</span>
                  <span className="text-emerald-400 text-sm">{split.finalPaidAmount} лв</span>
                </div>
                <div className="pt-2 border-t border-[#303d3c] grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#243130] p-2 rounded-xl border border-[#3a4a49]">
                    <p className="text-slate-400">Каса на студиото ({split.studioCutPercent}%):</p>
                    <p className="font-extrabold text-[#d48be6] text-sm mt-0.5">{split.studioAmount} лв</p>
                  </div>
                  <div className="bg-[#243130] p-2 rounded-xl border border-[#3a4a49]">
                    <p className="text-slate-400">Нето за {currentApt?.artistName} ({split.artistCutPercent}%):</p>
                    <p className="font-extrabold text-white text-sm mt-0.5">{split.artistAmount} лв</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full max-w-sm py-2.5 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                Готово
              </button>
            </div>
          ) : (
            /* Форма за плащане */
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Избор на резервация */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Резервация / Клиент *
                </label>
                <select
                  value={selectedAppointmentId}
                  onChange={(e) => handleAppointmentChange(e.target.value)}
                  className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#762685]"
                >
                  {appointments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.clientName} • {apt.tattooType} ({apt.artistName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Финансови полета */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Крайна цена на сесията (лв) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-[#762685]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Приспаднато капаро (лв)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={depositDeducted}
                    onChange={(e) => setDepositDeducted(Number(e.target.value))}
                    className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-sm text-amber-300 font-bold focus:outline-none focus:border-[#762685]"
                  />
                </div>
              </div>

              {/* Процент за касата от настройките */}
              <div className="bg-[#1e2a29] p-3.5 rounded-2xl border border-[#3c4c4b] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Percent size={14} className="text-[#d48be6]" />
                    Разпределение според настройките:
                  </span>
                  <span className="text-slate-400">
                    Студио: <strong className="text-white">{studioCutPercent}%</strong> / Артист:{' '}
                    <strong className="text-white">{100 - studioCutPercent}%</strong>
                  </span>
                </div>

                {/* Визуално разпределение */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-[#263433] p-2.5 rounded-xl border border-[#762685]/40 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Каса студио ({split.studioCutPercent}%)</span>
                      <span className="text-[#d48be6] font-bold">HDI</span>
                    </div>
                    <p className="text-lg font-black text-[#d48be6] mt-0.5">
                      {split.studioAmount} лв
                    </p>
                  </div>

                  <div className="bg-[#263433] p-2.5 rounded-xl border border-emerald-900/40 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Нето артист ({split.artistCutPercent}%)</span>
                      <span className="text-emerald-400 font-bold">{currentApt?.artistName}</span>
                    </div>
                    <p className="text-lg font-black text-white mt-0.5">
                      {split.artistAmount} лв
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2e3e3d] flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>Общо за доплащане на каса:</span>
                  <span className="text-emerald-400 text-sm font-mono">{split.finalPaidAmount} лв</span>
                </div>
              </div>

              {/* Начин на плащане */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Метод на плащане *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#762685] text-white border-[#9b39af] shadow-md'
                            : 'bg-[#303d3c] text-slate-300 border-[#3e4f4e] hover:bg-[#384847]'
                        }`}
                      >
                        <span className="text-base">{method.icon}</span>
                        <span>{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Бележка */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Бележка към плащането
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="напр. Редовен клиент, без бакшиш..."
                  className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
                />
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
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-98 shadow-[0_0_15px_rgba(118,38,133,0.4)] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Записване...' : `Приеми ${split.finalPaidAmount} лв`}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
