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

export type PhysiqueImpactLevel = 'low' | 'medium' | 'high' | 'very_high';
export type PhysiqueDevelopmentLevel = 'weak' | 'average' | 'strong';
export type PhysiquePriorityLevel = 'low' | 'medium' | 'high';
export type PhysiqueProgramMuscle =
  | 'chest'
  | 'shoulders'
  | 'lats'
  | 'upper_back'
  | 'arms'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'core';

export type PhysiqueRegionAssessment = {
  region: string;
  developmentLevel: PhysiqueDevelopmentLevel;
  proportion: PhysiquePriorityLevel;
  symmetry: PhysiquePriorityLevel;
  aestheticImpact: PhysiqueImpactLevel;
  priority: PhysiquePriorityLevel;
  note: string;
};

export type PhysiqueMuscleBalance = {
  chest: PhysiqueRegionAssessment[];
  shoulders: PhysiqueRegionAssessment[];
  arms: PhysiqueRegionAssessment[];
  back: PhysiqueRegionAssessment[];
  legs: PhysiqueRegionAssessment[];
  abs: PhysiqueRegionAssessment[];
};

export type PhysiqueVTaperAnalysis = {
  shoulderWaistLook: PhysiqueDevelopmentLevel;
  latWidthLook: PhysiqueDevelopmentLevel;
  waistDominance: PhysiquePriorityLevel;
  impactLevel: PhysiqueImpactLevel;
  comment: string;
};

export type PhysiqueObservation = {
  title: string;
  description: string;
  confidence: PhysiquePriorityLevel;
};

export type PhysiquePriorityRoadmapItem = {
  rank: number;
  targetArea: string;
  targetMuscle: PhysiqueProgramMuscle;
  aestheticImpact: PhysiqueImpactLevel;
  reason: string;
  exerciseEmphasis: string[];
  volumeSignal: 'conservative' | 'moderate' | 'moderate_high';
};

export type PhysiqueProgramSignals = {
  focusMuscles: PhysiqueProgramMuscle[];
  volumeBias: 'conservative' | 'moderate' | 'moderate_high';
  splitBiasHint: 'balanced' | 'upper_focus' | 'lower_focus' | 'posterior_focus';
  exerciseEmphasis: string[];
  postureCautions: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
};

export type PhysiqueAnalysisResult = {
  generalDurum: string;
  eksikBolgeler: string[];
  odaklanmasiGerekenHareketler: PhysiqueExerciseRecommendation[];
  tahminiYagOrani: number;
  kasKutlesiYorumu: string;
  guvenPuani: number;
  pozKalitesiYorumu: string;
  analysisVersion?: 2;
  coachSummary?: string;
  vTaper?: PhysiqueVTaperAnalysis;
  muscleBalance?: PhysiqueMuscleBalance;
  symmetry?: PhysiqueObservation[];
  proportion?: PhysiqueObservation[];
  posture?: PhysiqueObservation[];
  fatDistribution?: PhysiqueObservation[];
  strengths?: string[];
  improvementAreas?: string[];
  priorityRoadmap?: PhysiquePriorityRoadmapItem[];
  programSignals?: PhysiqueProgramSignals;
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
