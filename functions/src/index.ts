import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Секретен API ключ за Gemini, съхраняван сигурно в Google Cloud Secret Manager
const geminiApiKey = defineSecret('GEMINI_API_KEY');

export interface AnalyzeTattooRequest {
  description: string;
  bodyLocation?: string;
  sizeCm?: string;
}

export interface AnalyzeTattooResponse {
  complexityLevel: 'Ниска (1/5)' | 'Умерена (2/5)' | 'Висока (3/5)' | 'Много висока (4/5)' | 'Майсторска / Пълен проект (5/5)';
  estimatedHoursMin: number;
  estimatedHoursMax: number;
  recommendedSessions: number;
  recommendedNeedles: string[];
  recommendedVoltage: string;
  painIndex: string;
  technicalAdvice: string;
  recommendedPriceMin: number;
  recommendedPriceMax: number;
}

/**
 * Cloud Function: analyzeTattooComplexity
 * Приема текстово описание на татуировката от фронтенда,
 * извиква сигурно Gemini API от бекенда (без достъп на клиента до API ключа)
 * и връща структурирана оценка за сложността и техническите параметри.
 */
export const analyzeTattooComplexity = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    cors: true
  },
  async (request): Promise<AnalyzeTattooResponse> => {
    const data = request.data as AnalyzeTattooRequest;

    if (!data.description || data.description.trim().length < 5) {
      throw new HttpsError(
        'invalid-argument',
        'Моля въведете подробно текстово описание на татуировката (минимум 5 символа).'
      );
    }

    const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'GEMINI_API_KEY не е конфигуриран в Cloud Functions Secrets.'
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const systemPrompt = `
Ти си експертен Главен Татуист и Технически Директор на престижното студио "Hacienda Di Ink Studio".
Твоята задача е да оцениш сложността на предложен татуировъчен проект по текстово описание.

Анализирай:
1. Ниво на сложност:
   - "Ниска (1/5)" (минималистични надписи, прости контури, малки символи до 5 см)
   - "Умерена (2/5)" (средни фини линии, флорални мотиви, леко засенчване, 5-12 см)
   - "Висока (3/5)" (детайлен реализъм, преливки, японски мотиви, орнаменти, 12-20 см)
   - "Много висока (4/5)" (микрореализъм, цветни детайлни портрети, сложни композиции)
   - "Майсторска / Пълен проект (5/5)" (пълен ръкав, цял гръб, мултисесиен реализъм)
2. Приблизително времетраене в часове (estimatedHoursMin и estimatedHoursMax).
3. Препоръчителен брой сесии (1, 2, 3+).
4. Препоръчителен размер игли (напр. 03RL, 07CM, 17RM, 15M1 и др.).
5. Препоръчителен работен волтаж (напр. "7.0V - 7.8V").
6. Индекс на болка и чувствителност според анатомичното място.
7. Професионален технически съвет за подготовка, дезинфекция и заздравяване.
8. Препоръчителен ценови диапазон в лева (BGN).

Върни САМО валиден JSON обект в следния формат:
{
  "complexityLevel": "Висока (3/5)",
  "estimatedHoursMin": 3.0,
  "estimatedHoursMax": 4.5,
  "recommendedSessions": 1,
  "recommendedNeedles": ["03RL", "07CM", "17RM"],
  "recommendedVoltage": "7.2V - 7.8V",
  "painIndex": "Умерена към висока за тази анатомична зона",
  "technicalAdvice": "Конкретен съвет за преливките и грижата с Dermalize фолио",
  "recommendedPriceMin": 280,
  "recommendedPriceMax": 400
}
`;

    const userPrompt = `
Проект за оценка:
- Описание на татуировката: "${data.description}"
- Анатомично място: "${data.bodyLocation || 'Неуточнено'}"
- Приблизителен размер: "${data.sizeCm || 'Стандартен'}"
`;

    try {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt }
      ]);

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText) as AnalyzeTattooResponse;
      return parsed;
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Gemini API Error in Cloud Function:', error);
      throw new HttpsError('internal', 'Грешка при AI анализа на татуировката: ' + (error.message || ''));
    }
  }
);
