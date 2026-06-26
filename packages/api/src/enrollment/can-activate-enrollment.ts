import { isMinorAtDate } from "../member/is-minor";

export type ConsentStatus = "pending" | "complete";

export function canActivateEnrollment(input: {
  dateOfBirth: Date | null;
  consentStatus: ConsentStatus;
  enrollmentDate: Date;
}) {
  if (!input.dateOfBirth) {
    return true;
  }

  if (!isMinorAtDate(input.dateOfBirth, input.enrollmentDate)) {
    return true;
  }

  return input.consentStatus === "complete";
}
