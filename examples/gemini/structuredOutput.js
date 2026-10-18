/**
 * Example demonstrating structured JSON output extraction using the @google/genai SDK.
 * Forces the model to respond according to a predefined JSON schema with temperature 0.0.
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});

export async function extractData(unstructuredText) {
  console.log(`[LLM] Dispatching extraction task...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract the user profile data from this text: ${unstructuredText}`,
      config: {
        temperature: 0.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: {
              type: Type.STRING,
              description: "The person's full name. Null if not found.",
            },
            age: {
              type: Type.INTEGER,
            },
            techStack: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Array of programming languages or frameworks mentioned.",
            },
            isLookingForJob: {
              type: Type.BOOLEAN,
            },
          },
          required: ["fullName", "techStack", "isLookingForJob"],
        },
      },
    });

    console.log(`[LLM] Structured data received.`);
    return JSON.parse(response.text);
  } catch (error) {
    console.error("[LLM CRASH] Extraction failed:", error);
    throw new Error("AI Provider Offline or Parsing Failed");
  }
}
