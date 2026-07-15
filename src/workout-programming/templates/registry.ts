import { PROGRAM_TEMPLATE_DEFINITIONS } from "./catalog";
import type { ProgramTemplate } from "../types/programTemplate";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach((child) => deepFreeze(child));
  }
  return value;
}

function cloneTemplate(template: ProgramTemplate): ProgramTemplate {
  return JSON.parse(JSON.stringify(template)) as ProgramTemplate;
}

const activeTemplates = PROGRAM_TEMPLATE_DEFINITIONS
  .filter((template) => template.status === "active")
  .map(cloneTemplate)
  .sort((left, right) => left.id.localeCompare(right.id));

const duplicateIds = activeTemplates.filter((template, index) =>
  activeTemplates.findIndex((candidate) => candidate.id === template.id) !== index,
);

if (duplicateIds.length > 0) {
  throw new Error(`Duplicate FORGE template IDs: ${duplicateIds.map((item) => item.id).join(", ")}`);
}

export const PROGRAM_TEMPLATE_REGISTRY: readonly ProgramTemplate[] = deepFreeze(activeTemplates);

export function getProgramTemplateById(templateId: string): ProgramTemplate | undefined {
  return PROGRAM_TEMPLATE_REGISTRY.find((template) => template.id === templateId);
}
