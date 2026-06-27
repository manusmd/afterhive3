import { describe, expect, it } from "vitest";
import {
  getInvoiceRemainingCents,
  resolveInvoiceStatusAfterPayment,
} from "./invoice-payment-status";

describe("resolveInvoiceStatusAfterPayment", () => {
  it("marks invoice paid when fully covered", () => {
    expect(resolveInvoiceStatusAfterPayment(5355, 5355)).toBe("paid");
  });

  it("marks invoice partially paid when underpaid", () => {
    expect(resolveInvoiceStatusAfterPayment(2000, 5355)).toBe("partially_paid");
  });
});

describe("getInvoiceRemainingCents", () => {
  it("returns remaining balance", () => {
    expect(getInvoiceRemainingCents(5355, 2000)).toBe(3355);
    expect(getInvoiceRemainingCents(5355, 5355)).toBe(0);
  });
});
