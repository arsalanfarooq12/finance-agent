import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api";
import { type Message } from "../types";

const TOOL_LABELS: Record<string, string> = {
  parseAndSaveExpenses: "💾 Saving expenses",
  analyzeSpending: "📊 Analyzing spending",
  getFinancialAdvice: "💡 Getting advice",
  clearExpenses: "🗑️ Clearing data",
};

interface Props {
  onAgentReply: () => void;
}

export default function Chat({ onAgentReply }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your personal finance assistant. Paste your expenses in any format and I'll analyze them for you.\n\nExample:\n*Coffee 200, Rent 20000, Uber 1500, Groceries 5000*",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const { reply, toolsCalled } = await sendMessage(userMessage.content);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          toolsCalled,
          timestamp: new Date(),
        },
      ]);
      onAgentReply();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#212121" }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-[85%]">
              {/* Tool badges */}
              {msg.toolsCalled && msg.toolsCalled.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {msg.toolsCalled.map((tool) => (
                    <span
                      key={tool}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "#2d2d2d",
                        color: "#8e8ea0",
                        border: "1px solid #3d3d3d",
                      }}
                    >
                      {TOOL_LABELS[tool] ?? tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Bubble */}
              <div
                className="rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        backgroundColor: "#2f2f2f",
                        color: "#ececec",
                        borderTopRightRadius: "4px",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "#ececec",
                        borderTopLeftRadius: "4px",
                        padding: "0",
                      }
                }
              >
                {msg.content}
              </div>

              <p className="text-xs mt-1.5 px-1" style={{ color: "#4d4d4d" }}>
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 items-center px-1 py-3">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "#8e8ea0",
                    animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid #2d2d2d" }}>
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3"
          style={{
            backgroundColor: "#2d2d2d",
            border: "1px solid #3d3d3d",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message FinanceAI..."
            rows={1}
            className="flex-1 text-sm resize-none outline-none bg-transparent leading-relaxed placeholder:text-[#4d4d4d]"
            style={{ color: "#ececec", maxHeight: "120px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${t.scrollHeight}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: input.trim() ? "#0a21c0" : "#3d3d3d" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "#4d4d4d" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
