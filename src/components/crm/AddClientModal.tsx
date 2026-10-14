import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, Instagram, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { useClientStore, normalizePhoneNumber } from '../../stores/useClientStore';
import type { Client } from '../../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded?: (client: Client) => void;
}

const COMMON_ALLERGIES = [
  'Няма алергии',
  'Чувствителност към никел',
  'Латекс',
  'Алкохолни дезинфектанти',
  'Червен пигмент',
  'Зелен сапун'
];

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded
}) => {
  const { addClient, isPhoneDuplicate, getClientByPhone } = useClientStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [allergies, setAllergies] = useState('Няма алергии');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [hasConsent, setHasConsent] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Реално-времева проверка за дублиран телефон
  const isDuplicate = phone.trim().length >= 6 && isPhoneDuplicate(phone);
  const existingClient = isDuplicate ? getClientByPhone(phone) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Моля въведете име на клиента.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Моля въведете телефонен номер.');
      return;
    }

    if (isDuplicate) {
      setErrorMessage(
        `Телефонът вече е регистриран на клиент: ${existingClient?.name}. Дублирани записи не са разрешени!`
      );
      return;
    }

    const result = addClient({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      instagram: instagram.trim() || undefined,
      allergies: allergies.trim() || undefined,
      medicalNotes: medicalNotes.trim() || undefined,
      notes: notes.trim() || undefined,
      hasConsent
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Грешка при запазване на клиента.');
      return;
    }

    if (result.client && onClientAdded) {
      onClientAdded(result.client);
    }

    // Изчистване и затваряне
    setName('');
    setPhone('');
    setEmail('');
    setInstagram('');
    setMedicalNotes('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#233030] border border-[#3e4f4e] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Хедър на модала */}
        <div className="px-5 py-4 border-b border-[#303d3c] flex items-center justify-between bg-[#1b2525]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#762685]/30 text-[#d48be6] border border-[#762685]/50 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Нов клиент в CRM</h3>
              <p className="text-[11px] text-slate-400">Досие, контакт и медицински данни</p>
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
          {/* Грешка или дублиран телефон предупреждение */}
          {(errorMessage || isDuplicate) && (
            <div className="p-3 bg-rose-950/70 border border-rose-700/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
              <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {isDuplicate ? 'Предупреждение за дублиран клиент!' : 'Грешка при валидация'}
                </p>
                <p className="mt-0.5 text-[11px]">
                  {isDuplicate
                    ? `Този телефонен номер (${normalizePhoneNumber(phone)}) вече съществува в базата на клиент "${existingClient?.name}". Моля използвайте съществуващото досие.`
                    : errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Име */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Име и фамилия *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. Александър Стоянов"
              className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
            />
          </div>

          {/* Телефон с live дублирана валидация */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Телефонен номер * (Превенция срещу дублиране)
              </label>
              {phone.length >= 6 && !isDuplicate && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check size={12} /> Свободен номер
                </span>
              )}
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+359 88 123 4567 или 088..."
                className={`w-full bg-[#303d3c] border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none transition-colors ${
                  isDuplicate
                    ? 'border-rose-500 focus:border-rose-400 bg-rose-950/20'
                    : 'border-[#3e4f4e] focus:border-[#762685]'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Автоматична нормализация на формат (напр. 088 към +35988).
            </p>
          </div>

          {/* Имейл и Instagram */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Имейл
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@mail.com"
                  className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Instagram
              </label>
              <div className="relative">
                <Instagram size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@handle"
                  className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
                />
              </div>
            </div>
          </div>

          {/* Медицински данни и алергии */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Алергии и кожна поносимост
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_ALLERGIES.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setAllergies(item)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    allergies === item
                      ? 'bg-[#762685] text-white border-[#9b39af]'
                      : 'bg-[#293736] text-slate-300 border-[#3d4d4c] hover:bg-[#344443]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Специфични алергии или бележки..."
              className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
            />
          </div>

          {/* Допълнителни бележки */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Бележки по проекта / предпочитания
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Стил, идеи за татуировка, предишни проекти..."
              className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685]"
            />
          </div>

          {/* Съгласие */}
          <div className="bg-[#2a3837] p-3 rounded-xl border border-[#3c4c4b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#d48be6]" />
              <div>
                <p className="text-xs font-bold text-white">Информирано съгласие</p>
                <p className="text-[10px] text-slate-400">Подписано здравно съгласие за студиото</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasConsent}
              onChange={(e) => setHasConsent(e.target.checked)}
              className="w-5 h-5 accent-[#762685] rounded cursor-pointer"
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
              disabled={isDuplicate}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all ${
                isDuplicate
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-[#762685] hover:bg-[#8d2fa0] text-white active:scale-98 shadow-[0_0_15px_rgba(118,38,133,0.4)]'
              }`}
            >
              Запази клиента
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
