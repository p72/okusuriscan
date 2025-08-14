
import { GoogleGenAI, Type } from "@google/genai";
import { OcrResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const prescriptionSchema = {
  type: Type.OBJECT,
  properties: {
    prescriptionDate: {
      type: Type.STRING,
      description: '処方箋の発行日。必ずYYYY-MM-DD形式で出力してください。',
    },
    medications: {
      type: Type.ARRAY,
      description: '処方された薬剤のリスト。処方箋に書かれている順番を維持してください。',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: '薬剤名（規格を含む。例：タケキャブ錠20mg）' },
          usage: { type: Type.STRING, description: '用法・用量: 服用に関する指示が書かれている部分を、計算や推測をせず、書かれている通りにそのまま抽出してください。例：「1日3回毎食後 1日6錠」' },
          days: { type: Type.INTEGER, description: '処方日数（例：7）' }
        },
        required: ['name', 'usage', 'days']
      }
    }
  },
  required: ['prescriptionDate', 'medications']
};


export const extractPrescriptionInfo = async (imageBase64: string): Promise<OcrResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `あなたは日本の紙の処方箋（処方せん）を読み取るための高精度AI-OCRです。
あなたのタスクは、画像に書かれている情報をそのままテキストとして抽出することです。書かれていない情報を補完したり、1回あたりの服用量を計算したり、推測したりしないでください。処方箋の記載を忠実に再現してください。

提供された処方箋の画像から、以下の情報を指定されたJSON形式で正確に抽出してください。
- 処方箋の発行日
- 処方されている全ての薬剤について、以下の情報:
  - 薬剤名: 規格（mgなど）も含めた正式名称を抽出してください。例：タケキャブ錠20mg
  - 用法・用量: 服用に関する指示（タイミング、回数、1日あたりの量など）が書かれている部分を、そのまま抽出してください。
  - 日数: 何日分処方されているかを抽出してください。例：7日分

結果は必ず指定されたJSONスキーマに従って出力してください。薬剤のリストは、処方箋に記載されている通りの順番を維持してください。
日付は必ず「YYYY-MM-DD」形式で返してください。`,
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: prescriptionSchema,
      },
    });

    const jsonText = response.text;
    const result = JSON.parse(jsonText);

    // Basic validation
    if (!result.prescriptionDate || !Array.isArray(result.medications)) {
        throw new Error('Invalid JSON structure received from API.');
    }

    return result as OcrResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("処方箋の情報の読み取りに失敗しました。画像の鮮明さを確認し、もう一度お試しください。");
  }
};