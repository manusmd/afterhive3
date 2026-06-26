import { healthStatusCode, runHealthChecks } from "./index";

export async function GET(): Promise<Response> {
  const result = await runHealthChecks();
  return Response.json(result, { status: healthStatusCode(result) });
}
