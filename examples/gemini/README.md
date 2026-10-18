# Gemini SDK Examples

This folder contains standalone learning experiments demonstrating the `@google/genai` SDK:

- **`functionCalling.js`**: Demonstrates tool use and function declarations where Gemini decides to invoke a backend function (`checkServerHealth`), gets the result, and synthesizes a final response.
- **`structuredOutput.js`**: Demonstrates strict JSON output adhering to a schema using `responseSchema` with temperature 0.0.

> **Note:** These examples are standalone reference implementations and are **not** imported or used by the main application (which runs locally via Ollama).

## How to Run

1. Install the Google Gen AI SDK:
   ```bash
   npm install @google/genai
   ```

2. Set your Gemini API key in your environment:
   ```powershell
   $env:GEMINI_API_KEY="your-api-key-here"
   ```

3. Call the exported function from a script, for example:
   ```javascript
   import { agenticChat } from "./functionCalling.js";

   const result = await agenticChat("Can you check if MongoDB is running healthy?");
   console.log(result);
   ```
