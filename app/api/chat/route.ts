import { auth } from "@clerk/nextjs/server";
import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { tutorAgent } from "@/lib/ai/tutor-agent";
import { resolveTierFromSessionClaims } from "@/lib/user-tier";

export async function POST(request: Request) {
  // Verify user is authenticated and has Ultra plan
  const { has, userId, sessionClaims } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const metadataTier = resolveTierFromSessionClaims(sessionClaims);
  const userTier =
    metadataTier ??
    (has?.({ plan: "ultra" })
      ? "ultra"
      : has?.({ plan: "pro" })
        ? "pro"
        : "free");

  if (userTier !== "ultra") {
    return new Response("Ultra membership required", { status: 403 });
  }

  const { messages }: { messages: UIMessage[] } = await request.json();

  return createAgentUIStreamResponse({
    agent: tutorAgent,
    messages,
  });
}
