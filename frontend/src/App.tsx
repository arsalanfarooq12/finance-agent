import { useState } from "react";
import Chat from "./components/Chat";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"chat" | "dashboard">("chat");

  return (
    <div
      style={{ backgroundColor: "var(--bg-base)" }}
      className="h-screen flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "var(--cafe-noir)",
          borderBottom: "1px solid var(--border)",
        }}
        className="flex items-center justify-between px-4 md:px-6 py-3 shrink-0"
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            style={{ backgroundColor: "var(--moss)", borderRadius: "10px" }}
            className="w-8 h-8 flex items-center justify-center shrink-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E5D7C4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h1
              style={{
                color: "var(--bone)",
                fontFamily: "Georgia, serif",
                letterSpacing: "0.02em",
              }}
              className="font-semibold text-sm leading-none"
            >
              FinanceAI
            </h1>
            <p
              style={{ color: "var(--text-muted)" }}
              className="text-xs mt-0.5 font-sans"
            >
              Personal Finance Assistant
            </p>
          </div>
        </div>

        {/* Status badge — desktop */}
        {/* <div
          style={{
            backgroundColor: "var(--kombu)",
            border: "1px solid var(--border)",
            borderRadius: "99px",
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
          <span style={{ color: "var(--tan)" }} className="text-xs font-sans">
            Gemini Active
          </span>
        </div> */}

        {/* Mobile tab toggle */}
        <div
          style={{ backgroundColor: "var(--kombu)", borderRadius: "10px" }}
          className="flex md:hidden p-0.5 gap-0.5"
        >
          {(["chat", "dashboard"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor:
                  activeTab === tab ? "var(--moss)" : "transparent",
                color: activeTab === tab ? "var(--bone)" : "var(--tan)",
                borderRadius: "8px",
              }}
              className="text-xs px-3 py-1.5 font-sans transition-all duration-200 cursor-pointer capitalize"
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        {/* Chat — narrow fixed width */}
        <div
          className={`
          ${activeTab === "chat" ? "flex" : "hidden"} md:flex
          flex-col w-full md:w-[360px] lg:w-[400px] shrink-0
        `}
          style={{ borderRight: "1px solid var(--border)" }}
        >
          <Chat onAgentReply={() => setRefreshKey((k) => k + 1)} />
        </div>

        {/* Dashboard — fills rest */}
        <div
          className={`
          ${activeTab === "dashboard" ? "flex" : "hidden"} md:flex
          flex-col flex-1 overflow-hidden
        `}
        >
          <Dashboard refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  );
}
