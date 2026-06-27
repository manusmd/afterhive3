import { rootLogger } from "@afterhive/shared/logger";
import type { DunningStage } from "../billing/dunning-schedule";
import { getDunningTemplateForStage } from "../billing/dunning-schedule";

type QueueDunningEmailInput = {
  tenantId: string;
  invoiceId: string;
  dunningCaseId: string;
  stage: DunningStage;
  recipientEmail: string;
};

export async function queueDunningEmail(input: QueueDunningEmailInput) {
  const template = getDunningTemplateForStage(input.stage);

  rootLogger.info(
    {
      job: "JOB-email-dunning",
      template,
      tenantId: input.tenantId,
      invoiceId: input.invoiceId,
      dunningCaseId: input.dunningCaseId,
      stage: input.stage,
      to: input.recipientEmail,
    },
    "Dunning email queued",
  );

  return { template };
}
