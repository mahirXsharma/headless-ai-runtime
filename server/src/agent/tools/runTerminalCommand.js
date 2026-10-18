import { exec } from "node:child_process";
import util from "node:util";
import { config, workspaceDir } from "../../config.js";

const execPromise = util.promisify(exec);

export const schema = {
  type: "function",
  function: {
    name: "runTerminalCommand",
    description: "Executes a command in the local Windows terminal (cmd.exe) within the workspace directory.",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The exact Windows shell command to execute",
        },
      },
      required: ["command"],
    },
  },
};

export async function handler({ command }) {
  try {
    const { stdout, stderr } = await execPromise(command, {
      timeout: config.COMMAND_TIMEOUT_MS,
      cwd: workspaceDir,
    });

    const trimmedStdout = stdout.trim();
    if (trimmedStdout) {
      return trimmedStdout;
    }

    const trimmedStderr = stderr.trim();
    if (trimmedStderr) {
      return trimmedStderr;
    }

    return "[OK] Command finished with no output.";
  } catch (error) {
    if (error.killed) {
      const timeoutSec = Math.round(config.COMMAND_TIMEOUT_MS / 1000);
      return `[SYSTEM HALT] Command timed out after ${timeoutSec} seconds. You might have written an infinite loop.`;
    }
    return `[ERROR] ${error.stderr ? error.stderr.trim() : error.message}`;
  }
}
