import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Instagram,
  FileCheck,
  AlertTriangle,
  FileText,
  ExternalLink,
  PenTool,
  Clock
} from 'lucide-react';
import { useClientStore } from '../../stores/useClientStore';
import { AddClientModal } from '../crm/AddClientModal';
import { DigitalWaiverModal } from '../waiver/DigitalWaiverModal';
import type { Client } from '../../types';

export const ClientsTab: React.FC = () => {
  const { clients, searchClients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);
  const [waiverClient, setWaiverClient] = useState<Client | null>(null);

  const filteredClients = searchClients(searchTerm);

  return (
    <div className="space-y-4">
      {/* Хедър */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-[#38bdf8]" />
            Клиентска база (CRM)
          </h2>
          <p className="text-xs text-slate-400">
            {clients.length} клиенти с профили и правни досиета
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus size={14} />
          <span>Нов клиент</span>
        </button>
      </div>

      {/* Търсачка */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Търси по име, телефон или @instagram..."
          className="w-full bg-[#303d3c] border border-[#3e4f4e] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#762685] transition-all"
        />
      </div>

      {/* Списък с клиенти */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="bg-[#243130] p-6 rounded-2xl border border-dashed border-[#3e4f4e] text-center space-y-2">
            <p className="text-xs text-slate-400">Няма намерени клиенти по зададените критерии.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs text-[#d48be6] font-bold hover:underline"
            >
              + Добави нов клиент
            </button>
          </div>
        ) : (
          filteredClients.map((client) => {
            const hasSpecialAllergy = client.allergies && client.allergies !== 'Няма алергии';

            return (
              <div
                key={client.id}
                onClick={() => setSelectedClientDetail(client)}
                className="bg-[#2d3a39] p-4 rounded-2xl border border-[#3e4f4e] hover:border-[#762685]/60 transition-all shadow-sm cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#762685]/30 text-[#d48be6] border border-[#762685]/50 flex items-center justify-center font-bold text-xs">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {client.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{client.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {client.waiverPdfUrl ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60 font-medium">
                        <FileCheck size={11} />
                        PDF Waiver: ДА
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setWaiverClient(client);
                        }}
                        className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/60 font-medium hover:bg-amber-900/80 transition-colors"
                      >
                        <PenTool size={10} />
                        Подпиши Waiver
                      </button>
                    )}
                  </div>
                </div>

                {/* Алергии */}
                {hasSpecialAllergy ? (
                  <div className="bg-amber-950/40 border border-amber-700/60 p-2 rounded-xl flex items-center gap-2 text-[11px] text-amber-200">
                    <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate font-medium">{client.allergies}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 truncate">
                    Алергии: <span className="text-slate-300">Няма алергии</span>
                  </p>
                )}

                {/* Допълнителни данни и бутон за сваляне на PDF */}
                <div className="pt-2 border-t border-[#3a4a49] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-[#d48be6] font-medium">
                    {client.totalSessions} завършени сесии
                  </span>

                  {client.waiverPdfUrl ? (
                    <a
                      href={client.waiverPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
                    >
                      <FileText size={12} />
                      <span>Свали PDF</span>
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-slate-500 text-[10px]">Няма генериран PDF</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Модал за добавяне на клиент */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Модал за Digital Waiver */}
      {waiverClient && (
        <DigitalWaiverModal
          isOpen={Boolean(waiverClient)}
          onClose={() => setWaiverClient(null)}
          prefillClient={waiverClient}
        />
      )}

      {/* Модал за детайли на клиент */}
      {selectedClientDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedClientDetail(null)}
        >
          <div
            className="w-full max-w-md bg-[#233030] border border-[#3e4f4e] rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#303d3c] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {selectedClientDetail.name}
                </h3>
                <p className="text-xs text-[#d48be6]">
                  {selectedClientDetail.totalSessions} сесии в студиото
                </p>
              </div>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                Затвори
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                <a
                  href={`tel:${selectedClientDetail.phone}`}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  {selectedClientDetail.phone}
                </a>
              </div>
              {selectedClientDetail.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span>{selectedClientDetail.email}</span>
                </div>
              )}
              {selectedClientDetail.instagram && (
                <div className="flex items-center gap-2">
                  <Instagram size={14} className="text-slate-400" />
                  <span>{selectedClientDetail.instagram}</span>
                </div>
              )}
            </div>

            {/* Декларация статус в профила */}
            <div className="bg-[#1e2a29] p-3 rounded-2xl border border-[#3c4c4b] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileCheck size={14} className="text-[#d48be6]" />
                  Правна декларация (Waiver)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedClientDetail.waiverPdfUrl
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                }`}>
                  {selectedClientDetail.waiverPdfUrl ? 'ПОДПИСАНА' : 'НЕПОДПИСАНА'}
                </span>
              </div>

              {selectedClientDetail.waiverPdfUrl ? (
                <a
                  href={selectedClientDetail.waiverPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-700/60 flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Преглед на архивирания PDF</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedClientDetail;
                    setSelectedClientDetail(null);
                    setWaiverClient(c);
                  }}
                  className="w-full py-2 bg-[#762685] hover:bg-[#8d2fa0] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow"
                >
                  <PenTool size={14} />
                  <span>Подпиши декларация сега</span>
                </button>
              )}
            </div>

            {selectedClientDetail.medicalNotes && (
              <div className="bg-[#1e2a29] p-3 rounded-xl border border-[#3c4c4b]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Медицински бележки
                </p>
                <p className="text-xs text-slate-200">{selectedClientDetail.medicalNotes}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedClientDetail(null)}
              className="w-full py-2.5 bg-[#303d3c] hover:bg-[#3d4d4c] text-white text-xs font-bold rounded-xl transition-all"
            >
              Затвори
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
