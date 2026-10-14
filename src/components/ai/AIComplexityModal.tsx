import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Brain,
  Clock,
  Layers,
  Zap,
  Banknote,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { callAnalyzeTattooComplexity } from '../../services/aiTattooService';
import type { TattooComplexityAssessment } from '../../types';

interface AIComplexityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToAppointment?: (data: { durationMinutes: number; price: number; notes: string }) => void;
}

const PRESET_IDEAS = [
  'Японски дракон с фини люспи и тъмни сенки на предмишница',
  'Фин надпис с божури (Fine line floral) на рамо и ключица',
  'Цял Black & Grey ръкав с череп, часовник и рози',
  'Микрореализъм цветна пеперуда на ребра'
];

export const AIComplexityModal: React.FC<AIComplexityModalProps> = ({
  isOpen,
  onClose,
  onApplyToAppointment
}) => {
  const [description, setDescription] = useState('');
  const [bodyLocation, setBodyLocation] = useState('Предмишница');
  const [sizeCm, setSizeCm] = useState('15x10 см');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<TattooComplexityAssessment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Моля въведете описание на татуировката.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await callAnalyzeTattooComplexity({
        description: description.trim(),
        bodyLocation,
        sizeCm
      });
      setAssessment(result);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMessage(e.message || 'Възникна грешка при AI анализа.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!assessment) return;
    const avgHours = (assessment.estimatedHoursMin + assessment.estimatedHoursMax) / 2;
    const durationMinutes = Math.round(avgHours * 60);
    const avgPrice = Math.round((assessment.recommendedPriceMin + assessment.recommendedPriceMax) / 2);

    if (onApplyToAppointment) {
      onApplyToAppointment({
        durationMinutes,
        price: avgPrice,
        notes: `AI Оценка (${assessment.complexityLevel}): Игли: ${assessment.recommendedNeedles.join(', ')}. Волтаж: ${assessment.recommendedVoltage}.`
      });
    }
    onClose();
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#762685] to-[#491a52] text-[#e8b5ff] border border-[#762685]/50 flex items-center justify-center shadow">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">AI Оценка на сложност</h3>
                <span className="text-[10px] bg-[#762685]/40 text-[#d48be6] px-2 py-0.5 rounded-full font-bold border border-[#762685]/60">
                  Gemini Backend
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Сигурен анализ през Firebase Cloud Function</p>
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
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-2xl flex items-center gap-2 text-xs text-rose-200">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Форма за анализ */}
          <form onSubmit={handleAnalyze} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Описание на тату проекта *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишете стила, мотива, детайлите, сенките, дали е покриване (cover-up)..."
                className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
              />
            </div>

            {/* Бързи идеи */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IDEAS.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDescription(idea)}
                  className="text-[10px] bg-[#283736] hover:bg-[#334645] text-slate-300 px-2 py-1 rounded-lg border border-[#3c4c4b] transition-colors truncate max-w-[210px]"
                >
                  {idea}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Анатомично място
                </label>
                <input
                  type="text"
                  value={bodyLocation}
                  onChange={(e) => setBodyLocation(e.target.value)}
                  placeholder="Предмишница, ребра..."
                  className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Размер (приблизителен)
                </label>
                <input
                  type="text"
                  value={sizeCm}
                  onChange={(e) => setSizeCm(e.target.value)}
                  placeholder="напр. 15x10 см"
                  className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#762685]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-[#762685] via-[#8d2fa0] to-[#762685] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(118,38,133,0.4)]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Gemini анализира проекта през Cloud Function...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-[#ffd5ff]" />
                  <span>Оцени сложността & Времето с AI</span>
                </>
              )}
            </button>
          </form>

          {/* Резултат от анализа */}
          {assessment && (
            <div className="mt-4 p-4 bg-[#1e2a29] border border-[#762685]/60 rounded-2xl space-y-3 animate-in zoom-in-95 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#303d3c]">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Ниво на сложност:
                  </span>
                  <p className="text-sm font-extrabold text-[#d48be6] mt-0.5">
                    {assessment.complexityLevel}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Ориентировъчна цена:
                  </span>
                  <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                    {assessment.recommendedPriceMin} - {assessment.recommendedPriceMax} лв
                  </p>
                </div>
              </div>

              {/* Метрики */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#243332] p-2.5 rounded-xl border border-[#3a4a49]">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Clock size={12} className="text-[#d48be6]" /> Времетраене:
                  </span>
                  <p className="text-xs font-bold text-white mt-1">
                    {assessment.estimatedHoursMin} - {assessment.estimatedHoursMax} часа
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {assessment.recommendedSessions} {assessment.recommendedSessions === 1 ? 'сесия' : 'сесии'}
                  </p>
                </div>

                <div className="bg-[#243332] p-2.5 rounded-xl border border-[#3a4a49]">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Zap size={12} className="text-amber-400" /> Волтаж:
                  </span>
                  <p className="text-xs font-bold text-amber-300 mt-1">
                    {assessment.recommendedVoltage}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {assessment.painIndex}
                  </p>
                </div>
              </div>

              {/* Препоръчителни игли */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Layers size={11} className="text-[#d48be6]" /> Препоръчителни игли:
                </span>
                <div className="flex flex-wrap gap-1">
                  {assessment.recommendedNeedles.map((needle, i) => (
                    <span
                      key={i}
                      className="bg-[#2a3b3a] text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded border border-[#3d4d4c]"
                    >
                      {needle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Технически съвет от AI */}
              <div className="bg-[#192423] p-2.5 rounded-xl border border-[#334443] text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-white block mb-0.5">Майсторски съвет:</strong>
                {assessment.technicalAdvice}
              </div>

              {/* Бутон за прехвърляне към резервация */}
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <span>Приложи тези данни към резервация</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
