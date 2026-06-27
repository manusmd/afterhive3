import { generatePerSessionInvoices } from "@afterhive/api/billing/generate-per-session-invoices";

async function main() {
  const yearArg = process.argv[2];
  const monthArg = process.argv[3];

  const period =
    yearArg && monthArg
      ? { year: Number(yearArg), month: Number(monthArg) }
      : {
          year: new Date().getUTCFullYear(),
          month: new Date().getUTCMonth() + 1,
        };

  const result = await generatePerSessionInvoices({ period });

  console.log(
    `Created ${result.linesCreated.length} line(s), skipped ${result.skipped} attendance row(s).`,
  );

  for (const line of result.linesCreated) {
    console.log(
      `- session ${line.sessionId}: net ${line.netCents} / VAT ${line.vatCents} / gross ${line.grossCents}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
