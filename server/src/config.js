import "dotenv/config";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export const config = Object.freeze({
  PORT: Number(process.env.PORT) || 3000,
  OLLAMA_HOST: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.1",
  AGENT_MAX_ITERATIONS: Number(process.env.AGENT_MAX_ITERATIONS) || 10,
  COMMAND_TIMEOUT_MS: Number(process.env.COMMAND_TIMEOUT_MS) || 10000,
});

export const workspaceDir = fileURLToPath(new URL("../workspace", import.meta.url));

fs.mkdirSync(workspaceDir, { recursive: true });
