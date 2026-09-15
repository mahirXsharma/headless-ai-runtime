import { exec } from "node:child_process";
import util from "util";
import ollama from "ollama";
import fs from "fs";
import path from "node:path";

const execPromise = util.promisify(exec);

export default async function llmFunction(userPrompt) {
  const convoHistory = [
    {
      role: "system",
      content: `You are an autonomous execution agent running on a Windows machine. You must use the provided tools to complete tasks. 
        NEVER write scripts (like Python or bash) for the user to copy and paste. 
        If you need to create files or directories, you MUST use the 'runTerminalCommand' tool to execute the native Windows commands (like 'mkdir' or 'echo') directly. 
        Do not output plain text until the entire objective is 100% complete.`,
    },
    {
      role: "system",
      content:
        "You are a silent, headless execution agent. Never explain your steps. Do not output plain text until the entire user objective is 100% complete. If you encounter an error, silently try a different command.",
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  let isWorking = true;

  while (isWorking) {
    console.log("loop running...");

    const response = await ollama.chat({
      model: "llama3.1",
      messages: convoHistory,
      tools: [bashTool, fetchWebTool, writeFileTool],
      options: {
        temperature: 0.1,
      },
    });

    if (response.message.tool_calls && response.message.tool_calls.length > 0) {
      const toolCall = response.message.tool_calls[0].function;
      ``;
      const toolName = toolCall.name;
      const toolArgs = toolCall.arguments;

      console.log(`[AGENT TOOL REQUEST]: ${toolName}`);
      let toolResult = "";

      try {
        switch (toolName) {
          case "runTerminalCommand":
            toolResult = await execBash(toolArgs.command);
            break;
          case "fetchTool":
            toolResult = await fetchWeb(toolArgs.url);
            break;
          case "writeLocalFile":
            toolResult = await writeLocalFile(
              toolArgs.filePath,
              toolArgs.content,
            );
          default:
            console.log("TOOL RESULT:", toolResult);
            toolResult = `[CRITICAL EXECUTION ERROR] Tool '${toolName}' not found.`;
        }
      } catch (criticalErr) {
        toolResult = `[CRITICAL EXECUTION ERROR] ${criticalErr.message}`;
      }
      convoHistory.push(response.message);

      convoHistory.push({
        role: "tool",
        content: toolResult,
        name: toolName,
      });
    } else {
      isWorking = false;
      return response.message.content;
    }
  }
}

async function writeLocalFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, "utf8");
    return `[SUCCESS] File written to ${filePath}`;
  } catch (error) {
    return error.message;
  }
}

const writeFileTool = {
  type: "function",
  function: {
    name: "writeLocalFile",
    description:
      "Writes content cleanly to a specific file path. Use this instead of terminal echo commands for writing structured files like JSON or source code.",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description:
            "The Exact File path in which we are going to write the content",
        },
        content: {
          type: "string",
          description: "The content which we have to write inside the file",
        },
      },
      required: ["filePath", "content"],
    },
  },
};

async function execBash(cmd) {
  try {
    const { stdout, stderr } = await execPromise(cmd, { timeout: 10000 });
    return stdout.trim();
  } catch (error) {
    if (error.killed) {
      return `[SYSTEM HALT] Command timed out after 10 seconds. You might have written an infinite loop.`;
    }
    return `[ERROR] ${error.stderr || error.message}`;
  }
}
// schema object 1
const bashTool = {
  type: "function",
  function: {
    name: "runTerminalCommand",
    description: "Executes a bash command in the local terminal.",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The exact bash command to execute",
        },
      },
      required: ["command"],
    },
  },
};

async function fetchWeb(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    return `[NETWORK ERROR] Failed to fetch URL: ${error.message}`;
  }
}
// schema object 2

const fetchWebTool = {
  type: "function",
  function: {
    name: "fetchTool",
    description: "Fetch the Required data from the link.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The url from which he have to fetch data",
        },
      },
      required: ["url"],
    },
  },
};
// -> gemini e
// const fetchWebTool = {
//   functionDeclarations: [
//     {
//       name: "fetchTool",
//       description: " Fetch the Required data from the link.",
//       parameters: {
//         type: Type.OBJECT,
//         properties: {
//           url: {
//             type: Type.STRING,
//             description: "The url from which he have to fetch data",
//           },
//         },
//         required: ["url"],
//       },
//     },
//   ],
// };
