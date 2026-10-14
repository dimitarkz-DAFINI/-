import React, { useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Flame,
  Zap,
  Layers,
  Droplet,
  FileCheck2,
  Plus,
  FileText
} from 'lucide-react';
import { useSessionStore } from '../../stores/useSessionStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { TechnicalSessionLogModal } from '../sessions/TechnicalSessionLogModal';
import { DigitalWaiverModal } from '../waiver/DigitalWaiverModal';

export const SessionsTab: React.FC = () => {
  const { sessions } = useSessionStore();
  const { currentUser } = useAuthStore();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  return (
    <div className="space-y-4">
      {/* Хедър с бързи действия */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity size={18} className="text-[#d48be6]" />
            Сесии & Технически лог
          </h2>
          <p className="text-xs text-slate-400">
            Волтаж, игли, пигменти и дигитални декларации
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsWaiverModalOpen(true)}
            className="flex items-center gap-1 bg-[#283837] hover:bg-[#344645] text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#3e4f4e] transition-all"
            title="Дигитално съгласие с подпис"
          >
            <FileCheck2 size={13} className="text-[#d48be6]" />
            <span>Waiver</span>
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus size={14} />
            <span>Нов лог</span>
          </button>
        </div>
      </div>

      {/* Сесия на живо на стола (Live Session Tracker) */}
      <div className="bg-gradient-to-br from-[#303d3c] to-[#253231] p-4 rounded-2xl border border-[#762685]/50 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#d48be6] bg-[#762685]/30 px-2.5 py-0.5 rounded-full border border-[#762685]/50 flex items-center gap-1">
            <Flame size={12} className="text-amber-400" />
            В момента на стола при {currentUser?.name}
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-black/40 px-2 py-0.5 rounded-lg border border-emerald-900/60">
            {isTimerRunning ? '01:45:20' : '01:45:20 (ПАУЗА)'}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-white">
          Александър Стоянов • Dragon Forearm Realism
        </h3>
        <p className="text-xs text-slate-300 mt-0.5">
          Игли: 03RL Liners + 17RM Magnums • Dynamic Triple Black
        </p>

        <div className="mt-4 pt-3 border-t border-[#3e4f4e] flex items-center gap-2">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#3c4e4d] hover:bg-[#485d5c] text-slate-200 text-xs font-semibold py-2 rounded-xl transition-all"
          >
            {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isTimerRunning ? 'Пауза' : 'Продължи'}</span>
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-bold py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <CheckCircle2 size={14} />
            <span>Завърши & Логни данни</span>
          </button>
        </div>
      </div>

      {/* Списък със записани технически сесии във Firestore */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Технически журнал (Firestore Sessions)
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            {sessions.length} записани лога
          </span>
        </div>

        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-[#2d3a39] p-4 rounded-2xl border border-[#3e4f4e] hover:border-[#762685]/50 transition-all shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{s.tattooTitle}</h4>
                  <p className="text-xs text-slate-300">
                    Клиент: <strong className="text-white">{s.clientName}</strong> ({s.bodyLocation})
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/60 font-mono">
                    <Zap size={11} /> {s.voltage} V
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.date}</p>
                </div>
              </div>

              {/* Игли и пигменти */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                    <Layers size={12} className="text-[#d48be6]" /> Игли:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {s.needleSizes.map((n, idx) => (
                      <span
                        key={idx}
                        className="bg-[#1f2b2b] text-slate-200 px-2 py-0.5 rounded border border-[#3d4d4c] text-[10px] font-mono"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                    <Droplet size={12} className="text-cyan-400" /> Мастила:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {s.inksUsed.map((ink, idx) => (
                      <span
                        key={idx}
                        className="bg-[#1f2b2b] text-cyan-200 px-2 py-0.5 rounded border border-cyan-900/60 text-[10px]"
                      >
                        {ink}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {s.notes && (
                <p className="text-[11px] text-slate-300 bg-[#243130] p-2 rounded-xl border border-[#384847]">
                  {s.notes}
                </p>
              )}

              {/* Футър на картата */}
              <div className="pt-2 border-t border-[#3a4a49] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-[#d48be6]" />
                  Изработено: <strong className="text-white">{s.durationMinutes} мин.</strong>
                </span>
                <span className="font-bold text-emerald-400">{s.priceCharged} лв</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модали за технически лог и дигитална декларация */}
      <TechnicalSessionLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />

      <DigitalWaiverModal
        isOpen={isWaiverModalOpen}
        onClose={() => setIsWaiverModalOpen(false)}
      />
    </div>
  );
};
