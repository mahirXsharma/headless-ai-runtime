import * as runTerminalCommand from "./runTerminalCommand.js";
import * as fetchUrl from "./fetchUrl.js";
import * as writeFile from "./writeFile.js";

export const toolSchemas = [
  runTerminalCommand.schema,
  fetchUrl.schema,
  writeFile.schema,
];

export const toolHandlers = {
  [runTerminalCommand.schema.function.name]: runTerminalCommand.handler,
  [fetchUrl.schema.function.name]: fetchUrl.handler,
  [writeFile.schema.function.name]: writeFile.handler,
};
