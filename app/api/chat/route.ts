import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { getCurrentUserId, getCurrentUserTier } from "@/lib/auth/server";
import { tutorAgent } from "@/lib/ai/tutor-agent";

export async function POST(request: Request) {
  const [userId, userTier] = await Promise.all([
    getCurrentUserId(),
    getCurrentUserTier(),
  ]);

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (userTier !== "ultra") {
    return new Response("Ultra membership required", { status: 403 });
  }

  const { messages }: { messages: UIMessage[] } = await request.json();

  return createAgentUIStreamResponse({
    agent: tutorAgent,
    messages,
  });
}
