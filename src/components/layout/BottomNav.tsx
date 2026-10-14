import React from 'react';
import { Home, Calendar, Users, Activity, Menu, type LucideIcon } from 'lucide-react';
import type { TabId } from '../../types';

interface BottomNavProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
}

interface NavItemConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const navItems: NavItemConfig[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: '3' },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Activity, badge: '2' },
    { id: 'menu', label: 'Menu', icon: Menu },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a2424]/95 backdrop-blur-md border-t border-[#303d3c] px-2 py-1.5 transition-all max-w-lg mx-auto"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Главна мобилна навигация"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              {isActive && (
                <span className="absolute inset-x-2 inset-y-1 bg-[#762685]/30 border border-[#762685]/60 rounded-xl -z-10 shadow-[0_0_12px_rgba(118,38,133,0.35)]" />
              )}

              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-[#d48be6]' : ''
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-[#762685] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#1a2424] shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-1 font-medium tracking-tight transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#762685] rounded-full mt-0.5 shadow-[0_0_6px_#762685]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
