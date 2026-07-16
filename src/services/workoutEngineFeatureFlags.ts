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

function normalizeFlag(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase();
}

function resolveBooleanFlag(
  value: string | undefined,
  name: string,
  developmentOverrideValue?: string,
  developmentOverrideName?: string,
): WorkoutEngineFeatureState {
  const normalizedValue = normalizeFlag(value);

  if (normalizedValue === 'true') {
    return {
      enabled: true,
      source: 'environment',
      reason: `${name}=true`,
    };
  }

  if (normalizedValue === 'false') {
    return {
      enabled: false,
      source: 'environment',
      reason: `${name}=false`,
    };
  }

  const normalizedOverride = normalizeFlag(developmentOverrideValue);

  if (
    developmentOverrideName &&
    process.env.NODE_ENV !== 'production' &&
    normalizedOverride === 'true'
  ) {
    return {
      enabled: true,
      source: 'development_override',
      reason: `${developmentOverrideName}=true`,
    };
  }

  return {
    enabled: false,
    source: 'disabled_default',
    reason: normalizedValue
      ? `${name} has invalid value`
      : `${name} is not set`,
  };
}

export function getTemplateProgramEngineFeatureState(): WorkoutEngineFeatureState {
  return resolveBooleanFlag(
    process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE,
    'EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE',
    process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE_DEV_OVERRIDE,
    'EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE_DEV_OVERRIDE',
  );
}

export function getPhysiqueAdaptationFeatureState(): WorkoutEngineFeatureState {
  return resolveBooleanFlag(
    process.env.EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES,
    'EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES',
    process.env.EXPO_PUBLIC_PHYSIQUE_ADAPTATION_DEV_OVERRIDE,
    'EXPO_PUBLIC_PHYSIQUE_ADAPTATION_DEV_OVERRIDE',
  );
}

export function getProgressionWritesFeatureState(): WorkoutEngineFeatureState {
  return resolveBooleanFlag(
    process.env.EXPO_PUBLIC_PROGRESSION_WRITES,
    'EXPO_PUBLIC_PROGRESSION_WRITES',
    process.env.EXPO_PUBLIC_PROGRESSION_WRITES_DEV_OVERRIDE,
    'EXPO_PUBLIC_PROGRESSION_WRITES_DEV_OVERRIDE',
  );
}

export function getWorkoutLibraryVersionState(): WorkoutLibraryVersionState {
  const value = normalizeFlag(
    process.env.EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION,
  );

  if (value === '300') {
    return {
      version: '300',
      source: 'environment',
      reason: 'EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION=300',
    };
  }

  return {
    version: 'stable',
    source: value ? 'environment' : 'disabled_default',
    reason: value
      ? `Unsupported workout library version: ${value}`
      : 'EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION is not set',
  };
}