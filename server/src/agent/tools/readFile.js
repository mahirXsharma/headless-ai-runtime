import fs from "node:fs/promises";
import path from "node:path";
import { workspaceDir } from "../../config.js";

export const schema = {
  type: "function",
  function: {
    name: "readFile",
    description: "Reads the text content of a file located within the workspace directory.",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The relative file path to read (e.g. 'project-name/index.js'). Do not prefix with 'workspace/'.",
        },
      },
      required: ["filePath"],
    },
  },
};

export async function handler({ filePath }) {
  try {
    let cleanPath = filePath.trim().replace(/^[\\\/]+/, "").replace(/^\.[\\\/]/, "");
    if (cleanPath.toLowerCase().startsWith("workspace/") || cleanPath.toLowerCase().startsWith("workspace\\")) {
      cleanPath = cleanPath.slice("workspace/".length);
    }

    const targetPath = path.resolve(workspaceDir, cleanPath);
    const rel = path.relative(workspaceDir, targetPath);

    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      return "[DENIED] Files can only be read from inside the workspace directory.";
    }

    const content = await fs.readFile(targetPath, "utf8");
    if (content.length > 10000) {
      return content.slice(0, 10000) + "\n...[file truncated due to size]";
    }
    return content;
  } catch (error) {
    if (error.code === "ENOENT") {
      return `[ERROR] File not found: ${filePath}`;
    }
    return `[ERROR] Failed to read file: ${error.message}`;
  }
}
