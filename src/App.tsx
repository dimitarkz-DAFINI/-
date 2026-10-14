import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { HomeTab } from './components/tabs/HomeTab';
import { CalendarTab } from './components/tabs/CalendarTab';
import { ClientsTab } from './components/tabs/ClientsTab';
import { SessionsTab } from './components/tabs/SessionsTab';
import { MenuTab } from './components/tabs/MenuTab';
import type { TabId } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'calendar':
        return <CalendarTab />;
      case 'clients':
        return <ClientsTab />;
      case 'sessions':
        return <SessionsTab />;
      case 'menu':
        return <MenuTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </AppLayout>
  );
};

export default App;
