import { Router } from "express";
import { type AuthRequest } from "../middleware/verifyToken.js";
import { runAgent, streamAgent, resumeAgent } from "../agent/orchestrator.js";
import { getRecentConversations } from "../db/database.js";

const router = Router();

function openSSE(res: any) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}

const send = (res: any) => (chunk: any, type: string) =>
  res.write(`data: ${JSON.stringify({ chunk, type })}\n\n`);

// Non-streaming endpoint (kept for compatibility)
router.post("/", async (req: AuthRequest, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    const { reply, agentUsed } = await runAgent(message, req.userId!);
    res.json({ reply, agentUsed, toolsCalled: [agentUsed] });
  } catch (error: any) {
    console.error("Agent error:", error);
    res.status(500).json({ error: "Agent failed to respond" });
  }
});

// Streaming endpoint (SSE)
router.post("/stream", async (req: AuthRequest, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  openSSE(res);
  try {
    await streamAgent(message, req.userId!, send(res));
  } catch (error: any) {
    console.error("Stream error:", error);
    send(res)("Something went wrong.", "error");
  } finally {
    send(res)("", "done");
    res.end();
  }
});

// Resume a paused (interrupted) run
router.post("/resume", async (req: AuthRequest, res) => {
  const { threadId, approved } = req.body;
  if (typeof threadId !== "string" || typeof approved !== "boolean") {
    return res
      .status(400)
      .json({ error: "threadId and approved are required" });
  }

  openSSE(res);
  try {
    await resumeAgent(threadId, req.userId!, approved, send(res));
  } catch (error: any) {
    console.error("Resume error:", error);
    send(res)(error?.message ?? "Something went wrong.", "error");
  } finally {
    send(res)("", "done");
    res.end();
  }
});

// Past messages for the chat UI
router.get("/history", async (req: AuthRequest, res) => {
  try {
    const rows = await getRecentConversations(req.userId!);
    res.json(
      rows.map((r: any) => ({
        role: r.role === "user" ? "user" : "assistant", // DB stores "model"; UI uses "assistant"
        content: r.content,
        createdAt: r.created_at ?? null,
      }))
    );
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ error: "Failed to load history" });
  }
});
export default router;
