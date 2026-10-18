import * as runTerminalCommand from "./runTerminalCommand.js";
import * as fetchUrl from "./fetchUrl.js";
import * as writeFile from "./writeFile.js";
import * as readFile from "./readFile.js";
import * as listFiles from "./listFiles.js";

export const toolSchemas = [
  runTerminalCommand.schema,
  fetchUrl.schema,
  writeFile.schema,
  readFile.schema,
  listFiles.schema,
];

export const toolHandlers = {
  [runTerminalCommand.schema.function.name]: runTerminalCommand.handler,
  [fetchUrl.schema.function.name]: fetchUrl.handler,
  [writeFile.schema.function.name]: writeFile.handler,
  [readFile.schema.function.name]: readFile.handler,
  [listFiles.schema.function.name]: listFiles.handler,
};

