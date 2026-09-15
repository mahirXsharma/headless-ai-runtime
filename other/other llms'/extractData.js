import { GoogleGenAI, Type } from "@google/genai"; // Note the new 'Type' import

const ai = new GoogleGenAI({});

export async function extractData(unstructuredText) {
  console.log(`[LLM] Dispatching extraction task...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract the user profile data from this text: ${unstructuredText}`,
      config: {
        temperature: 0.0, // Absolute zero. No creativity allowed.
        responseMimeType: "application/json", // Force JSON output
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
    // The SDK returns a stringified JSON. We parse it back into a real JS object.
    return JSON.parse(response.text);
  } catch (error) {
    console.error("[LLM CRASH] Extraction failed:", error);
    throw new Error("AI Provider Offline or Parsing Failed");
  }
}
