import { Router } from "express";
import { runAgent } from "../agent/agent.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const { reply, toolsCalled } = await runAgent(message);
    res.json({ reply, toolsCalled });
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({ error: "Agent failed to respond" });
  }
});

export default router;
