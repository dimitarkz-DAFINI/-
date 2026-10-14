import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/config';
import type { TattooComplexityAssessment } from '../types';

export interface TattooAnalysisInput {
  description: string;
  bodyLocation?: string;
  sizeCm?: string;
}

// Декларация на глобалния обект от Android WebView моста
declare global {
  interface Window {
    AndroidTattooAi?: {
      analyzeProject: (
        description: string,
        bodyLocation: string,
        sizeCm: string,
        callbackJs: string
      ) => void;
    };
    __handleAndroidAiResult?: (jsonStr: string) => void;
  }
}

const functions = getFunctions(app, 'europe-west1');

/**
 * Frontend функция: callAnalyzeTattooComplexity
 * 1. Ако работи в мобилното приложение с App Check: извиква директно Firebase AI Logic през моста
 * 2. Ако работи в уеб браузър (Safari / Chrome): извиква сигурната Firebase Cloud Function
 * 3. При липса на мрежа: използва интелигентен офлайн анализ
 */
export const callAnalyzeTattooComplexity = async (
  input: TattooAnalysisInput
): Promise<TattooComplexityAssessment> => {
  // 1. Опит през Android Native Bridge (Firebase AI Logic + App Check)
  if (typeof window !== 'undefined' && window.AndroidTattooAi) {
    try {
      const nativeResult = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Android AI Bridge timeout'));
        }, 15000);

        window.__handleAndroidAiResult = (jsonStr: string) => {
          clearTimeout(timeout);
          resolve(jsonStr);
        };

        window.AndroidTattooAi?.analyzeProject(
          input.description,
          input.bodyLocation || 'Неуточнено',
          input.sizeCm || 'Стандартен',
          'window.__handleAndroidAiResult'
        );
      });

      const parsed = JSON.parse(nativeResult);
      if (parsed && !parsed.error && parsed.complexityLevel) {
        return parsed as TattooComplexityAssessment;
      }
    } catch (e) {
      console.warn('Android AI Bridge fallback to Cloud Function:', e);
    }
  }

  // 2. Опит през Firebase Cloud Function (Secure Backend с таен API ключ)
  try {
    const analyzeFn = httpsCallable<TattooAnalysisInput, TattooComplexityAssessment>(
      functions,
      'analyzeTattooComplexity'
    );

    const response = await analyzeFn(input);
    if (response.data && response.data.complexityLevel) {
      return response.data;
    }
  } catch (error) {
    console.warn('[Firebase Cloud Function] Network or endpoint offline. Using studio intelligence fallback:', error);
  }

  // 3. Интелигентен студиен fallback за непрекъсваемост
  return fallbackStudioAIAnalysis(input);
};

const fallbackStudioAIAnalysis = (input: TattooAnalysisInput): TattooComplexityAssessment => {
  const desc = input.description.toLowerCase();
  const location = (input.bodyLocation || '').toLowerCase();

  const isRealism = desc.includes('реализъм') || desc.includes('realism') || desc.includes('портрет') || desc.includes('дракон');
  const isFineLine = desc.includes('фини') || desc.includes('fine line') || desc.includes('микро') || desc.includes('надпис') || desc.includes('линии');
  const isSleeve = desc.includes('ръкав') || desc.includes('гръб') || desc.includes('sleeve') || desc.includes('цяла ръка');
  const isSensitiveArea = location.includes('ребра') || location.includes('врат') || location.includes('ходило') || location.includes('пръсти') || location.includes('лакът');

  if (isSleeve) {
    return {
      complexityLevel: 'Майсторска / Пълен проект (5/5)',
      estimatedHoursMin: 15.0,
      estimatedHoursMax: 24.0,
      recommendedSessions: 4,
      recommendedNeedles: ['03RL (Детайли)', '07RL', '17RM (Преливки)', '23RM (Плътен фон)'],
      recommendedVoltage: '7.4V - 8.2V',
      painIndex: isSensitiveArea ? 'Висока степен на болка в сгъвките' : 'Умерена до висока за цялата площ',
      technicalAdvice: 'Мултисесиен проект. Започнете с контури и основни маси на първи пас. Минимален интервал между сесиите: 3 седмици за пълна регенерация.',
      recommendedPriceMin: 1400,
      recommendedPriceMax: 2200
    };
  }

  if (isRealism) {
    return {
      complexityLevel: 'Висока (3/5)',
      estimatedHoursMin: 3.5,
      estimatedHoursMax: 5.5,
      recommendedSessions: 1,
      recommendedNeedles: ['03RL (Контури & люспи)', '07CM (Curved Magnum)', '15M1 (Тъмни зони)'],
      recommendedVoltage: '7.2V - 7.8V',
      painIndex: isSensitiveArea ? 'Висока чувствителност' : 'Умерена поносимост',
      technicalAdvice: 'Полагайте светлите тонове първо, за да избегнете замърсяване на пигментите. Използвайте Dermalize фолио за задържане на влагата и лимфата.',
      recommendedPriceMin: 320,
      recommendedPriceMax: 480
    };
  }

  if (isFineLine) {
    return {
      complexityLevel: 'Умерена (2/5)',
      estimatedHoursMin: 1.5,
      estimatedHoursMax: 2.5,
      recommendedSessions: 1,
      recommendedNeedles: ['01RL (Единична игла)', '03RL (Фин надпис)'],
      recommendedVoltage: '6.2V - 6.8V',
      painIndex: isSensitiveArea ? 'Остра болка на нервните окончания' : 'Ниска до умерена',
      technicalAdvice: 'Стабилна ръка и нисък волтаж, за да се избегне blowout (подпухване на мастилото под дермата).',
      recommendedPriceMin: 150,
      recommendedPriceMax: 230
    };
  }

  return {
    complexityLevel: 'Умерена (2/5)',
    estimatedHoursMin: 2.0,
    estimatedHoursMax: 3.5,
    recommendedSessions: 1,
    recommendedNeedles: ['05RL', '09RS', '11CM'],
    recommendedVoltage: '7.0V - 7.5V',
    painIndex: isSensitiveArea ? 'Висока' : 'Умерена',
    technicalAdvice: 'Стандартна студийна подготовка с прецизен трансфер и хипоалергенен дезинфектант.',
    recommendedPriceMin: 180,
    recommendedPriceMax: 280
  };
};
