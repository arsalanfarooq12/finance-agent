import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import Chat from "./components/Chat";
import Dashboard from "./components/Dashboard";
import { useState } from "react";

export default function App() {
  const { session, user, loading, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Show nothing while checking session
  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#212121" }}
      >
        <div
          style={{ borderColor: "#0a21c0", borderTopColor: "transparent" }}
          className="w-8 h-8 rounded-full border-2 animate-spin"
        />
      </div>
    );

  // Show auth page if not logged in
  if (!session) return <AuthPage />;

  return (
    <div
      style={{ backgroundColor: "#212121" }}
      className="h-screen flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "#171717",
          borderBottom: "1px solid #3d3d3d",
        }}
        className="flex items-center justify-between px-4 md:px-6 py-3 shrink-0"
      >
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: "#0a21c0", borderRadius: "10px" }}
            className="w-7 h-7 flex items-center justify-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm leading-none">
              FinanceAI
            </h1>
            <p style={{ color: "#8e8ea0" }} className="text-xs mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          style={{
            color: "#8e8ea0",
            border: "1px solid #3d3d3d",
            borderRadius: "8px",
          }}
          className="text-xs px-3 py-1.5 hover:text-white transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </header>

      {/* Main — stacked on mobile, side by side on desktop */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div
          className="h-[60vh] md:h-auto md:w-[380px] lg:w-[420px] shrink-0"
          style={{ borderBottom: "1px solid #3d3d3d" }}
          // md: switch to right border
        >
          <Chat onAgentReply={() => setRefreshKey((k) => k + 1)} />
        </div>
        <div className="flex-1 overflow-hidden">
          <Dashboard refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  );
}
