import React from 'react';
import { Prescription } from '../types';
import { InventoryList } from './InventoryList';
import { CameraIcon, PhotoIcon } from './Icons';

interface HomeScreenProps {
  prescriptions: Prescription[];
  onCameraScanClick: () => void;
  onLibraryScanClick: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ prescriptions, onCameraScanClick, onLibraryScanClick }) => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">お薬の在庫</h1>
        <p className="text-slate-500 mt-1">現在服用中の、在庫があるお薬の一覧です。</p>
      </header>
      
      <InventoryList prescriptions={prescriptions} />

      <div className="fixed bottom-6 right-6 flex items-center space-x-3">
        <button
          onClick={onLibraryScanClick}
          className="bg-white text-blue-600 border border-slate-300 rounded-full p-3 shadow-lg hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
          aria-label="写真ライブラリから選択"
        >
          <PhotoIcon className="w-7 h-7" />
        </button>
        <button
          onClick={onCameraScanClick}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
          aria-label="処方箋をスキャンする"
        >
          <CameraIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};