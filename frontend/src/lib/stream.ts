/**
 * Split a response into small chunks suitable for word-by-word reveal.
 * Preserves spaces so the text expands naturally, and keeps markdown-ish
 * tokens such as `**word**`, `[link](url)` or `- item` intact.
 */
export function tokenizeForStream(text: string): string[] {
  if (!text) return [];

  // Split by whitespace but keep the whitespace as its own token so words
  // are separated correctly as they appear.
  return text.split(/(\s+)/).filter(Boolean);
}

export interface StreamOptions {
  /** Full text that will eventually be revealed. */
  text: string;
  /** Called with the cumulative text after each chunk. */
  onUpdate: (chunk: string) => void;
  /** Called once the full text has been revealed. */
  onDone: () => void;
  /** Base delay (ms) between chunks. */
  delayMs?: number;
}

/**
 * Streams the given text word-by-word. Returns an abort function that
 * immediately reveals whatever is left and calls onDone.
 */
export function streamText({
  text,
  onUpdate,
  onDone,
  delayMs = 18,
}: StreamOptions): () => void {
  const tokens = tokenizeForStream(text);
  let index = 0;
  let buffer = "";
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const next = () => {
    if (cancelled) {
      onUpdate(text);
      onDone();
      return;
    }

    if (index >= tokens.length) {
      onUpdate(text);
      onDone();
      return;
    }

    // Reveal 1-3 tokens per tick for a more natural rhythm.
    const chunkSize = Math.random() > 0.7 ? 2 : 1;
    const slice = tokens.slice(index, index + chunkSize);
    buffer += slice.join("");
    index += slice.length;

    onUpdate(buffer);

    // Speed up a little for long responses so they don't take forever.
    const progress = index / tokens.length;
    const adaptiveDelay = Math.max(4, delayMs * (1 - progress * 0.55));

    timeoutId = setTimeout(next, adaptiveDelay);
  };

  next();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    onUpdate(text);
    onDone();
  };
}
