import { rootLogger } from "@afterhive/shared/logger";

type SendStaffInviteEmailInput = {
  tenantSlug: string;
  email: string;
  token: string;
};

export async function sendStaffInviteEmail(input: SendStaffInviteEmailInput) {
  const adminBase =
    process.env.ADMIN_APP_URL ??
    `${process.env.APP_URL ?? "http://localhost:3002"}/app`;
  const inviteUrl = `${adminBase}/${input.tenantSlug}/invite/${input.token}`;

  rootLogger.info(
    {
      job: "JOB-email-send",
      template: "staff-invite",
      to: input.email,
      inviteUrl,
    },
    "Staff invite email queued",
  );

  return { inviteUrl };
}
