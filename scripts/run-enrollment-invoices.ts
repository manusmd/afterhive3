import { generateEnrollmentInvoices } from "@afterhive/api/billing/generate-enrollment-invoices";

async function main() {
  const result = await generateEnrollmentInvoices();

  console.log(
    `Created ${result.created.length} enrollment invoice(s), skipped ${result.skipped} contract(s).`,
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
