import { useEffect, useRef, useState } from "react";
import Background from "./components/Background";
import Header from "./components/Header";
import ChatInput from "./components/ChatInput";
import ChatMessage, { type Message } from "./components/ChatMessage";
import TypingIndicator from "./components/TypingIndicator";
import IntakeFlow, { type IntakeAnswers } from "./components/IntakeFlow";
import { normalizeStates, sendChatMessage } from "./lib/api";
import { streamText } from "./lib/stream";

const uid = () => Math.random().toString(36).slice(2);
const SESSION_KEY = "estatesage_session";

function buildIntakePrompt(answers: IntakeAnswers): string {
  return `I am a ${answers.userType.toLowerCase()} in ${answers.location}, dealing with a ${answers.propertyType.toLowerCase()}. I need help with ${answers.topic}. Please explain the relevant laws, procedures, documents, and risks I should be aware of in simple terms.`;
}

function serializeMessages(messages: Message[]): string {
  return JSON.stringify(
    messages.map(({ id, role, content, states, error }) => ({
      id,
      role,
      content,
      states,
      error,
      // Never persist an active streaming state across reloads.
      streaming: false,
    }))
  );
}

function loadSessionMessages(): Message[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Message[];
  } catch {
    return [];
  }
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>(loadSessionMessages);
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stopStreamRef = useRef<(() => void) | null>(null);

  const hasMessages = messages.length > 0;

  // Persist conversation to sessionStorage on every change.
  useEffect(() => {
    if (messages.length) {
      sessionStorage.setItem(SESSION_KEY, serializeMessages(messages));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [messages]);

  // Auto-scroll to the newest message / typing indicator.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, streamingId]);

  const finishStreaming = (id: string, finalStates?: string[]) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, streaming: false, states: finalStates } : m
      )
    );
    setStreamingId(null);
    setLoading(false);
    stopStreamRef.current = null;
  };

  const handleSend = async (text: string) => {
    if (loading) return;

    // Capture history *before* adding the new user message.
    const history = messages
      .filter((m) => !m.error && !m.streaming)
      .map((m) => ({ role: m.role, content: m.content }));

    const userMsg: Message = { id: uid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await sendChatMessage(text, controller.signal, history);
      const fullText = data.response || "I couldn't generate a response for that.";
      const states = normalizeStates(data.states_detected);

      const botId = uid();
      const botMsg: Message = {
        id: botId,
        role: "assistant",
        content: "",
        states,
        streaming: true,
      };

      setMessages((prev) => [...prev, botMsg]);
      setStreamingId(botId);

      stopStreamRef.current = streamText({
        text: fullText,
        delayMs: 22,
        onUpdate: (chunk) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, content: chunk } : m))
          );
        },
        onDone: () => finishStreaming(botId, states),
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        "Something went wrong. Please try again.";
      const botMsg: Message = {
        id: uid(),
        role: "assistant",
        content: message,
        error: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    } finally {
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    stopStreamRef.current?.();
    // Fallback cleanup in case streamText was already done.
    if (streamingId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === streamingId ? { ...m, streaming: false } : m))
      );
      setStreamingId(null);
      setLoading(false);
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    stopStreamRef.current?.();
    setMessages([]);
    setLoading(false);
    setStreamingId(null);
  };

  const handleIntakeComplete = (answers: IntakeAnswers) => {
    handleSend(buildIntakePrompt(answers));
  };

  return (
    <div className="relative flex h-[100dvh] flex-col">
      <Background />

      <Header onClear={handleClear} hasMessages={hasMessages} />

      {/* Messages / Intake */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-5 px-4 py-6">
          {!hasMessages ? (
            <IntakeFlow onComplete={handleIntakeComplete} />
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  onStop={m.streaming ? handleStop : undefined}
                />
              ))}
              {/* Show typing dots only while waiting for the API, not while streaming. */}
              {loading && !streamingId && <TypingIndicator />}
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <div className="border-t border-white/5 bg-[#06080f]/60 px-4 py-3 backdrop-blur-xl sm:py-4">
        <ChatInput
          onSend={handleSend}
          disabled={loading}
          streaming={!!streamingId}
          onStop={handleStop}
        />
      </div>
    </div>
  );
}
