import fs from "node:fs/promises";
import path from "node:path";
import { workspaceDir } from "../../config.js";

export const schema = {
  type: "function",
  function: {
    name: "writeFile",
    description: "Writes content to a file path relative to the workspace directory. Automatically creates parent directories.",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The file path relative to the workspace directory",
        },
        content: {
          type: "string",
          description: "The content to write into the file",
        },
      },
      required: ["filePath", "content"],
    },
  },
};

export async function handler({ filePath, content }) {
  try {
    const targetPath = path.resolve(workspaceDir, filePath);
    const rel = path.relative(workspaceDir, targetPath);

    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      return "[DENIED] Files can only be written inside the workspace directory.";
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, content, "utf8");
    return `[SUCCESS] File written to ${filePath}`;
  } catch (error) {
    return `[ERROR] Failed to write file: ${error.message}`;
  }
}
