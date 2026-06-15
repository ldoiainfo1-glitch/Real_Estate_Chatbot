import { useEffect, useRef, useState } from "react";
import Background from "./components/Background";
import Header from "./components/Header";
import ChatInput from "./components/ChatInput";
import ChatMessage, { type Message } from "./components/ChatMessage";
import TypingIndicator from "./components/TypingIndicator";
import WelcomeScreen from "./components/WelcomeScreen";
import { normalizeStates, sendChatMessage } from "./lib/api";

const uid = () => Math.random().toString(36).slice(2);

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const hasMessages = messages.length > 0;

  // Auto-scroll to the newest message / typing indicator.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (loading) return;

    const userMsg: Message = { id: uid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await sendChatMessage(text, controller.signal);
      const botMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.response || "I couldn't generate a response for that.",
        states: normalizeStates(data.states_detected),
      };
      setMessages((prev) => [...prev, botMsg]);
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
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([]);
    setLoading(false);
  };

  return (
    <div className="relative flex h-[100dvh] flex-col">
      <Background />

      <Header onClear={handleClear} hasMessages={hasMessages} />

      {/* Messages / Welcome */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-5 px-4 py-6">
          {!hasMessages ? (
            <WelcomeScreen onPick={handleSend} />
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {loading && <TypingIndicator />}
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <div className="border-t border-white/5 bg-[#06080f]/60 px-4 py-3 backdrop-blur-xl sm:py-4">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
