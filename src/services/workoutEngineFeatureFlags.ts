export type WorkoutEngineFeatureState = {
  enabled: boolean;
  source: 'environment' | 'development_override' | 'disabled_default';
  reason: string;
};

export type WorkoutLibraryVersionState = {
  version: 'stable' | '300';
  source: 'environment' | 'disabled_default';
  reason: string;
};

function readFlag(name: string): string | undefined {
  return process.env[name]?.trim().toLowerCase();
}

function resolveBooleanFlag(name: string, developmentOverrideName?: string): WorkoutEngineFeatureState {
  const value = readFlag(name);
  if (value === 'true') {
    return { enabled: true, source: 'environment', reason: `${name}=true` };
  }
  if (value === 'false') {
    return { enabled: false, source: 'environment', reason: `${name}=false` };
  }
  if (developmentOverrideName && process.env.NODE_ENV !== 'production') {
    const override = readFlag(developmentOverrideName);
    if (override === 'true') {
      return { enabled: true, source: 'development_override', reason: `${developmentOverrideName}=true` };
    }
  }
  return { enabled: false, source: 'disabled_default', reason: value ? `${name} has invalid value` : `${name} is not set` };
}

export function getTemplateProgramEngineFeatureState(): WorkoutEngineFeatureState {
  return resolveBooleanFlag('EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE', 'EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE_DEV_OVERRIDE');
}

export function getPhysiqueAdaptationFeatureState(): WorkoutEngineFeatureState {
  return resolveBooleanFlag('EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES', 'EXPO_PUBLIC_PHYSIQUE_ADAPTATION_DEV_OVERRIDE');
}

export function getProgressionWritesFeatureState(): WorkoutEngineFeatureState {
  return resolveBooleanFlag('EXPO_PUBLIC_PROGRESSION_WRITES', 'EXPO_PUBLIC_PROGRESSION_WRITES_DEV_OVERRIDE');
}

export function getWorkoutLibraryVersionState(): WorkoutLibraryVersionState {
  const value = readFlag('EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION');
  if (value === '300') {
    return { version: '300', source: 'environment', reason: 'EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION=300' };
  }
  return {
    version: 'stable',
    source: value ? 'environment' : 'disabled_default',
    reason: value ? `Unsupported workout library version: ${value}` : 'EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION is not set',
  };
}
