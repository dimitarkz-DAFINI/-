import React, { useState } from 'react';
import {
  X,
  Activity,
  Zap,
  Clock,
  Layers,
  Droplet,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useSessionStore } from '../../stores/useSessionStore';
import { useClientStore } from '../../stores/useClientStore';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Client } from '../../types';

interface TechnicalSessionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillClient?: Client;
  prefillTattooTitle?: string;
  prefillDuration?: number;
}

const COMMON_NEEDLES = [
  '03RL (Тънък контур)',
  '05RL',
  '07RL',
  '07CM (Curved Magnum)',
  '11CM',
  '17RM (Round Magnum)',
  '23RM (Голям пълнеж)',
  '15M1',
  '09RS (Round Shader)'
];

const COMMON_INKS = [
  'Dynamic Triple Black',
  'Dynamic Standard Black',
  'Eternal White Highlight',
  'Solid Ink Dark Grey Wash',
  'World Famous Pitch Black',
  'Panthera Light Grey Wash',
  'Intenze True Black'
];

export const TechnicalSessionLogModal: React.FC<TechnicalSessionLogModalProps> = ({
  isOpen,
  onClose,
  prefillClient,
  prefillTattooTitle,
  prefillDuration
}) => {
  const { clients, incrementSessions } = useClientStore();
  const { currentUser } = useAuthStore();
  const { addSession } = useSessionStore();

  const [selectedClientId, setSelectedClientId] = useState(prefillClient?.id || clients[0]?.id || '');
  const [tattooTitle, setTattooTitle] = useState(prefillTattooTitle || 'Custom Tattoo Work');
  const [bodyLocation, setBodyLocation] = useState('Предмишница');
  const [durationMinutes, setDurationMinutes] = useState(prefillDuration || 120);
  const [voltage, setVoltage] = useState(7.5);
  const [selectedNeedles, setSelectedNeedles] = useState<string[]>(['03RL (Тънък контур)', '17RM (Round Magnum)']);
  const [customNeedle, setCustomNeedle] = useState('');
  const [selectedInks, setSelectedInks] = useState<string[]>(['Dynamic Triple Black', 'Eternal White Highlight']);
  const [customInk, setCustomInk] = useState('');
  const [machineModel, setMachineModel] = useState('Bishop Rotary Power Wand 4.2');
  const [notes, setNotes] = useState('Кожата реагира спокойно. Поставено водоустойчиво Dermalize фолио.');
  const [priceCharged, setPriceCharged] = useState(250);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const activeClient = clients.find((c) => c.id === selectedClientId) || prefillClient;

  const toggleNeedle = (needle: string) => {
    setSelectedNeedles((prev) =>
      prev.includes(needle) ? prev.filter((n) => n !== needle) : [...prev, needle]
    );
  };

  const addCustomNeedle = () => {
    if (customNeedle.trim() && !selectedNeedles.includes(customNeedle.trim())) {
      setSelectedNeedles([...selectedNeedles, customNeedle.trim()]);
      setCustomNeedle('');
    }
  };

  const toggleInk = (ink: string) => {
    setSelectedInks((prev) =>
      prev.includes(ink) ? prev.filter((i) => i !== ink) : [...prev, ink]
    );
  };

  const addCustomInk = () => {
    if (customInk.trim() && !selectedInks.includes(customInk.trim())) {
      setSelectedInks([...selectedInks, customInk.trim()]);
      setCustomInk('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    const res = await addSession({
      clientId: activeClient.id,
      clientName: activeClient.name,
      artistId: currentUser?.id || 'dimitar',
      artistName: currentUser?.name || 'Димитър',
      tattooTitle,
      bodyLocation,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Number(durationMinutes),
      voltage: Number(voltage),
      needleSizes: selectedNeedles,
      inksUsed: selectedInks,
      machineModel,
      notes,
      priceCharged: Number(priceCharged)
    });

    setIsSubmitting(false);

    if (res.success) {
      // Актуализиране на клиентските данни
      incrementSessions(activeClient.id, tattooTitle);
      setSuccessMessage('Сесията е записана успешно във Firestore колекция Sessions!');
      setTimeout(() => {
        onClose();
      }, 1200);
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
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Технически лог след татус</h3>
              <p className="text-[11px] text-slate-400">Синхронизация във Firestore колекция Sessions</p>
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
          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-2xl flex items-center gap-2 text-xs text-emerald-300 animate-in zoom-in-95">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {/* Клиент и проект */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Клиент *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Анатомично място
              </label>
              <input
                type="text"
                value={bodyLocation}
                onChange={(e) => setBodyLocation(e.target.value)}
                placeholder="напр. Предмишница"
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Проект / Мотив на татуировката *
            </label>
            <input
              type="text"
              required
              value={tattooTitle}
              onChange={(e) => setTattooTitle(e.target.value)}
              className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
            />
          </div>

          {/* Волтаж & Изработено време (Ключови изисквания) */}
          <div className="bg-[#1e2a29] p-3.5 rounded-2xl border border-[#3c4c4b] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Zap size={16} className="text-amber-400" />
                Използван волтаж: <strong className="text-amber-300 font-mono text-sm">{voltage} V</strong>
              </span>
              <div className="flex items-center gap-1">
                {[6.5, 7.2, 7.8, 8.5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVoltage(v)}
                    className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                      voltage === v
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-[#293837] text-slate-300 border-[#3d4d4c] hover:bg-[#344645]'
                    }`}
                  >
                    {v}V
                  </button>
                ))}
              </div>
            </div>

            <input
              type="range"
              min="5.0"
              max="11.0"
              step="0.1"
              value={voltage}
              onChange={(e) => setVoltage(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />

            <div className="pt-2 border-t border-[#2e3e3d] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Clock size={16} className="text-[#d48be6]" />
                Изработено време:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-20 bg-[#303d3c] border border-[#3e4f4e] rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:outline-none"
                />
                <span className="text-xs text-slate-400">минути ({(durationMinutes / 60).toFixed(1)} ч.)</span>
              </div>
            </div>
          </div>

          {/* Размер на игли (Изискване: 07CM, 17RM, 3RL и др.) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers size={14} className="text-[#d48be6]" />
              Използвани игли (Конфигурации) *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_NEEDLES.map((needle) => {
                const isSelected = selectedNeedles.includes(needle);
                return (
                  <button
                    key={needle}
                    type="button"
                    onClick={() => toggleNeedle(needle)}
                    className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#762685] text-white border-[#9b39af] shadow'
                        : 'bg-[#303d3c] text-slate-300 border-[#3e4f4e] hover:bg-[#384847]'
                    }`}
                  >
                    {needle} {isSelected ? '✓' : ''}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customNeedle}
                onChange={(e) => setCustomNeedle(e.target.value)}
                placeholder="Друг размер (напр. 09M1, 01RL)..."
                className="flex-1 bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
              />
              <button
                type="button"
                onClick={addCustomNeedle}
                className="px-3 py-1.5 bg-[#3e4f4e] hover:bg-[#4d605f] text-white text-xs font-bold rounded-xl transition-colors"
              >
                + Добави
              </button>
            </div>
          </div>

          {/* Използвани мастила (Изискване: Dynamic Black, Eternal и др.) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Droplet size={14} className="text-cyan-400" />
              Използвани мастила & Пигменти *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_INKS.map((ink) => {
                const isSelected = selectedInks.includes(ink);
                return (
                  <button
                    key={ink}
                    type="button"
                    onClick={() => toggleInk(ink)}
                    className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-900/60 text-cyan-200 border-cyan-500 shadow'
                        : 'bg-[#303d3c] text-slate-300 border-[#3e4f4e] hover:bg-[#384847]'
                    }`}
                  >
                    {ink} {isSelected ? '✓' : ''}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInk}
                onChange={(e) => setCustomInk(e.target.value)}
                placeholder="Друго мастило (напр. Solid Ink Violet)..."
                className="flex-1 bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
              />
              <button
                type="button"
                onClick={addCustomInk}
                className="px-3 py-1.5 bg-[#3e4f4e] hover:bg-[#4d605f] text-white text-xs font-bold rounded-xl transition-colors"
              >
                + Добави
              </button>
            </div>
          </div>

          {/* Модел машина и цена */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Модел машина
              </label>
              <input
                type="text"
                value={machineModel}
                onChange={(e) => setMachineModel(e.target.value)}
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Крайна сума (лв)
              </label>
              <input
                type="number"
                value={priceCharged}
                onChange={(e) => setPriceCharged(Number(e.target.value))}
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
              />
            </div>
          </div>

          {/* Бележки за заздравяване */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Бележки по заздравяването и процедурата
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#762685]"
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
              className="flex-1 py-2.5 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(118,38,133,0.4)]"
            >
              <Save size={15} />
              <span>{isSubmitting ? 'Записване...' : 'Запиши във Firestore'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
