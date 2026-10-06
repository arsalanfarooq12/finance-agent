import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
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
  {
    icon: FileText,
    title: "Upload bank statements",
    description:
      "Drop in PDF statements and automatically extract transactions without manually entering every expense.",
  },
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
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
        darkMode
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
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
        className={`mb-4 text-sm font-semibold uppercase tracking-[0.18em] ${
          darkMode ? "text-emerald-400" : "text-emerald-600"
        }`}
      >
        {eyebrow}
      </div>

      <h2
        className={`text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${
          darkMode ? "text-white" : "text-neutral-950"
        }`}
      >
        {title}
      </h2>

      <p
        className={`mt-5 text-base leading-7 sm:text-lg ${
          darkMode ? "text-neutral-400" : "text-neutral-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function DashboardPreview({ darkMode }: { darkMode: boolean }) {
  const surface = darkMode
    ? "border-neutral-800 bg-[#242424]"
    : "border-neutral-200 bg-white";

  const textPrimary = darkMode ? "text-white" : "text-neutral-950";
  const textSecondary = darkMode ? "text-neutral-400" : "text-neutral-500";

  const categories = [
    {
      name: "Housing",
      amount: "₹23,000",
      items: "3 items",
      width: "63%",
      color: "bg-emerald-500",
    },
    {
      name: "Food",
      amount: "₹6,200",
      items: "4 items",
      width: "17%",
      color: "bg-teal-500",
    },
    {
      name: "Other",
      amount: "₹4,500",
      items: "2 items",
      width: "12%",
      color: "bg-orange-500",
    },
    {
      name: "Transport",
      amount: "₹3,000",
      items: "1 item",
      width: "8%",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="relative mx-auto mt-10 max-w-[1250px] sm:mt-16">
      {/* Glow */}
      <div
        className={`absolute -inset-10 rounded-[4rem] blur-3xl ${
          darkMode ? "bg-emerald-500/10" : "bg-emerald-500/10"
        }`}
      />

      {/* Browser frame */}
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-[0_30px_100px_-30px_rgba(0,0,0,0.35)] sm:rounded-[1.75rem] ${
          darkMode ? "bg-[#1b1b1b]" : "bg-white"
        } ${surface}`}
      >
        {/* Browser top */}
        <div
          className={`flex h-12 items-center justify-between border-b px-4 ${
            darkMode
              ? "border-neutral-800 bg-[#171717]"
              : "border-neutral-200 bg-neutral-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>

          <div
            className={`hidden rounded-md border px-5 py-1 text-[11px] sm:block ${
              darkMode
                ? "border-neutral-800 bg-[#202020] text-neutral-500"
                : "border-neutral-200 bg-white text-neutral-400"
            }`}
          >
            finance-ai.app/dashboard
          </div>

          <div className="w-12" />
        </div>

        {/* Application header */}
        <div
          className={`flex h-[72px] items-center justify-between border-b px-5 sm:px-7 ${
            darkMode
              ? "border-neutral-800 bg-[#151515]"
              : "border-neutral-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white text-emerald-600">
              <img src="./favicon.svg" alt="Finance-Ai Logo" />
            </div>

            <div>
              <div className={`font-black ${textPrimary}`}>Finance-AI</div>
              <div className={`text-xs ${textSecondary}`}>
                Personal Finance Agent
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-sm font-medium text-emerald-300">
              A
            </div>

            <span
              className={`hidden text-sm font-semibold sm:block ${textPrimary}`}
            >
              Arsalan
            </span>

            <button
              className={`hidden rounded-lg border px-3 py-2 text-xs sm:block ${
                darkMode
                  ? "border-neutral-700 text-neutral-300"
                  : "border-neutral-200 text-neutral-600"
              }`}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* App — sidebar hides on mobile, dashboard takes full width */}
        <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[330px_1fr]">
          {/* AI Assistant */}
          <aside
            className={`relative hidden min-h-[650px] flex-col border-r md:flex ${
              darkMode
                ? "border-neutral-800 bg-[#1d1d1d]"
                : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <div className="p-5 sm:p-6">
              <div
                className={`text-[13px] leading-7 ${
                  darkMode ? "text-neutral-200" : "text-neutral-700"
                }`}
              >
                <p>
                  Hi! I'm your personal finance assistant. Paste your expenses
                  in any format and I'll analyze them for you.
                </p>

                <p className="mt-8 font-medium">Example:</p>

                <p
                  className={`mt-2 italic ${
                    darkMode ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  Coffee 200, Rent 20000, Uber 1500, Groceries 5000
                </p>

                <p
                  className={`mt-4 text-[11px] ${
                    darkMode ? "text-neutral-600" : "text-neutral-400"
                  }`}
                >
                  18:16
                </p>
              </div>
            </div>

            {/* Chat input */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div
                className={`rounded-2xl border p-2 ${
                  darkMode
                    ? "border-neutral-700 bg-[#292929]"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex-1 px-3 py-3 text-sm ${
                      darkMode ? "text-neutral-500" : "text-neutral-400"
                    }`}
                  >
                    Message Finance-AI...
                  </div>

                  <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-700 text-neutral-300">
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>

              <p
                className={`mt-3 text-center text-[10px] ${
                  darkMode ? "text-neutral-600" : "text-neutral-400"
                }`}
              >
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </aside>

          {/* Dashboard */}
          <div
            className={`min-w-0 overflow-hidden ${
              darkMode ? "bg-[#202020]" : "bg-neutral-100"
            }`}
          >
            <div className="p-4 sm:p-7">
              {/* Dashboard heading */}
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className={`text-2xl font-black tracking-tight ${textPrimary}`}
                  >
                    Dashboard
                  </h2>

                  <p className={`mt-1 text-sm ${textSecondary}`}>
                    Total: ₹36,700
                  </p>
                </div>

                <button
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                    darkMode
                      ? "border-neutral-700 text-red-400"
                      : "border-red-200 text-red-500"
                  }`}
                >
                  Clear All
                </button>
              </div>

              {/* Upload */}
              <div
                className={`mt-5 flex items-center justify-between rounded-2xl border px-4 py-4 sm:px-5 ${
                  darkMode
                    ? "border-neutral-700 bg-[#292929]"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-emerald-500" size={19} />

                  <span className={`text-sm font-bold ${textPrimary}`}>
                    Upload bank statement (PDF)
                  </span>
                </div>

                <span className={`hidden text-xs sm:block ${textSecondary}`}>
                  ▼ expand
                </span>
              </div>

              {/* KPI cards */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Total Spend",
                    value: "₹36,700",
                  },
                  {
                    label: "Transactions",
                    value: "10",
                  },
                  {
                    label: "Categories",
                    value: "4",
                  },
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
                        ? "border-neutral-700 bg-[#292929]"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <p className={`text-xs ${textSecondary}`}>{item.label}</p>

                    <p className={`mt-2 text-2xl font-black ${textPrimary}`}>
                      {item.value}
                    </p>

                    {item.secondary && (
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          darkMode ? "text-white" : "text-neutral-700"
                        }`}
                      >
                        {item.secondary}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Budgets */}
              <div
                className={`mt-5 rounded-2xl border p-5 ${
                  darkMode
                    ? "border-neutral-700 bg-[#292929]"
                    : "border-neutral-200 bg-white"
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
                        <span
                          className={`text-sm font-semibold ${textPrimary}`}
                        >
                          {budget.name}
                        </span>

                        <span className="text-xs font-semibold text-emerald-400">
                          {budget.spent} / {budget.budget}
                        </span>
                      </div>

                      <div
                        className={`h-2 overflow-hidden rounded-full ${
                          darkMode ? "bg-neutral-800" : "bg-neutral-200"
                        }`}
                      >
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{ width: budget.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spending by category */}
              <div
                className={`mt-5 rounded-2xl border p-5 ${
                  darkMode
                    ? "border-neutral-700 bg-[#292929]"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <h3 className={`font-bold ${textPrimary}`}>
                  Spending by Category
                </h3>

                <div className="mt-6 grid items-center gap-8 lg:grid-cols-[240px_1fr]">
                  {/* Donut */}
                  <div className="flex justify-center">
                    <div
                      className="relative h-44 w-44 rounded-full"
                      style={{
                        background:
                          "conic-gradient(#10b981 0deg 227deg, #14b8a6 227deg 288deg, #f97316 288deg 331deg, #f59e0b 331deg 360deg)",
                      }}
                    >
                      <div
                        className={`absolute inset-[30px] flex items-center justify-center rounded-full ${
                          darkMode ? "bg-[#292929]" : "bg-white"
                        }`}
                      >
                        <div className="text-center">
                          <p className={`text-xl font-black ${textPrimary}`}>
                            ₹36.7k
                          </p>

                          <p className={`text-[10px] ${textSecondary}`}>
                            Total spend
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-4">
                    {[
                      {
                        name: "Housing",
                        value: "63%",
                        color: "bg-emerald-500",
                      },
                      {
                        name: "Food",
                        value: "17%",
                        color: "bg-teal-500",
                      },
                      {
                        name: "Other",
                        value: "12%",
                        color: "bg-orange-500",
                      },
                      {
                        name: "Transport",
                        value: "8%",
                        color: "bg-amber-500",
                      },
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

              {/* Monthly Spending */}
              <div
                className={`mt-5 rounded-2xl border p-5 ${
                  darkMode
                    ? "border-neutral-700 bg-[#292929]"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <h3 className={`font-bold ${textPrimary}`}>Monthly Spending</h3>

                <div className="mt-6 flex h-48 items-end justify-center gap-6 border-b border-neutral-700/60 px-2 sm:gap-12 sm:px-6">
                  {[
                    {
                      month: "2026-08",
                      height: "55%",
                      value: "₹14k",
                    },
                    {
                      month: "2026-06",
                      height: "82%",
                      value: "₹21k",
                    },
                  ].map((bar) => (
                    <div
                      key={bar.month}
                      className="flex h-full w-24 flex-col items-center justify-end sm:w-36"
                    >
                      <span className={`mb-2 text-xs ${textSecondary}`}>
                        {bar.value}
                      </span>

                      <div
                        className="w-full rounded-t-lg bg-emerald-500"
                        style={{ height: bar.height }}
                      />

                      <span className={`mt-3 text-xs ${textSecondary}`}>
                        {bar.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category breakdown */}
              <div
                className={`mt-5 rounded-2xl border p-5 ${
                  darkMode
                    ? "border-neutral-700 bg-[#292929]"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <h3 className={`font-bold ${textPrimary}`}>
                  Category Breakdown
                </h3>

                <div className="mt-6 space-y-5">
                  {categories.map((category) => (
                    <div key={category.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`text-sm font-medium ${textPrimary}`}>
                          {category.name}
                        </span>

                        <span className={`text-xs ${textSecondary}`}>
                          {category.amount} · {category.items}
                        </span>
                      </div>

                      <div
                        className={`h-2 overflow-hidden rounded-full ${
                          darkMode ? "bg-neutral-800" : "bg-neutral-200"
                        }`}
                      >
                        <div
                          className={`h-full rounded-full ${category.color}`}
                          style={{ width: category.width }}
                        />
                      </div>
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
  // Every authentication CTA uses this.
  const openAuth = () => {
    navigate("/app");
  };
  if (session) {
    navigate("/app");
  } else {
    return (
      <main
        className={`min-h-screen overflow-hidden transition-colors duration-300 ${
          darkMode ? "bg-neutral-950 text-white" : "bg-white text-neutral-950"
        }`}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <div
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6 ${
                darkMode
                  ? "border-neutral-800 bg-neutral-900/90"
                  : "border-neutral-200/80 bg-white/90"
              }`}
            >
              {/* Logo */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                  <img src="./favicon.svg" alt="Finance-AI Logo" />
                </div>

                <span
                  className={`text-lg font-black tracking-tight ${
                    darkMode ? "text-white" : "text-neutral-950"
                  }`}
                >
                  Finance-AI
                </span>
              </button>

              {/* Desktop nav */}
              <nav
                className={`hidden items-center gap-7 text-sm font-medium md:flex ${
                  darkMode ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                <a
                  href="#features"
                  className="transition hover:text-emerald-500"
                >
                  Features
                </a>

                <a
                  href="#how-it-works"
                  className="transition hover:text-emerald-500"
                >
                  How it works
                </a>

                <a
                  href="#ai-advisor"
                  className="transition hover:text-emerald-500"
                >
                  AI Advisor
                </a>
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <button
                  onClick={() => setDarkMode((prev) => !prev)}
                  aria-label="Toggle dark mode"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    darkMode
                      ? "border-neutral-700 bg-neutral-800 text-yellow-300 hover:bg-neutral-700"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Sign in */}
                <button
                  onClick={openAuth}
                  className={`hidden rounded-xl px-4 py-2 text-sm font-semibold transition sm:block ${
                    darkMode
                      ? "text-neutral-300 hover:bg-neutral-800"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  Sign in
                </button>

                {/* Get started */}
                <button
                  onClick={openAuth}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative px-4 pb-20 pt-36 sm:px-6 lg:px-8 lg:pt-44">
          <div className="absolute inset-0 -z-10">
            <div
              className={`absolute left-1/2 top-0 h-[550px] w-[900px] -translate-x-1/2 rounded-full blur-3xl ${
                darkMode ? "bg-emerald-600/10" : "bg-emerald-100/60"
              }`}
            />

            <div
              className={`absolute right-0 top-72 h-72 w-72 rounded-full blur-3xl ${
                darkMode ? "bg-teal-600/10" : "bg-teal-100/40"
              }`}
            />
          </div>

          <div className="mx-auto max-w-5xl text-center">
            <Badge darkMode={darkMode}>Your money, understood by AI</Badge>

            <h1
              className={`mx-auto mt-7 max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-8xl ${
                darkMode ? "text-white" : "text-neutral-950"
              }`}
            >
              Stop tracking money.
              <span className="block text-emerald-500">
                Start understanding it.
              </span>
            </h1>

            <p
              className={`mx-auto mt-7 max-w-2xl text-base leading-7 sm:text-lg ${
                darkMode ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Finance-AI turns your expenses, bank statements, budgets, and
              financial questions into actionable insights through a real-time
              AI financial advisor.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={openAuth}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:w-auto"
              >
                Start analyzing your money
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <a
                href="#how-it-works"
                className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-base font-bold shadow-sm transition sm:w-auto ${
                  darkMode
                    ? "border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                See how it works
                <ChevronRight size={18} />
              </a>
            </div>

            <div
              className={`mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm ${
                darkMode ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              <span className="flex items-center gap-2">
                <Check size={15} className="text-emerald-500" />
                No spreadsheets
              </span>

              <span className="flex items-center gap-2">
                <Check size={15} className="text-emerald-500" />
                PDF statement support
              </span>

              <span className="flex items-center gap-2">
                <Check size={15} className="text-emerald-500" />
                Real-time AI
              </span>
            </div>
          </div>

          <DashboardPreview darkMode={darkMode} />
        </section>

        {/* Trust strip */}
        <section
          className={`border-y ${
            darkMode
              ? "border-neutral-800 bg-neutral-900/50"
              : "border-neutral-200 bg-neutral-50/70"
          }`}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 py-7 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
            <p
              className={`text-sm font-semibold ${
                darkMode ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Built for people who want clarity, not complexity.
            </p>

            <div
              className={`flex items-center gap-6 ${
                darkMode ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck size={17} />
                Secure
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Zap size={17} />
                Real-time
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Bot size={17} />
                AI-powered
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className={`px-4 py-24 sm:px-6 lg:px-8 lg:py-32 ${
            darkMode ? "bg-neutral-950" : "bg-white"
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
                  className={`group rounded-3xl border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    darkMode
                      ? "border-neutral-800 bg-neutral-900 hover:border-emerald-500/40 hover:shadow-emerald-950/20"
                      : "border-neutral-200 bg-white hover:border-emerald-200 hover:shadow-emerald-100/50"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 transition group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon size={21} />
                  </div>

                  <h3
                    className={`mt-6 text-xl font-bold ${
                      darkMode ? "text-white" : "text-neutral-950"
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-6 ${
                      darkMode ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="bg-neutral-950 px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  How it works
                </div>

                <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                  Give your AI the raw data.
                  <span className="block text-emerald-400">
                    Get the full picture.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-neutral-400">
                  Stop spending hours categorizing transactions and building
                  spreadsheets. Finance-AI handles the messy work so you can
                  focus on decisions.
                </p>

                <div className="mt-10 space-y-6">
                  {[
                    {
                      number: "01",
                      title: "Import your finances",
                      description:
                        "Paste expenses, upload a CSV, or drop in a PDF bank statement.",
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-xs font-bold text-emerald-400">
                        {step.number}
                      </div>

                      <div>
                        <h3 className="font-bold">{step.title}</h3>

                        <p className="mt-1 text-sm leading-6 text-neutral-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Chat */}
              <div className="relative">
                <div className="absolute -inset-10 rounded-full bg-emerald-600/15 blur-3xl" />

                <div className="relative rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
                      <Bot size={18} />
                    </div>

                    <div>
                      <p className="font-bold">Finance-AI Advisor</p>
                      <p className="text-xs text-neutral-500">
                        Streaming response
                      </p>
                    </div>

                    <div className="ml-auto flex items-center gap-2 text-xs text-green-400">
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      Online
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-emerald-600 p-4 text-sm text-white">
                      Why did my spending increase this month?
                    </div>

                    <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-neutral-800 bg-neutral-950 p-4 text-sm leading-6 text-neutral-300">
                      Your spending increased by <strong>12.4%</strong> compared
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

                    <div className="flex items-center gap-2 px-2 text-xs text-neutral-500">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      Analyzing your latest transactions...
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <input
                      placeholder="Ask about your finances..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
                    />

                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI advisor CTA */}
        <section
          id="ai-advisor"
          className={`px-4 py-24 sm:px-6 lg:px-8 lg:py-32 ${
            darkMode ? "bg-neutral-950" : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-6xl rounded-[2rem] bg-emerald-600 px-6 py-12 text-white sm:px-10 lg:px-16 lg:py-16">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                  <Sparkles size={15} />
                  Your personal financial AI
                </div>

                <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
                  Ask better questions.
                  <span className="block text-emerald-100">
                    Make better decisions.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-emerald-100">
                  "Can I afford a ₹9000 vacation?" "Where am I overspending?"
                  "How much should I save this month?" Your financial data
                  becomes a conversation.
                </p>

                <button
                  onClick={openAuth}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-emerald-700 shadow-xl transition hover:bg-emerald-50"
                >
                  Talk to Finance-AI
                  <ArrowRight size={17} />
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="space-y-3">
                  {[
                    "Analyze my spending this month",
                    "Am I on track for my savings goal?",
                    "Find 3 areas where I can cut costs",
                    "Create a budget for next month",
                  ].map((question) => (
                    <div
                      key={question}
                      className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 text-sm"
                    >
                      <span>{question}</span>
                      <ChevronRight size={17} className="text-emerald-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className={`border-t px-4 py-24 sm:px-6 lg:px-8 ${
            darkMode
              ? "border-neutral-800 bg-neutral-950"
              : "border-neutral-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20">
              <CreditCard size={23} />
            </div>

            <h2
              className={`mt-7 text-4xl font-black tracking-tight sm:text-6xl ${
                darkMode ? "text-white" : "text-neutral-950"
              }`}
            >
              Your money deserves
              <span className="block text-emerald-500">
                an intelligent system.
              </span>
            </h2>

            <p
              className={`mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg ${
                darkMode ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Import your first statement, set your budget, and let Finance-AI
              turn your financial data into decisions.
            </p>

            <button
              onClick={openAuth}
              className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              Get started for free
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer
          className={`border-t ${
            darkMode
              ? "border-neutral-800 bg-neutral-900"
              : "border-neutral-200 bg-neutral-50"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <img src="./favicon.svg" alt="Finance-AI Logo" />
              </div>

              <span
                className={`font-black ${
                  darkMode ? "text-white" : "text-neutral-950"
                }`}
              >
                Finance-AI
              </span>
            </div>

            <p
              className={`text-sm ${
                darkMode ? "text-neutral-500" : "text-neutral-400"
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
