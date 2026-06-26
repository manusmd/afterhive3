import { isMinorAtDate } from "../member/is-minor";

export type ConsentStatus = "pending" | "complete";

export function canActivateEnrollment(input: {
  dateOfBirth: Date | null;
  consentStatus: ConsentStatus;
  activationDate: Date;
}) {
  if (!input.dateOfBirth) {
    return true;
  }

  if (!isMinorAtDate(input.dateOfBirth, input.activationDate)) {
    return true;
  }

  return input.consentStatus === "complete";
}
