import { Ollama } from "ollama";
import { config } from "../config.js";
import { SYSTEM_PROMPT } from "./prompts.js";
import { toolSchemas, toolHandlers } from "./tools/index.js";

export async function runAgent(userPrompt) {
  const ollama = new Ollama({ host: config.OLLAMA_HOST });

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  for (let i = 0; i < config.AGENT_MAX_ITERATIONS; i++) {
    const response = await ollama.chat({
      model: config.OLLAMA_MODEL,
      messages,
      tools: toolSchemas,
      options: {
        temperature: 0.1,
      },
    });

    messages.push(response.message);

    if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
      return response.message.content;
    }

    for (const toolCall of response.message.tool_calls) {
      const func = toolCall.function;
      const name = func.name;
      const args = func.arguments;

      console.log(`[agent] step ${i + 1}: ${name}(${JSON.stringify(args)})`);

      let result;
      const handler = toolHandlers[name];

      if (!handler) {
        result = `[ERROR] Unknown tool '${name}'`;
      } else {
        try {
          result = await handler(args);
        } catch (err) {
          result = `[ERROR] ${err.message}`;
        }
      }

      messages.push({
        role: "tool",
        content: String(result),
        tool_name: name,
      });
    }
  }

  return `[STOPPED] Reached the maximum of ${config.AGENT_MAX_ITERATIONS} steps without finishing.`;
}
