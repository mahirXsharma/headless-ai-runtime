import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});

// 1. THIS IS YOUR ACTUAL BACKEND LOGIC (The "Tool")
// In a real app, this would query your actual MongoDB or an external API.
function checkServerHealth(serverName) {
  console.log(
    `[BACKEND] Executing local function: checkServerHealth('${serverName}')`,
  );
  if (serverName.toLowerCase() === "mongodb") {
    return { status: "CRITICAL_FAILURE", uptime: "0 hours" };
  }
  return { status: "HEALTHY", uptime: "120 hours" };
}

// 2. WE DEFINE THE TOOL SCHEMA TO TEACH THE LLM HOW TO USE IT
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

// 3. THE AGENT LOOP
export async function agenticChat(userPrompt) {
  console.log(`[LLM] Dispatching prompt to Gemini...`);

  try {
    // First Call: Ask the LLM what it wants to do
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        tools: [serverHealthTool], // We inject the tool here
        temperature: 0.1,
      },
    });

    // 4. INTERCEPTING THE FUNCTION CALL
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0]; // Get the first tool the LLM wants to use

      console.log(`[LLM REQUESTED TOOL] ${call.name} with args:`, call.args);

      // Execute our actual local JS logic based on what the LLM asked for
      let backendResult;
      if (call.name === "checkServerHealth") {
        backendResult = checkServerHealth(call.args.serverName);
      }

      console.log(`[BACKEND] Returning result to LLM...`, backendResult);

      // Second Call: Give the data back to the LLM so it can formulate a final answer
      // Note: We have to send the history so it remembers the conversation
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

    // If the LLM didn't need a tool (e.g., user just said "hi"), it returns normal text
    return response.text;
  } catch (error) {
    console.error("[LLM CRASH]", error);
    throw new Error("Agent execution failed");
  }
}
