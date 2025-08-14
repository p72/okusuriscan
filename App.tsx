import React, { useState, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { CorrectionScreen } from './components/CorrectionScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { Spinner, HomeIcon, HistoryIcon, PillIcon } from './components/Icons';
import { extractPrescriptionInfo } from './services/geminiService';
import { Prescription, OcrResult, Screen } from './types';

// Utility to convert file to base64
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // remove data:image/...;base64, prefix
    };
    reader.onerror = error => reject(error);
  });


export default function App() {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [currentOcrResult, setCurrentOcrResult] = useState<OcrResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const libraryInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraScanClick = () => {
    cameraInputRef.current?.click();
  };

  const handleLibraryScanClick = () => {
    libraryInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    const imageUrl = URL.createObjectURL(file);
    setCurrentImage(imageUrl);
    
    try {
      const base64Image = await toBase64(file);
      const result = await extractPrescriptionInfo(base64Image);
      setCurrentOcrResult(result);
      setScreen('CORRECTION');
    } catch (e: any) {
      setError(e.message || '不明なエラーが発生しました。');
      setScreen('HOME'); // Go back home on error
    } finally {
      setIsLoading(false);
      // Reset file input value to allow selecting the same file again
      if(event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSave = useCallback((correctedData: OcrResult) => {
    if (!currentImage) return;

    const newPrescription: Prescription = {
      id: crypto.randomUUID(),
      prescriptionDate: correctedData.prescriptionDate,
      medications: correctedData.medications.map(med => ({
        ...med,
        id: crypto.randomUUID()
      })),
      originalImage: currentImage,
    };

    setPrescriptions(prev => [...prev, newPrescription]);
    setScreen('HOME');
    setCurrentOcrResult(null);
    setCurrentImage(null);
  }, [currentImage]);

  const handleCancel = useCallback(() => {
    setScreen('HOME');
    setCurrentOcrResult(null);
    setCurrentImage(null);
  }, []);
  
  const renderScreen = () => {
    switch (screen) {
      case 'HISTORY':
        return <HistoryScreen prescriptions={prescriptions} />;
      case 'CORRECTION':
        if (currentOcrResult && currentImage) {
          return <CorrectionScreen ocrResult={currentOcrResult} image={currentImage} onSave={handleSave} onCancel={handleCancel} />;
        }
        // Fallback to home if data is missing
        setScreen('HOME');
        return <HomeScreen prescriptions={prescriptions} onCameraScanClick={handleCameraScanClick} onLibraryScanClick={handleLibraryScanClick} />;
      case 'HOME':
      default:
        return <HomeScreen prescriptions={prescriptions} onCameraScanClick={handleCameraScanClick} onLibraryScanClick={handleLibraryScanClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PillIcon className="w-8 h-8 text-blue-600"/>
              <span className="text-xl font-bold text-slate-800">処方箋スキャン</span>
            </div>
            <nav className="flex items-center gap-2">
                 <button onClick={() => setScreen('HOME')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${screen === 'HOME' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <HomeIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">ホーム</span>
                </button>
                 <button onClick={() => setScreen('HISTORY')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${screen === 'HISTORY' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <HistoryIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">履歴</span>
                </button>
            </nav>
        </div>
      </header>
      
      <main className="flex-grow w-full max-w-4xl mx-auto">
        {error && (
            <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
                <p className="font-bold">エラー</p>
                <p>{error}</p>
            </div>
        )}
        {renderScreen()}
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center z-50">
          <Spinner className="w-16 h-16 text-white" />
          <p className="text-white text-lg mt-4 font-semibold">AIが処方箋を読み取り中...</p>
          <p className="text-slate-300 mt-1">しばらくお待ちください</p>
        </div>
      )}

      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="environment"
      />
      <input
        type="file"
        ref={libraryInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
}