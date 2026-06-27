import { generateRecurringInvoices } from "@afterhive/api/billing/generate-recurring-invoices";

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

  const result = await generateRecurringInvoices({ period });

  console.log(
    `Created ${result.created.length} invoice(s), skipped ${result.skipped} contract(s).`,
  );

  for (const invoice of result.created) {
    console.log(
      `- ${invoice.invoiceNumber}: net ${invoice.netTotalCents} / VAT ${invoice.vatTotalCents} / gross ${invoice.grossTotalCents}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
