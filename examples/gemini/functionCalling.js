/**
 * Example demonstrating Gemini function calling using the @google/genai SDK.
 * Dispatches a prompt, intercepts function calls, executes backend tools, and returns the final answer.
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});

// 1. Tool execution logic (e.g. backend server health check)
function checkServerHealth(serverName) {
  console.log(
    `[BACKEND] Executing local function: checkServerHealth('${serverName}')`,
  );
  if (serverName.toLowerCase() === "mongodb") {
    return { status: "CRITICAL_FAILURE", uptime: "0 hours" };
  }
  return { status: "HEALTHY", uptime: "120 hours" };
}

// 2. Tool schema definition
const serverHealthTool = {
  functionDeclarations: [
    {
      name: "checkServerHealth",
      description:
        "Checks the current health status of a specific backend server or database.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          serverName: {
            type: Type.STRING,
            description:
              'The name of the server, e.g., "MongoDB", "Express", "React"',
          },
        },
        required: ["serverName"],
      },
    },
  ],
};

// 3. Agent execution loop
export async function agenticChat(userPrompt) {
  console.log(`[LLM] Dispatching prompt to Gemini...`);

  try {
    // First Call: Ask the LLM what it wants to do
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        tools: [serverHealthTool],
        temperature: 0.1,
      },
    });

    // 4. Intercept function call and provide response
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];

      console.log(`[LLM REQUESTED TOOL] ${call.name} with args:`, call.args);

      let backendResult;
      if (call.name === "checkServerHealth") {
        backendResult = checkServerHealth(call.args.serverName);
      }

      console.log(`[BACKEND] Returning result to LLM...`, backendResult);

      const finalResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: userPrompt }] },
          { role: "model", parts: [{ functionCall: call }] },
          {
            role: "user",
            parts: [
              {
                functionResponse: { name: call.name, response: backendResult },
              },
            ],
          },
        ],
      });

      return finalResponse.text;
    }

    return response.text;
  } catch (error) {
    console.error("[LLM CRASH]", error);
    throw new Error("Agent execution failed");
  }
}
