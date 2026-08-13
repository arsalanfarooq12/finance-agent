import { Router } from "express";
import { type AuthRequest } from "../middleware/verifyToken.js";
import { runAgent, streamAgent } from "../agent/orchestrator.js";

const router = Router();

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

// Streaming endpoint — Server-Sent Events
router.post("/stream", async (req: AuthRequest, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    await streamAgent(message, req.userId!, (chunk, type) => {
      // Send each chunk as an SSE event
      res.write(`data: ${JSON.stringify({ chunk, type })}\n\n`);
    });
  } catch (error: any) {
    res.write(
      `data: ${JSON.stringify({
        chunk: "Something went wrong.",
        type: "error",
      })}\n\n`
    );
  } finally {
    res.end();
  }
});

export default router;
