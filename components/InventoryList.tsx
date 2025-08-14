
import React, { useMemo } from 'react';
import { Prescription } from '../types';
import { PillIcon, ClockIcon } from './Icons';

interface InventoryListProps {
  prescriptions: Prescription[];
}

const calculateRemainingDays = (prescriptionDate: string, days: number): number => {
  const startDate = new Date(prescriptionDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + days);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
  
  const diffTime = endDate.getTime() - today.getTime();
  if (diffTime < 0) return 0;
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const InventoryList: React.FC<InventoryListProps> = ({ prescriptions }) => {
  const activeMedications = useMemo(() => {
    return prescriptions
      .flatMap(p => 
        p.medications.map(m => ({
          ...m,
          remainingDays: calculateRemainingDays(p.prescriptionDate, m.days)
        }))
      )
      .filter(m => m.remainingDays > 0)
      .sort((a, b) => a.remainingDays - b.remainingDays);
  }, [prescriptions]);

  if (activeMedications.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white rounded-lg shadow-md">
        <PillIcon className="w-12 h-12 mx-auto text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-700">在庫のお薬はありません</h3>
        <p className="mt-1 text-slate-500">右下のカメラボタンから新しい処方箋をスキャンして始めましょう。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeMedications.map((med) => (
        <div key={med.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-teal-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-slate-800">{med.name}</h3>
              <p className="text-sm text-slate-600">{med.dosage}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <span className="font-bold text-xl text-teal-600">{med.remainingDays}</span>
              <span className="text-sm text-slate-500"> 日分</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center text-sm text-slate-500">
            <ClockIcon className="w-4 h-4 mr-2 text-slate-400" />
            <span>{med.usage}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
