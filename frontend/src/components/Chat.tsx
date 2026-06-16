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
      onAgentReply(); // Refresh dashboard
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
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      {/* <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-white font-semibold">💬 Finance Assistant</h2>
        <p className="text-gray-400 text-xs mt-0.5">Powered by Gemini</p>
      </div> */}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] ${
                msg.role === "user" ? "order-2" : "order-1"
              }`}
            >
              {/* Tools badge */}
              {msg.toolsCalled && msg.toolsCalled.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {msg.toolsCalled.map((tool) => (
                    <span
                      key={tool}
                      className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full"
                    >
                      {TOOL_LABELS[tool] ?? tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-gray-800 text-gray-100 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>

              <p className="text-gray-600 text-xs mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste expenses or ask a question..."
            rows={2}
            className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-2.5 resize-none outline-none border border-gray-700 focus:border-indigo-500 placeholder-gray-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 rounded-xl transition-colors font-medium text-sm"
          >
            Send
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-1.5 px-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
