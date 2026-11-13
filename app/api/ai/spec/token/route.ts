import { issueRunToken } from "@/lib/run-token";

/**
 * Issues a Trigger.dev public token scoped to one spec run, once the stored
 * `TaskRun` proves the signed-in caller started it.
 */
export async function POST(request: Request) {
  return issueRunToken(request, "spec");
}
