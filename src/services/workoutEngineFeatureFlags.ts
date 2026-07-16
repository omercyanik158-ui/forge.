import { clientConfig, shouldAllowFeatureDevOverride } from '@/config/clientConfig';

export type WorkoutEngineFeatureState = {
  enabled: boolean;
  source: 'environment' | 'development_override' | 'disabled_default';
  reason: string;
};

export type WorkoutLibraryVersionState = {
  version: 'stable';
  source: 'environment' | 'disabled_default';
  reason: string;
};

const TEMPLATE_ENGINE_ENABLED_MARKER = 'forge-template-engine:on';
const TEMPLATE_ENGINE_DISABLED_MARKER = 'forge-template-engine:off';
const APP_ENV_MARKER = clientConfig.appEnvMarker;

function resolveBooleanFlag(
  name: string,
  rawValue: string | null,
  devOverrideName: string | null,
  devOverrideEnabled: boolean,
): WorkoutEngineFeatureState {
  const normalized = rawValue?.toLowerCase() ?? null;
  if (normalized === 'true') {
    return {
      enabled: true,
      source: 'environment',
      reason: name === 'EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE'
        ? `${name}=true:${TEMPLATE_ENGINE_ENABLED_MARKER}:${APP_ENV_MARKER}`
        : `${name}=true:${APP_ENV_MARKER}`,
    };
  }
  if (normalized === 'false') {
    return {
      enabled: false,
      source: 'environment',
      reason: name === 'EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE'
        ? `${name}=false:${TEMPLATE_ENGINE_DISABLED_MARKER}:${APP_ENV_MARKER}`
        : `${name}=false:${APP_ENV_MARKER}`,
    };
  }
  if (shouldAllowFeatureDevOverride() && devOverrideName && devOverrideEnabled) {
    return {
      enabled: true,
      source: 'development_override',
      reason: name === 'EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE'
        ? `${devOverrideName}=true:${TEMPLATE_ENGINE_ENABLED_MARKER}:${APP_ENV_MARKER}`
        : `${devOverrideName}=true:${APP_ENV_MARKER}`,
    };
  }
  return {
    enabled: false,
    source: 'disabled_default',
    reason: name === 'EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE'
      ? (normalized
        ? `${name} has invalid value:${TEMPLATE_ENGINE_DISABLED_MARKER}:${APP_ENV_MARKER}`
        : `${name} is not set:${TEMPLATE_ENGINE_DISABLED_MARKER}:${APP_ENV_MARKER}`)
      : (normalized ? `${name} has invalid value:${APP_ENV_MARKER}` : `${name} is not set:${APP_ENV_MARKER}`),
  };
}

export function getTemplateProgramEngineFeatureState(): WorkoutEngineFeatureState {
  return resolveBooleanFlag(
    'EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE',
    clientConfig.features.templateProgramEngine.raw,
    'EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE_DEV_OVERRIDE',
    clientConfig.features.templateProgramEngine.devOverrideEnabled,
  );
}

export function getPhysiqueAdaptationFeatureState(): WorkoutEngineFeatureState {
  return resolveBooleanFlag(
    'EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES',
    clientConfig.features.physiqueAdaptationWrites.raw,
    'EXPO_PUBLIC_PHYSIQUE_ADAPTATION_DEV_OVERRIDE',
    clientConfig.features.physiqueAdaptationWrites.devOverrideEnabled,
  );
}

export function getProgressionWritesFeatureState(): WorkoutEngineFeatureState {
  return resolveBooleanFlag(
    'EXPO_PUBLIC_PROGRESSION_WRITES',
    clientConfig.features.progressionWrites.raw,
    'EXPO_PUBLIC_PROGRESSION_WRITES_DEV_OVERRIDE',
    clientConfig.features.progressionWrites.devOverrideEnabled,
  );
}

export function getWorkoutLibraryVersionState(): WorkoutLibraryVersionState {
  return {
    version: 'stable',
    source: 'disabled_default',
    reason: 'Stable 26 catalog is fixed for V1 production runtime.',
  };
}
