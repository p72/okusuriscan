
import React, { useMemo } from 'react';
import { Prescription } from '../types';
import { CalendarIcon, PillIcon } from './Icons';

interface HistoryScreenProps {
  prescriptions: Prescription[];
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ prescriptions }) => {
  const sortedPrescriptions = useMemo(() => {
    return [...prescriptions].sort((a, b) => new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime());
  }, [prescriptions]);

  if (sortedPrescriptions.length === 0) {
    return (
        <div className="p-4 md:p-6 text-center py-10">
             <div className="bg-white rounded-lg shadow-md p-8">
                <CalendarIcon className="w-12 h-12 mx-auto text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-700">履歴はありません</h3>
                <p className="mt-1 text-slate-500">処方箋をスキャンすると、ここに履歴が記録されます。</p>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">お薬の履歴</h1>
      <div className="space-y-6">
        {sortedPrescriptions.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-lg shadow-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-800 text-lg">処方日: {p.prescriptionDate}</span>
              </div>
            </div>
            <div className="space-y-3">
              {p.medications.map(med => (
                <div key={med.id} className="pl-4 border-l-2 border-slate-200">
                  <div className="flex items-center gap-2">
                     <PillIcon className="w-4 h-4 text-slate-500"/>
                     <p className="font-semibold text-slate-700">{med.name} ({med.dosage})</p>
                  </div>
                  <p className="text-sm text-slate-500 ml-6">{med.usage} - {med.days}日分</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
