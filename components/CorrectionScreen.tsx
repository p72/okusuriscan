
import React, { useState, useEffect } from 'react';
import { OcrResult, Medication } from '../types';
import { CalendarIcon, PillIcon } from './Icons';

interface CorrectionScreenProps {
  ocrResult: OcrResult;
  image: string;
  onSave: (correctedData: OcrResult) => void;
  onCancel: () => void;
}

export const CorrectionScreen: React.FC<CorrectionScreenProps> = ({ ocrResult, image, onSave, onCancel }) => {
  const [formData, setFormData] = useState<OcrResult>({ prescriptionDate: '', medications: [] });

  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(ocrResult))); // Deep copy
  }, [ocrResult]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, prescriptionDate: e.target.value }));
  };

  const handleMedicationChange = <T,>(
    index: number, 
    field: keyof Omit<Medication, 'id'>, 
    value: T
  ) => {
    setFormData(prev => {
      const newMedications = [...prev.medications];
      const medToUpdate = { ...newMedications[index] };
      (medToUpdate[field] as any) = value;
      newMedications[index] = medToUpdate;
      return { ...prev, medications: newMedications };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 text-center">読み取り内容の確認・修正</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Image Pane */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-slate-700 mb-3">元の処方箋画像</h2>
            <div className="max-h-[70vh] overflow-auto rounded-md border border-slate-200">
              <img src={image} alt="読み取った処方箋" className="w-full h-auto" />
            </div>
          </div>

          {/* Form Pane */}
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col">
            <h2 className="text-lg font-semibold text-slate-700 mb-3">読み取り結果</h2>
            <div className="space-y-6 flex-grow overflow-auto pr-2">
              <div className="relative">
                <label htmlFor="prescriptionDate" className="block text-sm font-medium text-slate-600 mb-1">処方日</label>
                 <div className="relative">
                    <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      id="prescriptionDate"
                      value={formData.prescriptionDate}
                      onChange={handleDateChange}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                </div>
              </div>
              
              <div className="space-y-4">
                {formData.medications.map((med, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                     <div className="flex items-center gap-2 mb-3">
                        <PillIcon className="w-5 h-5 text-teal-600"/>
                        <h3 className="text-md font-semibold text-slate-800">薬剤 {index + 1}</h3>
                     </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor={`medName-${index}`} className="block text-sm font-medium text-slate-600 mb-1">薬剤名</label>
                        <input type="text" id={`medName-${index}`} value={med.name} onChange={e => handleMedicationChange(index, 'name', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500" placeholder="例: タケキャブ錠20mg" />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor={`medUsage-${index}`} className="block text-sm font-medium text-slate-600 mb-1">用法・用量</label>
                        <input type="text" id={`medUsage-${index}`} value={med.usage} onChange={e => handleMedicationChange(index, 'usage', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500" placeholder="例: 1日3回毎食後 1日6錠" />
                      </div>
                      <div>
                        <label htmlFor={`medDays-${index}`} className="block text-sm font-medium text-slate-600 mb-1">日数</label>
                        <input type="number" id={`medDays-${index}`} value={med.days} onChange={e => handleMedicationChange(index, 'days', parseInt(e.target.value, 10) || 0)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500" placeholder="例: 14" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end space-x-3">
              <button type="button" onClick={onCancel} className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
                キャンセル
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};