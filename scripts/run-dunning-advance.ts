import { advanceDunning } from "@afterhive/api/billing/advance-dunning";

async function main() {
  const asOfDate = process.argv[2];
  const result = await advanceDunning(asOfDate ? { asOfDate } : {});

  console.log(
    `Marked ${result.overdueMarked} invoice(s) overdue, created ${result.casesCreated} dunning case(s), queued ${result.emailsQueued} email(s), skipped ${result.skipped}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
