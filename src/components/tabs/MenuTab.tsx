import React, { useState } from 'react';
import {
  Banknote,
  Percent,
  Sparkles,
  Palette,
  Wifi,
  Brain,
  ShieldCheck,
  CreditCard,
  UserCheck,
  Settings,
  DollarSign
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { PaymentModal } from '../finances/PaymentModal';
import { AIComplexityModal } from '../ai/AIComplexityModal';

export const MenuTab: React.FC = () => {
  const { currentUser, switchUser, availableUsers } = useAuthStore();
  const { settings, updateSettings, payments } = useFinanceStore();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [studioCut, setStudioCut] = useState(settings.defaultStudioCutPercent);

  // Финансови сметки
  const totalStudioTurnover = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalStudioCash = payments.reduce((sum, p) => sum + p.studioAmount, 0);
  const totalArtistPayouts = payments.reduce((sum, p) => sum + p.artistAmount, 0);

  const handleSaveCut = () => {
    updateSettings({
      defaultStudioCutPercent: Number(studioCut),
      defaultArtistCutPercent: 100 - Number(studioCut)
    });
    alert(`Настройките са запазени: ${studioCut}% за касата на студиото и ${100 - studioCut}% за артиста.`);
  };

  return (
    <div className="space-y-4">
      {/* Профил на артиста */}
      <div className="bg-[#303d3c] p-4 rounded-2xl border border-[#3e4f4e] flex items-center gap-3.5 shadow-sm">
        <img
          src={currentUser?.avatarUrl}
          alt={currentUser?.name}
          className="w-14 h-14 rounded-2xl object-cover border-2 border-[#762685] shadow-md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-white truncate">
              {currentUser?.name}
            </h3>
            <span className="text-[10px] bg-[#762685] text-white px-2 py-0.5 rounded-full font-bold">
              {currentUser?.role === 'admin' ? 'Admin / Artist' : 'Artist'}
            </span>
          </div>
          <p className="text-xs text-slate-300 truncate mt-0.5">
            {currentUser?.email}
          </p>
          <p className="text-[11px] text-[#d48be6] mt-0.5 font-medium">
            {currentUser?.specialty}
          </p>
        </div>
      </div>

      {/* Финансово табло на студиото */}
      <div className="bg-[#243130] p-4 rounded-2xl border border-[#3e4f4e] space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote size={18} className="text-emerald-400" />
            <h4 className="text-sm font-extrabold text-white">Каса & Финанси на студиото</h4>
          </div>
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="px-2.5 py-1 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-bold rounded-xl shadow transition-all"
          >
            + Ново плащане
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#1e2a29] p-2.5 rounded-xl border border-[#303d3c]">
            <p className="text-[10px] text-slate-400">Общ оборот</p>
            <p className="text-sm font-black text-white mt-0.5">{totalStudioTurnover} лв</p>
          </div>
          <div className="bg-[#1e2a29] p-2.5 rounded-xl border border-[#303d3c]">
            <p className="text-[10px] text-slate-400">Каса студио</p>
            <p className="text-sm font-black text-[#d48be6] mt-0.5">{totalStudioCash} лв</p>
          </div>
          <div className="bg-[#1e2a29] p-2.5 rounded-xl border border-[#303d3c]">
            <p className="text-[10px] text-slate-400">Нето артисти</p>
            <p className="text-sm font-black text-emerald-400 mt-0.5">{totalArtistPayouts} лв</p>
          </div>
        </div>
      </div>

      {/* Студийни настройки: % Сплит */}
      <div className="bg-[#303d3c] p-4 rounded-2xl border border-[#3e4f4e] space-y-3">
        <div className="flex items-center gap-2">
          <Percent size={18} className="text-[#d48be6]" />
          <h4 className="text-sm font-extrabold text-white">Разпределение на приходите (%)</h4>
        </div>
        <p className="text-xs text-slate-300">
          Задайте процент, който остава за касата на студиото. Остатъкът автоматично отива като нето хонорар за татуиста.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
              % за студиото:
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={studioCut}
              onChange={(e) => setStudioCut(Number(e.target.value))}
              className="w-full bg-[#1e2a29] border border-[#3e4f4e] rounded-xl px-3 py-2 text-sm text-white font-bold text-center focus:outline-none focus:border-[#762685]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
              % нето за артиста:
            </label>
            <div className="w-full bg-[#1e2a29] border border-[#3e4f4e] rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold text-center">
              {100 - Number(studioCut)}%
            </div>
          </div>
          <div className="pt-4">
            <button
              onClick={handleSaveCut}
              className="px-3.5 py-2 bg-[#3e4f4e] hover:bg-[#4d605f] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Запази
            </button>
          </div>
        </div>
      </div>

      {/* AI Интеграция с Gemini */}
      <div className="bg-gradient-to-br from-[#2b1f31] to-[#1e2a29] p-4 rounded-2xl border border-[#762685]/60 space-y-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#e8b5ff]" />
            <h4 className="text-sm font-extrabold text-white">AI Оценка на сложност (Gemini)</h4>
          </div>
          <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-800">
            Secure Backend
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Оценка на тату проекти по текстово описание. Извиква се през Cloud Function с таен API ключ в бекенда.
        </p>
        <button
          onClick={() => setIsAIOpen(true)}
          className="w-full mt-2 py-2.5 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Sparkles size={15} />
          <span>Отвори AI консултанта за проекти</span>
        </button>
      </div>

      {/* Превключване на активен профил */}
      <div className="bg-[#2a3736] p-3 rounded-2xl border border-[#3c4c4b]">
        <p className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
          Смяна на профил в студиото
        </p>
        <div className="grid grid-cols-2 gap-2">
          {availableUsers.map((u) => {
            const isCurrent = u.id === currentUser?.id;
            return (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-[#762685] text-white font-bold shadow'
                    : 'bg-[#303d3c] hover:bg-[#394847] text-slate-200'
                }`}
              >
                <img
                  src={u.avatarUrl}
                  alt={u.name}
                  className="w-6 h-6 rounded-full object-cover border"
                />
                <span className="text-xs truncate">{u.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Модали */}
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
