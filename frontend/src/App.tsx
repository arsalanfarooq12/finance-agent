import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import Chat from "./components/Chat";
import Dashboard from "./components/Dashboard";
import ConfirmDialog from "./components/ConfirmDialog";

export default function App() {
  const { session, loading, signOut, displayName, avatarUrl } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [signOutConfirm, setSignOutConfirm] = useState(false);

  const handleSignOut = () => {
    setSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    setSignOutConfirm(false);
    await signOut();
  };

  // Loading View
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#212121]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#0a21c0] animate-spin" />
      </div>
    );
  }

  // Auth Guard
  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#212121]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 shrink-0 bg-[#171717] border-b border-[#3d3d3d]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center bg-[#0a21c0] rounded-[10px]">
            <img src="./favicon.svg" alt="logo" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm leading-none">
              FinanceAI
            </h1>
            <p className="text-[#8e8ea0] text-xs mt-0.5">
              Personal Finance Agent
            </p>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || "User"}
                className="w-7 h-7 rounded-full object-cover border border-[#3d3d3d]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-[#2d2d2d] text-[#ececec] border border-[#3d3d3d]">
                {displayName?.trim()?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <span className="text-[#ececec] text-xs font-medium">
              {displayName}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs px-3 py-1.5 text-[#8e8ea0] border border-[#3d3d3d] rounded-gz hover:text-white hover:border-white transition-colors cursor-pointer rounded-[8px]"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat Panel: Fixed bottom border on mobile, right border on desktop */}
        <div className="max-h-[60vh] md:max-h-none md:h-auto md:w-[380px] lg:w-[420px] shrink-0 border-b md:border-b-0 md:border-r border-[#3d3d3d]">
          <Chat onAgentReply={() => setRefreshKey((k) => k + 1)} />
        </div>

        {/* Dashboard Canvas */}
        <div className="flex-1 overflow-hidden">
          <Dashboard refreshKey={refreshKey} />
        </div>
      </main>

      {/* Sign Out Confirmation Modal */}
      {signOutConfirm && (
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
