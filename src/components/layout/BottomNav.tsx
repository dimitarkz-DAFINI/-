import React from 'react';
import { Home, Calendar, Users, Activity, Menu, Plus, type LucideIcon } from 'lucide-react';
import type { TabId } from '../../types';

interface BottomNavProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  onAddClick: () => void;
}

interface NavItemConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, onAddClick }) => {
  const navItems: NavItemConfig[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    // Middle item is special '+' button
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Activity },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] border-t border-[#2e2e2e] px-2 py-1 transition-all max-w-lg mx-auto"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Главна мобилна навигация"
    >
      <div className="flex items-center justify-between">
        {navItems.slice(0, 2).map(renderNavItem)}
        
        {/* Central Plus Button */}
        <button
          onClick={onAddClick}
          className="mx-1 -mt-8 flex items-center justify-center w-14 h-14 bg-[#2563FF] hover:bg-[#1d4ed8] text-white rounded-full shadow-[0_4px_12px_rgba(37,99,255,0.3)] transition-all active:scale-90"
        >
          <Plus size={32} />
        </button>

        {navItems.slice(2).map(renderNavItem)}
      </div>
    </nav>
  );

  function renderNavItem(item: NavItemConfig) {
    const Icon = item.icon;
    const isActive = currentTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 ${
          isActive ? 'text-[#2563FF]' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] mt-0.5 font-medium tracking-tight">
          {item.label}
        </span>
      </button>
    );
  }
};
