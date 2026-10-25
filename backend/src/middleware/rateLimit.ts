// backend/src/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";
import { type Request, type Response, type NextFunction } from "express";
import { type AuthRequest } from "./verifyToken.js";
import { supabase } from "../lib/supabase.js";

const DAILY_CHAT_LIMIT = Number(process.env.DAILY_CHAT_LIMIT ?? 10);

const humanize = (s: number) => (s < 60 ? `${s}s` : `${Math.ceil(s / 60)} min`);

function secondsLeft(req: Request, windowMs: number) {
  const reset: Date | undefined = (req as any).rateLimit?.resetTime;
  return reset
    ? Math.max(1, Math.ceil((reset.getTime() - Date.now()) / 1000))
    : Math.ceil(windowMs / 1000);
}

function makeLimiter(opts: {
  windowMs: number;
  limit: number;
  message: string;
  perUser?: boolean;
  skip?: (req: Request) => boolean;
}) {
  return rateLimit({
    windowMs: opts.windowMs,
    limit: opts.limit,
    standardHeaders: true,
    legacyHeaders: false,
    ...(opts.skip ? { skip: opts.skip } : {}),
    ...(opts.perUser
      ? {
          keyGenerator: (req: Request) =>
            (req as AuthRequest).userId ?? "unknown",
        }
      : {}),
    handler: (req, res) => {
      const s = secondsLeft(req, opts.windowMs);
      res.status(429).json({
        error: `${opts.message} Try again in ${humanize(s)}.`,
        retryAfter: s,
      });
    },
  });
}

// Per IP, before auth. Health checks are exempt.
export const ipLimiter = makeLimiter({
  windowMs: 15 * 60_000,
  limit: 300,
  message: "Too many requests.",
  skip: (req) => req.originalUrl.startsWith("/api/health"),
});

// Per user. Skips the LLM routes, which have their own stricter limiters.
// /chat/resume and /chat/history stay under this one, so a confirm click is never blocked by chat limits.
export const apiLimiter = makeLimiter({
  windowMs: 60_000,
  limit: 120,
  message: "Too many requests.",
  perUser: true,
  skip: (req) =>
    /^\/api\/(chat(\/stream)?|upload)\/?$/.test(
      req.originalUrl.split("?")[0] ?? ""
    ),
});

export const chatLimiter = makeLimiter({
  windowMs: 60_000,
  limit: 8,
  message: "You're sending messages too fast.",
  perUser: true,
});

export const uploadLimiter = makeLimiter({
  windowMs: 60 * 60_000,
  limit: 5,
  message: "Upload limit reached.",
  perUser: true,
});

// Daily LLM budget, backed by Postgres. Fails open if the DB check errors.
export async function dailyChatLimit(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { data, error } = await supabase.rpc("consume_chat_quota", {
      p_user_id: req.userId,
      p_limit: DAILY_CHAT_LIMIT,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.allowed === false) {
      return res.status(429).json({
        error: `Daily limit of ${DAILY_CHAT_LIMIT} messages reached. It resets at midnight IST.`,
      });
    }
  } catch (e) {
    console.error("[usage] quota check failed, allowing request", e);
  }
  next();
}
