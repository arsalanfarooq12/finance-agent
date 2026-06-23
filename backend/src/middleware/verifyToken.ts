import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

// Separate anon client just for token verification
// (service role client should not be used for user JWT verification)
const supabaseAuth = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY! // add this to Railway env vars too
);

export interface AuthRequest extends Request {
  userId?: string;
}

export async function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.userId = data.user.id;
    next();
  } catch {
    return res.status(401).json({ error: "Token verification failed" });
  }
}
