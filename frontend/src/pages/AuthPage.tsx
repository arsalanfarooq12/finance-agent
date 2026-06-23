import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Tab = "login" | "register";

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    if (tab === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error);
      else setMessage("Check your email to confirm your account.");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#212121" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: "#2d2d2d", border: "1px solid #3d3d3d" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#0a21c0" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
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
              className="font-semibold text-sm leading-none"
              style={{ color: "#ececec" }}
            >
              FinanceAI
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#8e8ea0" }}>
              Personal Finance Agent
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-lg p-0.5 mb-6"
          style={{ backgroundColor: "#171717" }}
        >
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
                setMessage("");
              }}
              className="flex-1 py-2 text-sm rounded-md transition-all duration-200 cursor-pointer capitalize"
              style={{
                backgroundColor: tab === t ? "#2d2d2d" : "transparent",
                color: tab === t ? "#ececec" : "#8e8ea0",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-3 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{
              backgroundColor: "#171717",
              border: "1px solid #3d3d3d",
              color: "#ececec",
              borderRadius: "10px",
            }}
            className="w-full px-4 py-2.5 text-sm outline-none placeholder-gray-600 focus:border-blue-600 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{
              backgroundColor: "#171717",
              border: "1px solid #3d3d3d",
              color: "#ececec",
              borderRadius: "10px",
            }}
            className="w-full px-4 py-2.5 text-sm outline-none placeholder-gray-600 focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Error / success */}
        {error && (
          <p className="text-xs mb-3" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
        {message && (
          <p className="text-xs mb-3" style={{ color: "#34d399" }}>
            {message}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: "#0a21c0",
            color: "white",
            borderRadius: "10px",
            opacity: loading ? 0.6 : 1,
          }}
          className="w-full py-2.5 text-sm font-medium cursor-pointer disabled:cursor-not-allowed transition-opacity mb-4"
        >
          {loading
            ? "Please wait..."
            : tab === "login"
            ? "Sign in"
            : "Create account"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ backgroundColor: "#3d3d3d" }} />
          <span className="text-xs" style={{ color: "#8e8ea0" }}>
            or
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#3d3d3d" }} />
        </div>

        {/* Google OAuth */}
        <button
          onClick={signInWithGoogle}
          style={{
            backgroundColor: "#171717",
            border: "1px solid #3d3d3d",
            color: "#ececec",
            borderRadius: "10px",
          }}
          className="w-full py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-3 hover:border-gray-500 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
