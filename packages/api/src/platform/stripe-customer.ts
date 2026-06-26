import { randomBytes } from "node:crypto";
import { rootLogger } from "@afterhive/shared/logger";

type CreateStripeCustomerInput = {
  tenantId: string;
  tenantName: string;
  ownerEmail: string;
};

export async function createStripeCustomerStub(input: CreateStripeCustomerInput) {
  const stripeCustomerId = `cus_dev_${randomBytes(8).toString("hex")}`;

  rootLogger.info(
    {
      job: "stripe-customer-create",
      tenantId: input.tenantId,
      stripeCustomerId,
      ownerEmail: input.ownerEmail,
    },
    "Stripe customer created (stub)",
  );

  return stripeCustomerId;
}
