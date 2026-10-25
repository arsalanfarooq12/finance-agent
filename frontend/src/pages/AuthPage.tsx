import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Moon, Sun } from "lucide-react";

type Tab = "login" | "register";

/* -------------------------------------------------------------------------- */
/*  Design tokens: identical to FinanceLandingPage                             */
/*  (If you'd rather not duplicate this, move `css` into a shared file.)       */
/* -------------------------------------------------------------------------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap');

.fa {
  --bg: #F8F8F6; --surface: #FFFFFF; --ink: #14181F; --muted: #5B6470;
  --line: #E4E4DF; --accent: #0E7C59; --accent-ink: #FFFFFF;
  --accent-soft: color-mix(in srgb, var(--accent) 10%, var(--surface));
  --danger: #B42318;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  background: var(--bg); color: var(--ink);
}
.fa[data-theme="dark"] {
  --bg: #0E1114; --surface: #151A1F; --ink: #ECEDEE; --muted: #9099A3;
  --line: #242B32; --accent: #3DDC97; --accent-ink: #06130D;
  --danger: #F87171;
}
.fa .dots {
  background-image: radial-gradient(color-mix(in srgb, var(--ink) 16%, transparent) 1px, transparent 1px);
  background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 75%);
}
.fa .halo {
  background: radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 16%, transparent), transparent 65%);
}
.fa .serif { font-family: 'Newsreader', Georgia, serif; font-weight: 400; letter-spacing: -0.02em; }
.fa a:focus-visible, .fa button:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 6px;
}
.fa input:focus-visible { outline: none; }
`;

const ink = "text-[color:var(--ink)]";
const muted = "text-[color:var(--muted)]";
const card =
  "rounded-xl border border-[color:var(--line)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(20,24,31,0.04),0_12px_32px_-16px_rgba(20,24,31,0.12)]";
const inputCls =
  "w-full rounded-lg border border-[color:var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)] transition-colors focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={`mb-1.5 block text-xs font-medium ${muted}`}>
        {label}
      </span>
      {children}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setDark((d) => !d);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError("");
    setMessage("");
    setFullName("");
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (tab === "register" && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    if (tab === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password, fullName.trim());
      if (error) setError(error);
      else setMessage("Check your email to confirm your account.");
    }
    setLoading(false);
  };

  const isLogin = tab === "login";

  return (
    <main
      className="fa relative flex min-h-screen flex-col overflow-hidden"
      data-theme={dark ? "dark" : "light"}
    >
      <style>{css}</style>

      {/* Background texture */}
      <div className="dots pointer-events-none absolute inset-0" />
      <div className="halo pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] max-w-full -translate-x-1/2" />

      {/* Top bar */}
      <header className="relative">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button
            onClick={() => navigate("/")}
            className={`serif text-xl ${ink}`}
            aria-label="Finance-AI home"
          >
            Finance-AI
          </button>
          <button
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className={muted}
          >
            {dark ? (
              <Sun size={17} strokeWidth={1.5} />
            ) : (
              <Moon size={17} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </header>

      {/* Card */}
      <div className="relative flex flex-1 items-center justify-center px-4 pb-20">
        <div className={`${card} w-full max-w-sm p-8`}>
          <h1 className={`serif text-3xl leading-tight ${ink}`}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className={`mt-2 text-sm leading-6 ${muted}`}>
            {isLogin
              ? "Sign in to see your spending and budgets."
              : "Start with a pasted expense or a PDF statement."}
          </p>

          {/* Tabs */}
          <div
            role="tablist"
            className="mt-7 flex rounded-lg border border-[color:var(--line)] bg-[var(--bg)] p-0.5"
          >
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => switchTab(t)}
                className={`flex-1 rounded-md py-2 text-sm transition-colors ${
                  tab === t
                    ? "bg-[var(--surface)] font-medium text-[color:var(--ink)] shadow-[0_1px_2px_rgba(20,24,31,0.08)]"
                    : muted
                }`}
              >
                {t === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          {/* Fields */}
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="space-y-4">
              {!isLogin && (
                <Field label="Full name">
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              )}
              <Field label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Error / success */}
            <div aria-live="polite">
              {error && (
                <p className="mt-4 text-xs text-[color:var(--danger)]">
                  {error}
                </p>
              )}
              {message && (
                <p className="mt-4 text-xs text-[color:var(--accent)]">
                  {message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-medium text-[color:var(--accent-ink)] shadow-[0_8px_24px_-8px_var(--accent)] ring-1 ring-inset ring-white/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--line)]" />
            <span className={`text-xs ${muted}`}>or</span>
            <div className="h-px flex-1 bg-[var(--line)]" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className={`flex w-full items-center justify-center gap-3 rounded-lg border border-[color:var(--line)] bg-[var(--surface)] py-3 text-sm font-medium transition-colors hover:border-[color:var(--muted)] ${ink}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
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
    </main>
  );
}
