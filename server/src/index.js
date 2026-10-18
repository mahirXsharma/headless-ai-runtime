import express from "express";
import { config } from "./config.js";
import { runAgent } from "./agent/agent.js";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", model: config.OLLAMA_MODEL });
});

app.post("/api/agent", async (req, res) => {
  const { message } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const reply = await runAgent(message.trim());
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("[server] agent execution error:", error);
    return res.status(500).json({ error: "Agent failed", details: error.message });
  }
});

app.listen(config.PORT, () => {
  console.log(`Server listening on http://localhost:${config.PORT}`);
});
