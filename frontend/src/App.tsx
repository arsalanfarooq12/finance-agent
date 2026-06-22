import { useState } from "react";
import Chat from "./components/Chat";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

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
            className="w-8 h-8 flex  items-center justify-center shrink-0"
          >
            <img src="./favicon.svg" alt="logo" />
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

        {/* Mobile tab toggle */}
        {/* <div
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
        </div> */}
      </header>

      {/* Main */}

      <main className="flex-1 flex overflow-hidden">
        {/* Mobile: stacked, scrollable. Desktop: side-by-side */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* Chat */}
          <div
            className="flex flex-col w-full md:w-[360px] lg:w-[400px] shrink-0"
            style={{
              borderBottom: "1px solid var(--border)", // mobile separator
              borderRight: "none",
            }}
          >
            {/* Give chat a fixed height on mobile so it doesn't collapse */}
            <div className="h-[60vh] md:h-full flex flex-col">
              <Chat onAgentReply={() => setRefreshKey((k) => k + 1)} />
            </div>
          </div>

          {/* Dashboard */}
          <div
            className="flex flex-col flex-1 md:overflow-hidden"
            style={{ borderLeft: "1px solid var(--border)" }}
          >
            <Dashboard refreshKey={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}
