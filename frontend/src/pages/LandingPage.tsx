import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowRight,
  FileText,
  Lock,
  MessageSquare,
  Moon,
  PieChart,
  Sun,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                              */
/*  Paper + deep slate ink, one muted green accent. No gradients.              */
/*  Serif for headlines (Newsreader), clean sans for everything else (Inter).  */
/* -------------------------------------------------------------------------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap');

.fa { 
  --bg: #F8F8F6; --surface: #FFFFFF; --ink: #14181F; --muted: #5B6470;
  --line: #E4E4DF; --accent: #0E7C59; --accent-ink: #FFFFFF;
  --accent-soft: color-mix(in srgb, var(--accent) 10%, var(--surface));
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  background: var(--bg); color: var(--ink);
}
.fa[data-theme="dark"] {
  --bg: #0E1114; --surface: #151A1F; --ink: #ECEDEE; --muted: #9099A3;
  --line: #242B32; --accent: #3DDC97; --accent-ink: #06130D;
}
.fa .dots {
  background-image: radial-gradient(color-mix(in srgb, var(--ink) 16%, transparent) 1px, transparent 1px);
  background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
}
.fa .halo {
  background: radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 16%, transparent), transparent 65%);
}
.fa .serif { font-family: 'Newsreader', Georgia, serif; font-weight: 400; letter-spacing: -0.02em; }
.fa a:focus-visible, .fa button:focus-visible, .fa input:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 6px;
}
`;

const ink = "text-[color:var(--ink)]";
const muted = "text-[color:var(--muted)]";
const accent = "text-[color:var(--accent)]";
const card =
  "rounded-xl border border-[color:var(--line)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(20,24,31,0.04),0_12px_32px_-16px_rgba(20,24,31,0.12)]";

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                               */
/* -------------------------------------------------------------------------- */

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[color:var(--accent-ink)] shadow-[0_8px_24px_-8px_var(--accent)] ring-1 ring-inset ring-white/20 transition hover:brightness-110"
    >
      {children}
    </button>
  );
}

function Tile({
  className = "",
  icon: Icon,
  title,
  children,
  body,
}: {
  className?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${card} flex flex-col p-7 sm:p-8 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[color:var(--accent)]">
        <Icon size={18} strokeWidth={1.5} />
      </span>
      <h3 className={`mt-5 text-base font-medium ${ink}`}>{title}</h3>
      <p className={`mt-2 max-w-md text-sm leading-6 ${muted}`}>{body}</p>
      {children && <div className="mt-6 flex-1">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Product preview tiles (illustrative sample data)                           */
/* -------------------------------------------------------------------------- */

const parsed = [
  { item: "Coffee", category: "Food", amount: "₹200" },
  { item: "Rent", category: "Housing", amount: "₹20,000" },
  { item: "Uber", category: "Transport", amount: "₹1,500" },
  { item: "Groceries", category: "Food", amount: "₹5,000" },
];

function ParsedExpenses() {
  return (
    <div className="rounded-lg border border-[color:var(--line)] bg-[var(--bg)]">
      <div
        className={`border-b border-[color:var(--line)] px-4 py-3 text-sm ${muted}`}
      >
        Coffee 200, Rent 20000, Uber 1500, Groceries 5000
      </div>
      <ul>
        {parsed.map((row, i) => (
          <li
            key={row.item}
            className={`flex items-center justify-between px-4 py-2.5 text-sm ${
              i !== parsed.length - 1
                ? "border-b border-[color:var(--line)]"
                : ""
            }`}
          >
            <span className={ink}>{row.item}</span>
            <span className={muted}>{row.category}</span>
            <span className={`w-20 text-right tabular-nums ${ink}`}>
              {row.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BudgetBars() {
  const rows = [
    { name: "Housing", spent: "₹23,000", limit: "₹50,000", pct: 46 },
    { name: "Food", spent: "₹6,200", limit: "₹20,000", pct: 31 },
  ];
  return (
    <div className="space-y-5">
      {rows.map((r) => (
        <div key={r.name}>
          <div className="mb-2 flex justify-between text-sm">
            <span className={ink}>{r.name}</span>
            <span className={`tabular-nums ${muted}`}>
              {r.spent} of {r.limit}
            </span>
          </div>
          <div className="h-1 rounded-full bg-[var(--line)]">
            <div
              className="h-1 rounded-full bg-[var(--accent)]"
              style={{ width: `${r.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AdvisorExchange() {
  return (
    <div className="space-y-3 text-sm leading-6">
      <p className={`${ink} font-medium`}>
        Why did my spending go up this month?
      </p>
      <p className={muted}>
        Spending is up 12.4% on last month. Most of the change comes from dining
        out, online shopping, and transport. Reducing discretionary spending by
        about ₹180 a day keeps you within your monthly budget.
      </p>
      <p className={`text-xs ${muted}`}>Example response</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard preview (illustrative sample data)                               */
/* -------------------------------------------------------------------------- */

const categories = [
  { name: "Housing", pct: 63, tone: "100%" },
  { name: "Food", pct: 17, tone: "60%" },
  { name: "Other", pct: 12, tone: "35%" },
  { name: "Transport", pct: 8, tone: "18%" },
];

// Tonal steps of the single accent, mixed toward the surface color.
const shade = (tone: string) =>
  `color-mix(in srgb, var(--accent) ${tone}, var(--surface))`;

function buildDonut() {
  let acc = 0;
  const stops = categories.map((c) => {
    const start = acc;
    acc += c.pct;
    return `${shade(c.tone)} ${start}% ${acc}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function DashboardPreview() {
  const panel =
    "rounded-lg border border-[color:var(--line)] bg-[var(--surface)] p-5";

  const stats = [
    {
      label: "Total spend",
      value: "₹36,700",
      // spark: "0,22 14,18 28,20 42,12 56,14 70,6 84,8",
    },
    {
      label: "Transactions",
      value: "10",
      // spark: "0,20 14,22 28,14 42,16 56,10 70,12 84,4",
    },
    { label: "Categories", value: "4" },
    { label: "Top category", value: "Housing", sub: "₹23,000" },
  ];

  const months = [
    { label: "Jun 2026", value: "₹21.7k", height: 82 },
    { label: "Jul 2026", value: "₹15.0k", height: 57 },
  ];

  return (
    <div className="relative">
      <div className="halo pointer-events-none absolute -inset-x-10 -inset-y-16 -z-10" />
      <div
        className={`${card} overflow-hidden`}
        role="img"
        aria-label="Preview of the Finance-AI dashboard with sample data"
      >
        {/* App bar */}
        <div className="flex h-14 items-center justify-between border-b border-[color:var(--line)] px-5">
          <span className={`serif text-lg ${ink}`}>Finance-AI</span>
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--line)] text-xs font-medium text-[color:var(--accent)]">
              A
            </span>
            <span className={`hidden text-sm sm:block ${ink}`}>Arsalan</span>
          </div>
        </div>

        <div className="grid md:grid-cols-[280px_1fr]">
          {/* Chat panel */}
          <aside className="relative hidden min-h-[640px] border-r border-[color:var(--line)] bg-[var(--bg)] md:block">
            <div className={`p-6 text-[13px] leading-6 ${muted}`}>
              <p>
                Hi, I'm your finance assistant. Paste your expenses and I'll
                sort them for you.
              </p>
              <p className={`mt-5 font-medium ${ink}`}>Example</p>
              <p className="mt-1 italic">
                Coffee 200, Rent 20000, Uber 1500, Groceries 5000
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-center gap-2 rounded-lg border border-[color:var(--line)] bg-[var(--surface)] p-2">
                <span className={`flex-1 px-2 py-2 text-sm ${muted}`}>
                  Message Finance-AI
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-[color:var(--accent-ink)]">
                  <ArrowRight size={15} strokeWidth={1.5} />
                </span>
              </div>
            </div>
          </aside>

          {/* Dashboard */}
          <div className="min-w-0 bg-[var(--bg)] p-5 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`serif text-2xl ${ink}`}>Dashboard</h3>
                <p className={`mt-1 text-sm ${muted}`}>Total: ₹36,700</p>
              </div>
              <span
                className={`rounded-md border border-[color:var(--line)] px-3 py-1.5 text-xs ${muted}`}
              >
                Clear all
              </span>
            </div>

            {/* Stats */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className={panel}>
                  <p className={`text-xs ${muted}`}>{s.label}</p>
                  <p className={`mt-2 text-xl font-medium tabular-nums ${ink}`}>
                    {s.value}
                  </p>
                  {s.sub && (
                    <p className={`mt-0.5 text-xs tabular-nums ${muted}`}>
                      {s.sub}
                    </p>
                  )}
                  {/* {s.spark && (
                    <svg
                      viewBox="0 0 84 26"
                      className="mt-3 h-6 w-full"
                      aria-hidden="true"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points={s.spark}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  )} */}
                </div>
              ))}
            </div>

            {/* Budgets */}
            <div className={`mt-3 ${panel}`}>
              <div className="mb-5 flex items-center justify-between">
                <h4 className={`text-sm font-medium ${ink}`}>Budgets</h4>
                <span className={`text-xs ${accent}`}>Add budget</span>
              </div>
              <BudgetBars />
            </div>

            {/* Category + monthly */}
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className={panel}>
                <h4 className={`text-sm font-medium ${ink}`}>
                  Spending by category
                </h4>
                <div className="mt-6 flex flex-wrap items-center gap-8">
                  <div
                    className="relative h-36 w-36 shrink-0 rounded-full"
                    style={{ background: buildDonut() }}
                  >
                    <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-[var(--surface)]">
                      <span
                        className={`text-base font-medium tabular-nums ${ink}`}
                      >
                        ₹36.7k
                      </span>
                      <span className={`text-[11px] ${muted}`}>Total</span>
                    </div>
                  </div>

                  <ul className="min-w-[8rem] flex-1 space-y-3">
                    {categories.map((c) => (
                      <li
                        key={c.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className={`flex items-center gap-2.5 ${muted}`}>
                          <span
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ background: shade(c.tone) }}
                          />
                          {c.name}
                        </span>
                        <span className={`tabular-nums ${ink}`}>{c.pct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={panel}>
                <h4 className={`text-sm font-medium ${ink}`}>
                  Monthly spending
                </h4>
                <div className="mt-6 flex h-44 items-end justify-center gap-10 border-b border-[color:var(--line)] px-4">
                  {months.map((m) => (
                    <div
                      key={m.label}
                      className="flex h-full w-20 flex-col items-center justify-end sm:w-24"
                    >
                      <span className={`mb-2 text-xs tabular-nums ${muted}`}>
                        {m.value}
                      </span>
                      <div
                        className="w-full rounded-t-md bg-[var(--accent)]"
                        style={{ height: `${m.height}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-10 px-4 pt-2">
                  {months.map((m) => (
                    <span
                      key={m.label}
                      className={`w-20 text-center text-xs sm:w-24 ${muted}`}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating insight chips */}
      <div
        className={`${card} absolute -right-4 top-24 hidden items-center gap-3 px-4 py-3 lg:flex`}
      >
        {/* <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[color:var(--accent)]">
          <Check size={15} strokeWidth={2} />
        </span>
        <div>
          <p className={`text-sm font-medium ${ink}`}>
            Food is at 31% of budget
          </p>
          <p className={`text-xs ${muted}`}>On track for the month</p>
        </div> */}
      </div>
      <div
        className={`${card} absolute -left-4 bottom-24 hidden items-center gap-3 px-4 py-3 lg:flex`}
      >
        {/* <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[color:var(--accent)]">
          <MessageSquare size={15} strokeWidth={1.5} />
        </span> */}
        {/* <div>
          <p className={`text-sm font-medium ${ink}`}>4 expenses categorized</p>
          <p className={`text-xs ${muted}`}>From one pasted line</p>
        </div> */}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

const steps = [
  {
    title: "Add your expenses",
    body: "Paste them as you'd write them, or upload a PDF statement or CSV.",
  },
  {
    title: "Set your limits",
    body: "Give each category a monthly budget and a savings target.",
  },
  {
    title: "Ask questions",
    body: "Ask where the money went and get an answer based on your own data.",
  },
];

const formats = ["PDF statements", "CSV exports", "Pasted text"];

const securityNotes = [
  "Access is limited to your authenticated account.",
  "Your data is never sold or shared for advertising.",
];

export default function FinanceLandingPage() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/app", { replace: true });
  }, [session, navigate]);

  if (session) return null;

  const openApp = () => navigate("/app");

  return (
    <main className="fa min-h-screen" data-theme={dark ? "dark" : "light"}>
      <style>{css}</style>

      {/* Header */}
      <header className="border-b border-[color:var(--line)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button
            onClick={() => navigate("/")}
            className={`serif text-xl ${ink}`}
            aria-label="Finance-AI home"
          >
            Finance-AI
          </button>

          <nav className={`hidden items-center gap-8 text-sm md:flex ${muted}`}>
            <a href="#features" className="hover:text-[color:var(--ink)]">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[color:var(--ink)]">
              How it works
            </a>
            <a href="#security" className="hover:text-[color:var(--ink)]">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setDark((d) => !d)}
              aria-label={
                dark ? "Switch to light theme" : "Switch to dark theme"
              }
              className={muted}
            >
              {dark ? (
                <Sun size={17} strokeWidth={1.5} />
              ) : (
                <Moon size={17} strokeWidth={1.5} />
              )}
            </button>
            <button onClick={openApp} className={`text-sm ${ink}`}>
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="dots pointer-events-none absolute inset-0" />
        <div className="halo pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] max-w-full -translate-x-1/2" />
        <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-24 sm:pt-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[var(--surface)] px-3.5 py-1.5 text-xs text-[color:var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Expenses, statements and budgets in one place
          </span>
          <h1
            className={`serif mt-8 max-w-3xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl ${ink}`}
          >
            Know where your money goes.
          </h1>
          <p className={`mt-8 max-w-xl text-lg leading-8 ${muted}`}>
            Finance-AI reads your expenses and bank statements, sorts them into
            categories, and answers questions about your spending in plain
            language.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <PrimaryButton onClick={openApp}>
              Get started
              <ArrowRight size={16} strokeWidth={1.5} />
            </PrimaryButton>
            <a
              href="#how-it-works"
              className={`text-sm underline decoration-[color:var(--line)] underline-offset-4 hover:decoration-[color:var(--ink)] ${ink}`}
            >
              See how it works
            </a>
          </div>

          <div className="mt-20 sm:mt-24">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Supported inputs: quiet, muted wall */}
      <section className="border-y border-[color:var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm ${muted}`}>
            Works with the files you already have
          </p>
          <ul
            className={`flex flex-wrap gap-x-10 gap-y-2 text-sm font-medium ${muted}`}
          >
            {formats.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features: bento grid */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
        <h2
          className={`serif max-w-2xl text-4xl leading-tight sm:text-5xl ${ink}`}
        >
          One place for your spending, budgets, and questions.
        </h2>

        <div className="mt-16 grid gap-4 lg:grid-cols-6">
          <Tile
            className="lg:col-span-4"
            icon={MessageSquare}
            title="Write expenses the way you'd say them"
            body="Paste a line of expenses and each one is read, categorized, and added up."
          >
            <ParsedExpenses />
          </Tile>

          <Tile
            className="lg:col-span-2"
            icon={FileText}
            title="Statements, read for you"
            body="Upload a PDF statement and the transactions are extracted without manual entry."
          />

          <Tile
            className="lg:col-span-2"
            icon={PieChart}
            title="Budgets by category"
            body="See what you've spent against each limit at a glance."
          >
            <BudgetBars />
          </Tile>

          <Tile
            className="lg:col-span-4"
            icon={MessageSquare}
            title="Ask about your own numbers"
            body="Questions are answered from your transactions, and responses stream in as they're written."
          >
            <AdvisorExchange />
          </Tile>
        </div>
      </section>

      {/* How it works: a real sequence, so numbers are warranted */}
      <section id="how-it-works" className="bg-[#0A1613] text-white">
        <div className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
          <h2 className="serif max-w-2xl text-4xl leading-tight text-white sm:text-5xl">
            Less time sorting. More time deciding.
          </h2>

          <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t border-white/15 pt-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3DDC97]/40 text-sm tabular-nums text-[#3DDC97]">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-medium text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Security: understated, footnote-style */}
      <section id="security" className="border-t border-[color:var(--line)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-[1fr_1.4fr]">
          <div className="flex items-start gap-3">
            <span className={`mt-1 ${accent}`}>
              <Lock size={16} strokeWidth={1.5} />
            </span>
            <h2 className={`serif text-2xl ${ink}`}>Your data stays yours.</h2>
          </div>
          <ul className={`space-y-3 text-sm leading-6 ${muted}`}>
            {securityNotes.map((n) => (
              <li key={n} className="border-b border-[color:var(--line)] pb-3">
                {n}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[color:var(--line)]">
        <div className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
          <h2
            className={`serif max-w-2xl text-4xl leading-tight sm:text-5xl ${ink}`}
          >
            Add your first statement and see the picture.
          </h2>
          <div className="mt-10">
            <PrimaryButton onClick={openApp}>
              Get started
              <ArrowRight size={16} strokeWidth={1.5} />
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[color:var(--line)]">
        <div
          className={`mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs sm:flex-row sm:justify-between ${muted}`}
        >
          <span>© 2026 Finance-AI</span>
          <span>
            Finance-AI provides insights, not regulated financial advice.
          </span>
        </div>
      </footer>
    </main>
  );
}
