
export interface Medication {
  id: string;
  name: string;
  usage: string; // 例: "1日3回毎食後 1回1錠"
  days: number;
}

export interface Prescription {
  id: string;
  prescriptionDate: string; // YYYY-MM-DD
  medications: Medication[];
  originalImage: string; // Data URL of the original image
}

export type Screen = 'HOME' | 'CORRECTION' | 'HISTORY';

// The expected structure from the Gemini API
export interface OcrResult {
  prescriptionDate: string;
  medications: Omit<Medication, 'id'>[];
}
