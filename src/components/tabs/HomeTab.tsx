import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCalendarStore } from '../../stores/useCalendarStore';
import { useClientStore } from '../../stores/useClientStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import {
  Calendar,
  Users,
  Plus,
  Banknote,
  Sparkles,
  LayoutDashboard,
  Globe,
  BookOpen,
  Megaphone,
  BarChart3,
  Settings
} from 'lucide-react';
import { AddAppointmentModal } from '../calendar/AddAppointmentModal';
import { AddClientModal } from '../crm/AddClientModal';
import { PaymentModal } from '../finances/PaymentModal';
import { AIComplexityModal } from '../ai/AIComplexityModal';

export const HomeTab: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { payments } = useFinanceStore();
  
  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Дневен оборот на касата
  const todayDate = '2026-10-14';
  const todayRevenue = payments
    .filter((p) => p.date === todayDate)
    .reduce((sum, p) => sum + p.finalPaidAmount, 0);

  const navItems = [
    { name: 'Home', icon: LayoutDashboard, action: () => {} },
    { name: 'Clients', icon: Users, action: () => setIsAddClientOpen(true) },
    { name: 'Online presence', icon: Globe, action: () => {} },
    { name: 'Catalogue', icon: BookOpen, action: () => {} },
    { name: 'Marketing', icon: Megaphone, action: () => {} },
    { name: 'Team', icon: Users, action: () => {} },
    { name: 'Reports', icon: BarChart3, action: () => {} },
    { name: 'Add-ons', icon: Plus, action: () => {} },
  ];

  return (
    <div className="space-y-4">
      {/* Business Wallet Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 shadow-xl text-white">
        <p className="text-sm font-medium opacity-90">Business wallet</p>
        <h2 className="text-4xl font-bold mt-1">€{todayRevenue.toFixed(2)}</h2>
        <button className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold hover:bg-white/30 transition">
          View wallet
        </button>
      </div>

      {/* Grid of Navigation Cards */}
      <div className="grid grid-cols-2 gap-4">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={item.action}
            className="bg-[#1E1E1E] p-6 rounded-3xl flex flex-col items-start gap-4 hover:bg-[#252525] transition-colors shadow-lg border border-[#2A2A2A]"
          >
            <item.icon size={28} className="text-slate-200" />
            <span className="text-lg font-medium text-slate-100">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Modals */}
      <AddAppointmentModal
        isOpen={isAddAptOpen}
        onClose={() => setIsAddAptOpen(false)}
        onOpenNewClientModal={() => {
          setIsAddAptOpen(false);
          setIsAddClientOpen(true);
        }}
      />
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />
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
