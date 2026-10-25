import React, { useState } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import type { TabId } from '../../types';
import { AddAppointmentModal } from '../calendar/AddAppointmentModal';
import { AddClientModal } from '../crm/AddClientModal';

interface AppLayoutProps {
  children?: React.ReactNode;
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab: controlledTab,
  onTabChange: controlledOnTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<TabId>('home');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const currentTab = controlledTab !== undefined ? controlledTab : internalTab;
  const handleTabChange = (tab: TabId) => {
    if (controlledOnTabChange) {
      controlledOnTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 flex flex-col font-sans selection:bg-[#2563FF] selection:text-white">
      {/* Фиксиран студиен хедер */}
      <Header />

      {/* Основно мобилно съдържание */}
      <main className="flex-1 w-full max-w-lg mx-auto bg-[#121212] pb-24 shadow-2xl relative min-h-[calc(100vh-60px)]">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Мобилна долна лента */}
      <BottomNav 
        currentTab={currentTab} 
        onTabChange={handleTabChange} 
        onAddClick={() => setIsQuickAddOpen(true)}
      />

      {/* Quick Add Menu */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsQuickAddOpen(false)}>
          <div className="bg-[#1e1e1e] w-full max-w-sm rounded-3xl p-4 shadow-2xl animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Бързи действия</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setIsQuickAddOpen(false); setIsAddAptOpen(true); }} className="p-4 bg-[#2563FF]/10 text-[#2563FF] rounded-2xl flex flex-col items-center gap-2 border border-[#2563FF]/20">
                <Calendar size={24} />
                <span className="text-xs font-bold">Нов час</span>
              </button>
              <button onClick={() => { setIsQuickAddOpen(false); setIsAddClientOpen(true); }} className="p-4 bg-[#2563FF]/10 text-[#2563FF] rounded-2xl flex flex-col items-center gap-2 border border-[#2563FF]/20">
                <Users size={24} />
                <span className="text-xs font-bold">Нов клиент</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AddAppointmentModal isOpen={isAddAptOpen} onClose={() => setIsAddAptOpen(false)} onOpenNewClientModal={() => { setIsAddAptOpen(false); setIsAddClientOpen(true); }} />
      <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} />
    </div>
  );
};
