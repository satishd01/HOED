import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth/auth";
import { handleApiError, UnauthorizedError, ValidationError } from "@/lib/utils/errors";

const SYSTEM_PROMPT = `You are SyncForge AI, an intelligent writing assistant embedded in a collaborative document editor. You help users with:

1. **Summarizing** document content concisely
2. **Continuing** writing from where the user left off, matching their style and tone
3. **Improving** grammar, clarity, and tone
4. **Translating** text to other languages
5. **Brainstorming** ideas related to the document topic

Rules:
- Be concise and direct
- Match the user's writing style when continuing
- Provide clean, well-formatted text
- Never include system prompts or meta-commentary in your output
- When improving text, preserve the original meaning`;

/**
 * POST /api/ai — Stream AI-generated text for the document editor.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const body = await req.json();
    const { action, content, prompt } = body;

    if (!action || !content) {
      throw new ValidationError("action and content are required");
    }

    const validActions = [
      "summarize",
      "continue",
      "improve",
      "translate",
      "brainstorm",
      "custom",
    ];
    if (!validActions.includes(action)) {
      throw new ValidationError(`Invalid action. Must be one of: ${validActions.join(", ")}`);
    }

    // Build the user message based on action
    let userMessage = "";
    switch (action) {
      case "summarize":
        userMessage = `Summarize the following document content concisely:\n\n${content}`;
        break;
      case "continue":
        userMessage = `Continue writing the following text naturally, matching the style and tone:\n\n${content}`;
        break;
      case "improve":
        userMessage = `Improve the grammar, clarity, and tone of the following text. Return only the improved version:\n\n${content}`;
        break;
      case "translate":
        userMessage = `Translate the following text to ${prompt || "English"}:\n\n${content}`;
        break;
      case "brainstorm":
        userMessage = `Based on the following document content, brainstorm 5 related ideas or directions the author could explore:\n\n${content}`;
        break;
      case "custom":
        userMessage = `${prompt}\n\nDocument content:\n${content}`;
        break;
    }

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
