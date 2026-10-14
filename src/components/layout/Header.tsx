import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Wifi, Sparkles, UserCheck, ChevronDown, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, availableUsers, switchUser } = useAuthStore();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#192424]/95 backdrop-blur-md border-b border-[#303d3c] px-4 py-3 transition-colors">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Брандинг на студиото */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#762685] via-[#491a52] to-[#1f2b2b] p-0.5 shadow-[0_0_15px_rgba(118,38,133,0.4)] border border-[#762685]/40 flex items-center justify-center">
            <div className="w-full h-full bg-[#182323] rounded-[10px] flex items-center justify-center">
              <span className="font-serif font-black text-xs text-[#e8b5ff] tracking-tighter">
                HDI
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-wide uppercase text-white font-serif">
                Hacienda Di Ink
              </h1>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span>Tattoo Art & Design</span>
              <span className="text-slate-600">•</span>
              <span className="text-[#a855f7] font-semibold">Studio PWA</span>
            </p>
          </div>
        </div>

        {/* Бутон за превключване на активен артист (Димитър / Ивана) */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchModal(!showSwitchModal)}
            className="flex items-center gap-2 bg-[#263332] hover:bg-[#303d3c] border border-[#3d4d4c] rounded-full pl-1.5 pr-2.5 py-1 transition-all active:scale-95 shadow-sm"
            title="Смяна на потребител (Димитър / Ивана)"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#762685]">
              <img
                src={currentUser?.avatarUrl}
                alt={currentUser?.name || 'Артист'}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-semibold text-slate-100">
              {currentUser?.name}
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Модален списък за превключване */}
          {showSwitchModal && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSwitchModal(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-[#233030] border border-[#3d4d4c] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[#303d3c] mb-1">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Активен татуист
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Изберете профил за сесията
                  </p>
                </div>

                <div className="space-y-1">
                  {availableUsers.map((user) => {
                    const isSelected = currentUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setShowSwitchModal(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                          isSelected
                            ? 'bg-[#762685]/30 border border-[#762685]/50 text-white'
                            : 'hover:bg-[#2c3a39] text-slate-300'
                        }`}
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#4a5a59]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-100">
                              {user.name}
                            </span>
                            {isSelected && (
                              <UserCheck size={14} className="text-[#d48be6]" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user.specialty}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-[#303d3c] px-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wifi size={12} />
                    IndexedDB Offline OK
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <ShieldCheck size={12} />
                    Admin
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
