import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { MonthlyCalendarView } from '../calendar/MonthlyCalendarView';
import { AddAppointmentModal } from '../calendar/AddAppointmentModal';
import { AddClientModal } from '../crm/AddClientModal';
import { useCalendarStore } from '../../stores/useCalendarStore';

export const CalendarTab: React.FC = () => {
  const { selectedDate } = useCalendarStore();
  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [modalDate, setModalDate] = useState(selectedDate);

  const handleOpenAddApt = (date?: string) => {
    setModalDate(date || selectedDate);
    setIsAddAptOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Месечен изглед на Smart Calendar */}
      <MonthlyCalendarView onOpenAddModal={handleOpenAddApt} />

      {/* Модал за нова резервация */}
      <AddAppointmentModal
        isOpen={isAddAptOpen}
        onClose={() => setIsAddAptOpen(false)}
        initialDate={modalDate}
        onOpenNewClientModal={() => {
          setIsAddAptOpen(false);
          setIsAddClientOpen(true);
        }}
      />

      {/* Модал за нов клиент */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => {
          setIsAddClientOpen(false);
          setIsAddAptOpen(true);
        }}
      />
    </div>
  );
};
