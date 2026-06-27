import { describe, expect, it } from "vitest";
import {
  getDunningTemplateForStage,
  resolveInitialDunningNextActionAt,
} from "./dunning-schedule";

describe("dunning-schedule", () => {
  it("maps stage 1 to the dunning_1 template", () => {
    expect(getDunningTemplateForStage(1)).toBe("dunning_1");
  });

  it("schedules the first follow-up seven days after due date", () => {
    expect(resolveInitialDunningNextActionAt("2026-06-01")).toBe("2026-06-08");
  });
});
