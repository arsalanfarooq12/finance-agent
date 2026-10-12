import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CreditCard,
  MessageSquare,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: MessageSquare,
    title: "Talk to your money",
    description:
      "Paste expenses naturally and let the AI understand, categorize, and analyze them instantly.",
  },
  // {
  //   icon: FileText,
  //   title: "Upload bank statements",
  //   description:
  //     "Drop in PDF statements and automatically extract transactions without manually entering every expense.",
  // },
  {
    icon: Bot,
    title: "AI financial advisor",
    description:
      "Ask questions about your spending and receive practical, personalized financial guidance.",
  },
  {
    icon: BarChart3,
    title: "Live financial dashboard",
    description:
      "Track spending, budgets, savings, categories, and trends from one real-time dashboard.",
  },
  {
    icon: Zap,
    title: "Real-time streaming",
    description:
      "Get AI responses as they're generated with a fast conversational streaming experience.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Your financial information stays protected with secure handling and controlled access.",
  },
];

function Badge({
  children,
  darkMode,
}: {
  children: React.ReactNode;
  darkMode: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium tracking-[0.12em] uppercase backdrop-blur-sm ${
        darkMode
          ? "border-[#d9b87d]/30 bg-[#1a150f]/80 text-[#f3deaa] shadow-[0_0_0_1px_rgba(217,184,125,0.12)]"
          : "border-[#d9b87d]/25 bg-[#f7efe3] text-[#886a2e]"
      }`}
    >
      <Sparkles size={15} />
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  darkMode,
}: {
  eyebrow: string;
  title: string;
  description: string;
  darkMode: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div
        className={`mb-3 text-xs font-semibold uppercase tracking-[0.22em] ${
          darkMode ? "text-[#d9b87d]" : "text-[#8d6d2f]"
        }`}
      >
        {eyebrow}
      </div>

      <h2
        className={`text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl ${
          darkMode ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>

      <p
        className={`mt-5 text-base leading-7 sm:text-lg ${
          darkMode ? "text-neutral-400" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function DashboardPreview({ darkMode }: { darkMode: boolean }) {
  const textPrimary = darkMode ? "text-white" : "text-slate-950";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div className="relative mx-auto mt-10 max-w-[1250px] sm:mt-16">
      <div
        className={`absolute -inset-10 rounded-[4rem] blur-3xl ${
          darkMode ? "bg-[#d9b87d]/12" : "bg-[#f7efe3]/80"
        }`}
      />

      <div
        className={`relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_40px_100px_rgba(7,8,12,0.45)] backdrop-blur-2xl ${
          darkMode ? "bg-[rgba(18,15,13,0.68)]" : "bg-[rgba(255,255,255,0.62)]"
        }`}
      >
        <div
          className={`flex h-12 items-center justify-between border-b px-4 ${
            darkMode
              ? "border-[#d9b87d]/10 bg-[rgba(23,19,16,0.78)]"
              : "border-[#ead8b4] bg-[rgba(251,247,242,0.72)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d9b87d]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d9b87d]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d9b87d]/60" />
          </div>

          <div
            className={`hidden rounded-full border px-4 py-1 text-[10px] uppercase tracking-[0.18em] sm:block ${
              darkMode
                ? "border-white/10 bg-white/3 text-slate-400"
                : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            {/* finance-ai.app */}
          </div>

          <div className="w-12" />
        </div>

        <div
          className={`flex h-[72px] items-center justify-between border-b px-5 sm:px-7 ${
            darkMode
              ? "border-[#d9b87d]/10 bg-[rgba(23,19,16,0.70)]"
              : "border-[#ead8b4] bg-[rgba(255,253,249,0.70)]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#d9b87d]/30 bg-[#d9b87d]/10 text-[#f0d8a6]">
              <img src="./favicon.svg" alt="Finance-AI Logo" />
            </div>

            <div>
              <div className={`text-sm font-bold ${textPrimary}`}>
                Finance-AI
              </div>
              <div
                className={`text-[10px] uppercase tracking-[0.16em] ${textSecondary}`}
              >
                Personal finance
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9b87d]/10 text-xs font-medium text-[#f0d8a6]">
              A
            </div>
            <span
              className={`hidden text-sm font-medium sm:block ${textPrimary}`}
            >
              Arsalan
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[330px_1fr]">
          <aside
            className={`relative hidden min-h-[650px] flex-col border-r backdrop-blur-md md:flex ${
              darkMode
                ? "border-white/10 bg-[#0d141a]/55"
                : "border-slate-200 bg-slate-50/60"
            }`}
          >
            <div className="p-5 sm:p-6">
              <div
                className={`text-[13px] leading-7 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <p className="text-[15px] leading-7 text-slate-200">
                  Hi! I’m your personal finance assistant. Paste your expenses
                  and I’ll make sense of them.
                </p>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9b87d]">
                  Example
                </p>
                <p
                  className={`mt-2 rounded-2xl border border-[#d9b87d]/15 bg-[#d9b87d]/5 px-3 py-2 italic ${
                    darkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Coffee 200, Rent 20000, Uber 1500, Groceries 5000
                </p>
                <p
                  className={`mt-4 text-[11px] ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  18:16
                </p>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div
                className={`rounded-2xl border p-2 ${
                  darkMode
                    ? "border-white/10 bg-[#101922]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex-1 px-3 py-3 text-sm ${
                      darkMode ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    Message Finance-AI...
                  </div>
                  <button
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      darkMode
                        ? "bg-emerald-500/12 text-emerald-300"
                        : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div
            className={`min-w-0 overflow-hidden backdrop-blur-md ${
              darkMode ? "bg-[#171310]/70" : "bg-[#fffaf2]/60"
            }`}
          >
            <div className="p-4 sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className={`text-2xl font-black tracking-[-0.04em] ${textPrimary}`}
                  >
                    Dashboard
                  </h2>
                  <p className={`mt-1 text-sm ${textSecondary}`}>
                    Total: ₹36,700
                  </p>
                </div>
                <button
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                    darkMode
                      ? "border-white/10 text-slate-300"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Clear All
                </button>
              </div>

              {/* <div className={`mt-5 flex items-center justify-between rounded-2xl border px-4 py-4 sm:px-5 ${darkMode ? "border-white/10 bg-[#111b22]" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center gap-3"> */}
              {/* <FileText className="text-emerald-400" size={19} /> */}
              {/* <span className={`text-sm font-semibold ${textPrimary}`}>Upload bank statement (PDF)</span> */}
              {/* </div> */}
              {/* <span className={`hidden text-xs sm:block ${textSecondary}`}>Expand</span> */}
              {/* </div> */}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Total Spend", value: "₹36,700" },
                  { label: "Transactions", value: "10" },
                  { label: "Categories", value: "4" },
                  {
                    label: "Top Category",
                    value: "Housing",
                    secondary: "₹23,000",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border p-5 ${
                      darkMode
                        ? "border-white/10 bg-[#111b22]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p
                      className={`text-[10px] uppercase tracking-[0.16em] ${textSecondary}`}
                    >
                      {item.label}
                    </p>
                    <p className={`mt-2 text-2xl font-black ${textPrimary}`}>
                      {item.value}
                    </p>
                    {item.secondary && (
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {item.secondary}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div
                className={`mt-5 rounded-2xl border p-5 ${
                  darkMode
                    ? "border-white/10 bg-[#111b22]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className={`font-bold ${textPrimary}`}>Budgets</h3>
                  <button className="text-xs font-medium text-emerald-400">
                    + Add
                  </button>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      name: "Housing",
                      spent: "₹23,000",
                      budget: "₹50,000",
                      width: "46%",
                    },
                    {
                      name: "Food",
                      spent: "₹6,200",
                      budget: "₹20,000",
                      width: "31%",
                    },
                  ].map((budget) => (
                    <div key={budget.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`text-sm font-medium ${textPrimary}`}>
                          {budget.name}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-400">
                          {budget.spent} / {budget.budget}
                        </span>
                      </div>
                      <div
                        className={`h-2 overflow-hidden rounded-full ${
                          darkMode ? "bg-white/5" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                          style={{ width: budget.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`mt-5 rounded-2xl border p-5 ${
                  darkMode
                    ? "border-white/10 bg-[#111b22]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <h3 className={`font-bold ${textPrimary}`}>
                  Spending by Category
                </h3>
                <div className="mt-6 grid items-center gap-8 lg:grid-cols-[240px_1fr]">
                  <div className="flex justify-center">
                    <div
                      className="relative h-44 w-44 rounded-full"
                      style={{
                        background:
                          "conic-gradient(#34d399 0deg 227deg, #22d3ee 227deg 288deg, #cbd5e1 288deg 331deg, #fbbf24 331deg 360deg)",
                      }}
                    >
                      <div
                        className={`absolute inset-[30px] flex items-center justify-center rounded-full ${
                          darkMode ? "bg-[#111b22]" : "bg-white"
                        }`}
                      >
                        <div className="text-center">
                          <p className={`text-xl font-black ${textPrimary}`}>
                            ₹36.7k
                          </p>
                          <p
                            className={`text-[10px] uppercase tracking-[0.16em] ${textSecondary}`}
                          >
                            Total spend
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Housing",
                        value: "63%",
                        color: "bg-emerald-400",
                      },
                      { name: "Food", value: "17%", color: "bg-teal-400" },
                      { name: "Other", value: "12%", color: "bg-slate-400" },
                      { name: "Transport", value: "8%", color: "bg-amber-400" },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-3 w-3 rounded-full ${item.color}`}
                          />
                          <span className={`text-sm ${textSecondary}`}>
                            {item.name}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${textPrimary}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={`mt-5 rounded-2xl border p-5 ${
                  darkMode
                    ? "border-white/10 bg-[#111b22]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <h3 className={`font-bold ${textPrimary}`}>Monthly Spending</h3>
                <div
                  className={`mt-6 flex h-48 items-end justify-center gap-6 border-b px-2 sm:gap-12 sm:px-6 ${
                    darkMode ? "border-white/10" : "border-slate-200"
                  }`}
                >
                  {[
                    { month: "2026-08", height: "55%", value: "₹14k" },
                    { month: "2026-06", height: "82%", value: "₹21k" },
                  ].map((bar) => (
                    <div
                      key={bar.month}
                      className="flex h-full w-24 flex-col items-center justify-end sm:w-36"
                    >
                      <span className={`mb-2 text-xs ${textSecondary}`}>
                        {bar.value}
                      </span>
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500 to-teal-400"
                        style={{ height: bar.height }}
                      />
                      <span
                        className={`mt-3 text-[10px] uppercase tracking-[0.16em] ${textSecondary}`}
                      >
                        {bar.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinanceLandingPage() {
  const [darkMode, setDarkMode] = useState(true);

  const navigate = useNavigate();
  const { session } = useAuth();

  const openAuth = () => {
    navigate("/app");
  };

  if (session) {
    navigate("/app");
  } else {
    return (
      <main
        className={`min-h-screen overflow-hidden transition-colors duration-300 ${
          darkMode
            ? "bg-[radial-gradient(circle_at_top,_rgba(246,220,170,0.18),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(163,177,255,0.08),_transparent_34%),linear-gradient(180deg,_rgba(20,23,28,0.90),_rgba(16,18,22,0.96))] text-white"
            : "bg-[radial-gradient(circle_at_top,_rgba(217,184,125,0.22),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(152,166,255,0.06),_transparent_32%),linear-gradient(180deg,_rgba(255,252,248,0.96),_rgba(247,242,235,0.99))] text-slate-950"
        }`}
      >
        <header className="fixed inset-x-0 top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <div
              className={`flex items-center justify-between rounded-full border px-4 py-3 shadow-[0_16px_50px_rgba(33,29,24,0.14)] backdrop-blur-2xl sm:px-6 ${
                darkMode
                  ? "border-white/10 bg-[rgba(37,32,27,0.42)]"
                  : "border-white/60 bg-[rgba(255,255,255,0.55)]"
              }`}
            >
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2.5"
                aria-label="Finance-AI home"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d9b87d]/30 bg-[#d9b87d]/10 text-white">
                  <img src="./favicon.svg" alt="Finance-AI Logo" />
                </div>
                <span
                  className={`text-lg font-black tracking-[-0.04em] ${
                    darkMode ? "text-white" : "text-slate-950"
                  }`}
                >
                  Finance-AI
                </span>
              </button>

              <nav
                className={`hidden items-center gap-7 text-sm font-medium md:flex ${
                  darkMode ? "text-[#e7d9b8]" : "text-slate-600"
                }`}
              >
                <a href="#features" className="transition hover:text-[#d9b87d]">
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="transition hover:text-[#d9b87d]"
                >
                  How it works
                </a>
                <a
                  href="#ai-advisor"
                  className="transition hover:text-[#d9b87d]"
                >
                  AI Advisor
                </a>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode((prev) => !prev)}
                  aria-label="Toggle dark mode"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    darkMode
                      ? "border-[#d9b87d]/15 bg-[#1a1714] text-[#f0d8a6] hover:bg-[#221d19]"
                      : "border-[#ead8b4] bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                  onClick={openAuth}
                  className={`hidden rounded-full px-4 py-2 text-sm font-semibold transition sm:block ${
                    darkMode
                      ? "text-[#f3e7c5] hover:bg-[#1a1714]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Sign in
                </button>

                <button
                  onClick={openAuth}
                  className="rounded-full bg-gradient-to-r from-[#f0d8a6] to-[#d9b87d] px-4 py-2.5 text-sm font-semibold text-[#1d140b] shadow-[0_12px_40px_rgba(217,184,125,0.28)] transition hover:brightness-110"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="relative px-4 pb-20 pt-36 sm:px-6 lg:px-8 lg:pt-44">
          <div className="absolute inset-0 -z-10">
            <div
              className={`absolute left-1/2 top-0 h-[560px] w-[820px] -translate-x-1/2 rounded-full blur-3xl ${
                darkMode ? "bg-[#d9b87d]/10" : "bg-[#f7efe3]/80"
              }`}
            />
            <div
              className={`absolute right-0 top-96 h-72 w-72 rounded-full blur-3xl ${
                darkMode ? "bg-[#d9b87d]/8" : "bg-[#f0e6d1]/60"
              }`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_26%)]" />
            <div className="absolute inset-0 backdrop-blur-[1px]" />
          </div>

          <div className="mx-auto max-w-5xl text-center">
            <Badge darkMode={darkMode}>Your money, understood by AI</Badge>

            <h1
                  className={`mx-auto mt-7 max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.07em] sm:text-6xl lg:text-[6.5rem] ${
                darkMode ? "text-white" : "text-slate-950"
              }`}
            >
                  Your wealth,
                  <span className="block bg-gradient-to-r from-[#f7e7c0] via-[#d9b87d] to-[#c6a367] bg-clip-text text-transparent">
                    refined by intelligence.
              </span>
            </h1>

            <p
              className={`mx-auto mt-7 max-w-2xl text-base leading-7 sm:text-lg ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Finance-AI turns your expenses, budgets, and financial questions
              into actionable insights through a real-time AI financial advisor.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={openAuth}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f5e4b7] via-[#e8c987] to-[#d9b87d] px-6 py-4 text-base font-bold text-[#1d140b] shadow-[0_18px_45px_rgba(217,184,125,0.3)] transition hover:scale-[1.01] hover:brightness-110 sm:w-auto"
              >
                Start analyzing your money
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <a
                href="#how-it-works"
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-6 py-4 text-base font-bold transition sm:w-auto ${
                  darkMode
                    ? "border-[#d9b87d]/20 bg-[#12100d]/60 text-[#f5eedb] hover:bg-[#1d1713]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                See how it works
                <ChevronRight size={18} />
              </a>
            </div>

            <div
              className={`mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              <span className="flex items-center gap-2">
                <Check size={15} className="text-[#d9b87d]" />
                No spreadsheets
              </span>
              <span className="flex items-center gap-2">
                <Check size={15} className="text-[#d9b87d]" />
                Real-time AI
              </span>
            </div>
          </div>

          <DashboardPreview darkMode={darkMode} />
        </section>

        <section
          className={`border-y ${
            darkMode
              ? "border-[#d9b87d]/10 bg-[#0b1218]/70"
              : "border-slate-200 bg-slate-50/70"
          }`}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 py-7 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
            <p
              className={`text-sm font-medium tracking-[0.12em] uppercase ${
                darkMode ? "text-[#f0d8a6]" : "text-[#86682d]"
              }`}
            >
              Built for clarity
            </p>

            <div
              className={`flex items-center gap-6 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck size={17} className="text-[#d9b87d]" />
                Secure
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap size={17} className="text-[#d9b87d]" />
                Real-time
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bot size={17} className="text-[#d9b87d]" />
                AI-powered
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className={`px-4 py-24 sm:px-6 lg:px-8 lg:py-32 ${
            darkMode ? "bg-[#04080b]" : "bg-[#fffdfa]"
          }`}
        >
          <SectionHeading
            darkMode={darkMode}
            eyebrow="Everything in one place"
            title="Your finances should answer questions, not create them."
            description="Finance-AI combines transaction parsing, document extraction, budgeting, analytics, and conversational AI into one financial command center."
          />

          <div className="mx-auto mt-16 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group rounded-[1.7rem] border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(205,154,71,0.12)] ${
                    darkMode
                      ? "border-[#d9b87d]/15 bg-[#120f0d] hover:border-[#d9b87d]/35 hover:bg-[#171310]"
                      : "border-[#ead8b4] bg-[#fffaf2] hover:border-[#d9b87d]/35 hover:bg-[#f5ecdd]"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d9b87d]/12 text-[#f0d8a6] ring-1 ring-[#d9b87d]/10 transition group-hover:bg-[#d9b87d] group-hover:text-[#1d140b]">
                    <Icon size={21} />
                  </div>

                  <h3
                    className={`mt-6 text-xl font-bold ${
                      darkMode ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-6 ${
                      darkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-[radial-gradient(circle_at_top,_rgba(217,184,125,0.12),_transparent_45%),_#071016] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b87d]">
                  How it works
                </div>

                <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                  Give your AI the raw data.
                  <span className="block text-[#d9b87d]">
                    Get the full picture.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
                  Stop spending hours categorizing transactions and building
                  spreadsheets. Finance-AI handles the messy work so you can
                  focus on decisions.
                </p>

                <div className="mt-10 space-y-6">
                  {[
                    {
                      number: "01",
                      title: "Import your finances",
                      description: "Paste expenses, upload a CSV.",
                    },
                    {
                      number: "02",
                      title: "Set your goals",
                      description:
                        "Tell Finance-AI your budgets, spending limits, and savings targets.",
                    },
                    {
                      number: "03",
                      title: "Ask anything",
                      description:
                        "Chat with your financial AI and receive instant analysis and advice.",
                    },
                  ].map((step) => (
                    <div key={step.number} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d9b87d]/20 bg-[#d9b87d]/8 text-xs font-bold text-[#f0d8a6] shadow-[0_0_0_1px_rgba(217,184,125,0.08)]">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{step.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 rounded-full bg-[#d9b87d]/10 blur-3xl" />
                <div className="relative rounded-[2rem] border border-[#d9b87d]/15 bg-[#120f0d] p-5 shadow-[0_30px_80px_rgba(20,14,8,0.42)] ring-1 ring-white/5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f0d8a6] to-[#d9b87d] text-[#1d140b]">
                      <Bot size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Finance-AI Advisor</p>
                      <p className="text-xs text-slate-500">
                        Streaming response
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-[#f0d8a6]">
                      <span className="h-2 w-2 rounded-full bg-[#d9b87d]" />
                      Online
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-r from-[#f0d8a6] to-[#d9b87d] p-4 text-sm font-medium text-[#1d140b]">
                      Why did my spending increase this month?
                    </div>

                    <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-[#d9b87d]/10 bg-[#1a1714] p-4 text-sm leading-6 text-slate-300">
                      Your spending increased by{" "}
                      <strong className="text-white">12.4%</strong> compared
                      with last month.
                      <br />
                      <br />
                      The biggest changes came from dining (+₹1,260), online
                      shopping (+₹940), and transportation (+₹610).
                      <br />
                      <br />
                      You can still stay within your monthly budget by reducing
                      discretionary spending by about ₹180 per day.
                    </div>

                    <div className="flex items-center gap-2 px-2 text-xs text-slate-500">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#d9b87d]" />
                      Analyzing your latest transactions...
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#d9b87d]/10 bg-[#1a1714] p-3">
                    <input
                      placeholder="Ask about your finances..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-[#f0d8a6] to-[#d9b87d] text-[#1d140b]">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="ai-advisor"
          className={`px-4 py-24 sm:px-6 lg:px-8 lg:py-32 ${
            darkMode ? "bg-[#050b10]" : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#d9b87d]/20 bg-[radial-gradient(circle_at_top,_rgba(217,184,125,0.18),_transparent_38%),_linear-gradient(135deg,_rgba(217,184,125,0.12),_rgba(18,15,13,0.96))] px-6 py-12 text-white shadow-[0_24px_80px_rgba(14,10,6,0.45)] sm:px-10 lg:px-16 lg:py-16">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d9b87d]/25 bg-[#d9b87d]/8 px-4 py-2 text-sm font-medium text-[#f0d8a6]">
                  <Sparkles size={15} />
                  Your personal financial AI
                </div>

                <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                  Ask better questions.
                  <span className="block text-[#d9b87d]">
                    Make better decisions.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
                  “Can I afford a ₹9000 vacation?” “Where am I overspending?”
                  “How much should I save this month?” Your financial data
                  becomes a conversation.
                </p>

                <button
                  onClick={openAuth}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-[#1d140b] shadow-[0_18px_45px_rgba(255,255,255,0.12)] transition hover:bg-[#f5ecdd]"
                >
                  Talk to Finance-AI
                  <ArrowRight size={17} />
                </button>
              </div>

              <div className="rounded-[1.6rem] border border-[#d9b87d]/10 bg-[#1a1714]/50 p-5 backdrop-blur-sm">
                <div className="space-y-3">
                  {[
                    "Analyze my spending this month",
                    "Am I on track for my savings goal?",
                    "Find 3 areas where I can cut costs",
                    "Create a budget for next month",
                  ].map((question) => (
                    <div
                      key={question}
                      className="flex items-center justify-between rounded-2xl border border-[#d9b87d]/10 bg-[#201d1a]/70 px-4 py-4 text-sm text-slate-200"
                    >
                      <span>{question}</span>
                      <ChevronRight size={17} className="text-[#f0d8a6]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`border-t px-4 py-24 sm:px-6 lg:px-8 ${
            darkMode
              ? "border-[#d9b87d]/10 bg-[radial-gradient(circle_at_top,_rgba(217,184,125,0.10),_transparent_35%),_#0d0b09]"
              : "border-[#ead8b4] bg-[radial-gradient(circle_at_top,_rgba(217,184,125,0.08),_transparent_35%),_#fffaf2]"
          }`}
        >
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f0d8a6] to-[#d9b87d] text-[#1d140b] shadow-[0_18px_45px_rgba(217,184,125,0.24)]">
              <CreditCard size={23} />
            </div>

            <h2
              className={`mt-7 text-4xl font-black tracking-[-0.05em] sm:text-6xl ${
                darkMode ? "text-white" : "text-slate-950"
              }`}
            >
              Your money deserves
              <span className="block bg-gradient-to-r from-[#f0d8a6] to-[#d9b87d] bg-clip-text text-transparent">
                an intelligent system.
              </span>
            </h2>

            <p
              className={`mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Import your first statement, set your budget, and let Finance-AI
              turn your financial data into decisions.
            </p>

            <button
              onClick={openAuth}
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f0d8a6] to-[#d9b87d] px-7 py-4 text-base font-bold text-[#1d140b] shadow-[0_18px_45px_rgba(217,184,125,0.24)] transition hover:brightness-110"
            >
              Get started for free
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <footer
          className={`border-t ${
            darkMode
              ? "border-[#d9b87d]/10 bg-[#120f0d]"
              : "border-[#ead8b4] bg-[#fffaf2]"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f0d8a6] to-[#d9b87d] text-[#1d140b]">
                <img src="./favicon.svg" alt="Finance-AI Logo" />
              </div>
              <span
                className={`font-black ${
                  darkMode ? "text-white" : "text-slate-950"
                }`}
              >
                Finance-AI
              </span>
            </div>
            <p
              className={`text-sm ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Intelligent personal finance, powered by AI.
            </p>
          </div>
        </footer>
      </main>
    );
  }
}
