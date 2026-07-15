import {
  PROGRAM_TEMPLATES,
  fingerprintProgramRequest,
  type ProgramRequest,
} from '@/services/templateProgramEngine';

export function createProgramRequestFingerprint(request: ProgramRequest): string {
  const versionSeed = PROGRAM_TEMPLATES.map((template) => `${template.id}:${template.version}`).join('|');
  return fingerprintProgramRequest(request, versionSeed);
}
