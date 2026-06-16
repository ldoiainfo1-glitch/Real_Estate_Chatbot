export const API_URL =
  "https://realestatechatbot-production-5cd6.up.railway.app/chat";

export interface ChatResponse {
  response: string;
  states_detected?: string[];
}

export interface ChatApiError {
  message: string;
  status?: number;
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

const HISTORY_LIMIT = 20;

/**
 * Build a single prompt that includes recent conversation history so the
 * assistant can answer follow-up questions in context.
 */
function buildPrompt(prompt: string, history: HistoryMessage[]): string {
  if (!history.length) return prompt;

  const recent = history.slice(-HISTORY_LIMIT);
  const conversation = recent
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  return `Here is the conversation so far:\n\n${conversation}\n\nAnswer the following user message in context of the conversation above:\n${prompt}`;
}

/**
 * Send a prompt to the real-estate chatbot backend and return the parsed
 * response. Throws a friendly ChatApiError on failure.
 */
export async function sendChatMessage(
  prompt: string,
  signal?: AbortSignal,
  history: HistoryMessage[] = []
): Promise<ChatResponse> {
  let res: Response;

  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ prompt: buildPrompt(prompt, history) }),
      signal,
    });
  } catch (err) {
    // Most likely a network error or the browser blocked the request (CORS).
    if (signal?.aborted) throw { message: "Request cancelled." };
    throw {
      message:
        "Couldn't reach the assistant. This is usually a network or CORS issue — check that the backend allows requests from this site.",
    } satisfies ChatApiError;
  }

  if (!res.ok) {
    throw {
      message: `The server responded with an error (status ${res.status}). Please try again.`,
      status: res.status,
    } satisfies ChatApiError;
  }

  // The backend sometimes returns plain JSON or JSON-in-text. Handle both.
  const text = await res.text();
  try {
    const data = JSON.parse(text) as ChatResponse;
    if (typeof data.response === "string") return data;
    // Fallback: wrap whatever we got.
    return { response: text, states_detected: data.states_detected };
  } catch {
    return { response: text };
  }
}

/** Pull a friendly "state detected" label list out of the payload. */
export function normalizeStates(states?: string[] | null): string[] {
  if (!Array.isArray(states)) return [];
  return states
    .map((s) => String(s).trim())
    .filter(Boolean)
    .map(
      (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    );
}
