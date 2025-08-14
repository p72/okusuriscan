
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  usage: string;
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
