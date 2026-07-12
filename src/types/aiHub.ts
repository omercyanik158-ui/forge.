export type AIHubMode = 'food' | 'physique';

export type AIHubLanguage = 'tr' | 'en';

export type FoodAnalysisResult = {
  yemekAdi: string;
  porsiyon: string;
  kalori: number;
  protein: number;
  karbonhidrat: number;
  yag: number;
  guvenPuani: number;
  aciklama: string;
};

export type PhysiqueExerciseRecommendation = {
  hareketAdi: string;
  neden: string;
};

export type PhysiqueAnalysisResult = {
  generalDurum: string;
  eksikBolgeler: string[];
  odaklanmasiGerekenHareketler: PhysiqueExerciseRecommendation[];
  tahminiYagOrani: number;
  kasKutlesiYorumu: string;
  guvenPuani: number;
  pozKalitesiYorumu: string;
};

type AIHubLogBase = {
  id: string;
  createdAt: string;
  primaryImageUri?: string;
};

export type FoodAnalysisLog = AIHubLogBase & {
  type: 'food';
  result: FoodAnalysisResult;
};

export type PhysiqueAnalysisLog = AIHubLogBase & {
  type: 'physique';
  secondaryImageUri?: string;
  result: PhysiqueAnalysisResult;
};

export type AIHubLog = FoodAnalysisLog | PhysiqueAnalysisLog;

export type SaveFoodLogInput = {
  type: 'food';
  primaryImageUri: string;
  result: FoodAnalysisResult;
  retainMedia?: boolean;
};

export type SavePhysiqueLogInput = {
  type: 'physique';
  primaryImageUri: string;
  secondaryImageUri: string;
  result: PhysiqueAnalysisResult;
  retainMedia?: boolean;
};

export type SaveAIHubLogInput = SaveFoodLogInput | SavePhysiqueLogInput;

export type PreparedAIImage = {
  uri: string;
  base64: string;
  mimeType: 'image/jpeg';
  width: number;
  height: number;
};
