import { addDays } from "./invoice-amounts";

export const DUNNING_STAGE_OFFSETS_DAYS = {
  1: 7,
  2: 14,
  3: 21,
} as const;

export type DunningStage = keyof typeof DUNNING_STAGE_OFFSETS_DAYS;

export function getDunningTemplateForStage(stage: DunningStage) {
  switch (stage) {
    case 1:
      return "dunning_1" as const;
    case 2:
      return "dunning_2" as const;
    case 3:
      return "dunning_3" as const;
    default: {
      const exhaustive: never = stage;
      return exhaustive;
    }
  }
}

export function resolveInitialDunningNextActionAt(dueDate: string) {
  return addDays(dueDate, DUNNING_STAGE_OFFSETS_DAYS[1]);
}
