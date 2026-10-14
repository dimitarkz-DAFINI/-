import React, { useState } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import type { TabId } from '../../types';

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

  const currentTab = controlledTab !== undefined ? controlledTab : internalTab;
  const handleTabChange = (tab: TabId) => {
    if (controlledOnTabChange) {
      controlledOnTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 flex flex-col font-sans selection:bg-[#762685] selection:text-white">
      {/* Фиксиран студиен хедер с брандинг и профили */}
      <Header />

      {/* Основно мобилно съдържание (Mobile-first центриран контейнер с фон #1f2b2b) */}
      <main className="flex-1 w-full max-w-lg mx-auto bg-[#1f2b2b] pb-24 shadow-2xl relative min-h-[calc(100vh-60px)] border-x border-[#2c3a39]/40">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Мобилна долна лента с 5 таба */}
      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
};
