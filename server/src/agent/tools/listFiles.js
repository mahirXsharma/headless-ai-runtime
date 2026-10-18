import fs from "node:fs/promises";
import path from "node:path";
import { workspaceDir } from "../../config.js";

export const schema = {
  type: "function",
  function: {
    name: "listFiles",
    description: "Lists all files and subdirectories located inside a directory within the workspace. If directoryPath is omitted or empty, lists the root workspace.",
    parameters: {
      type: "object",
      properties: {
        directoryPath: {
          type: "string",
          description: "The directory path to list (e.g. '.' or 'project-name'). Defaults to workspace root.",
        },
      },
      required: [],
    },
  },
};

export async function handler({ directoryPath = "." } = {}) {
  try {
    let cleanPath = (directoryPath || ".").trim().replace(/^[\\\/]+/, "").replace(/^\.[\\\/]/, "");
    if (cleanPath.toLowerCase().startsWith("workspace/") || cleanPath.toLowerCase().startsWith("workspace\\")) {
      cleanPath = cleanPath.slice("workspace/".length);
    }
    if (!cleanPath) {
      cleanPath = ".";
    }

    const targetPath = path.resolve(workspaceDir, cleanPath);
    const rel = path.relative(workspaceDir, targetPath);

    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      return "[DENIED] Cannot list directories outside the workspace directory.";
    }

    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    if (entries.length === 0) {
      return `[EMPTY] Directory '${cleanPath}' is empty.`;
    }

    const items = entries.map((entry) => {
      const type = entry.isDirectory() ? "[DIR]" : "[FILE]";
      return `${type} ${entry.name}`;
    });

    return items.join("\n");
  } catch (error) {
    if (error.code === "ENOENT") {
      return `[ERROR] Directory not found: ${directoryPath}`;
    }
    return `[ERROR] Failed to list directory: ${error.message}`;
  }
}
