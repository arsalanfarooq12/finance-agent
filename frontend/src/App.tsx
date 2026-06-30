import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import Chat from "./components/Chat";
import Dashboard from "./components/Dashboard";
import { useState } from "react";
import ConfirmDialog from "./components/ConfirmDialog";
export default function App() {
  const { session, loading, signOut, displayName, avatarUrl } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [SignOutConfirm, setSignOutConfirm] = useState(false);
  const handleSignOut = () => {
    setSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    setSignOutConfirm(false);
    await signOut();
  };
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
            <img src="./favicon.svg" alt="logo" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm leading-none">
              FinanceAI
            </h1>
            <p style={{ color: "#8e8ea0" }} className="text-xs mt-0.5">
              Personal Finance Agent
            </p>
          </div>
        </div>

        {/* Right side — avatar + name + sign out */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            {/* Avatar — Google profile pic or initial */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover"
                style={{ border: "1px solid #3d3d3d" }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{
                  backgroundColor: "#2d2d2d",
                  color: "#ececec",
                  border: "1px solid #3d3d3d",
                }}
              >
                {displayName!.charAt(0)!.toUpperCase() || "U"}
              </div>
            )}
            <span style={{ color: "#ececec" }} className="text-xs font-medium">
              {displayName}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              color: "#8e8ea0",
              border: "1px solid #3d3d3d",
              borderRadius: "8px",
            }}
            className="text-xs px-3 py-1.5 hover:text-white transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main — stacked on mobile, side by side on desktop */}
      <div className="overflow-scroll md:overflow-hidden">
        <main className=" flex flex-1 flex-col md:flex-row overflow-hidden">
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
      {SignOutConfirm && (
        <ConfirmDialog
          title="Sign out?"
          message="Are you sure you want to sign out?"
          confirmLabel="Sign out"
          onConfirm={confirmSignOut}
          onCancel={() => setSignOutConfirm(false)}
        />
      )}
    </div>
  );
}
