import { readdirSync, readFileSync, writeFileSync } from "fs";
import { inputMessage, logMessage, truncateText } from "../utils/index";
import { cmd, powershell, runScript } from "../utils/execute";
import axios from "axios";
// import { JsonDecoder } from "../resources/decoders/json";
import { MemoryJson } from "../utils/memory";
import { Roles } from "../resources/utils/Roles";
import { JsonDecoder } from "../resources/decoders/json";

export type InteractionRaw = string;
export type Inter = { type: string } & Record<string, unknown>;
export type InterRes = Record<string, unknown>;

export const Decoder = new JsonDecoder();

export const ForceStop = Decoder.buildRaw("user.response", { message: "END" });

export const Memory = new MemoryJson("base");

// Define the interactions that the AI can perform
export const Interactions = ({
  noInput,
  roles,
}: {
  roles: Roles;
  noInput: boolean;
}): Record<string, (prop: any) => InterRes | Promise<InterRes>> => ({
  "files.list": ({ path }) => {
    try {
      const files = readdirSync(path, { withFileTypes: true }).map((i) => ({
        name: i.name,
        type: i.isFile() ? "file" : "folder",
      }));

      return { files };
    } catch (error: any) {
      return { error: error.message };
    }
  },
  "ia.init": () => {
    return { status: "OK" };
  },
  "ia.wait": async ({ }) => {
    await new Promise((c) => setTimeout(c, 100));
    return {
      type: "user.request",
      message: noInput ? "" : await inputMessage({ role: "You" }),
    };
  },
  "user.request": async ({ message }) => {
    app.logs.print("");
    logMessage({ role: roles.v.ai, content: message, color: 92 });
    await new Promise((c) => setTimeout(c, 100));
    return {
      type: "user.request",
      message: noInput ? "" : await inputMessage({ role: "You" }),
    };
  },
  "user.response": async ({ message }) => {
    app.logs.print("");
    logMessage({ role: roles.v.ai, content: message, color: 92 });
    await new Promise((c) => setTimeout(c, 100));
    return {
      type: "user.request",
      message: noInput ? "" : await inputMessage({ role: "You" }),
    };
  },
  "user.failed": async ({ message }) => {
    app.logs.print("");
    logMessage({ role: roles.v.ai, content: message, color: 91 });
    await new Promise((c) => setTimeout(c, 100));
    return {
      type: "user.request",
      message: noInput ? "" : await inputMessage({ role: "You" }),
    };
  },
  "user.report": ({ message }) => {
    app.logs.print("");
    logMessage({ role: roles.v.ai, content: message, color: 96 });
    return {};
  },
  "browser.open": ({ url }) => {
    var start =
      process.platform == "darwin"
        ? "open"
        : process.platform == "win32"
          ? "start"
          : "xdg-open";
    require("child_process").exec(start + " " + url);
    return {};
  },
  "files.readText": ({ path }) => {
    try {
      const data = readFileSync(path, "utf-8");
      const result = {
        data,
        flap: () => (result.data = (result.data || "").slice(0, 16) + "..."),
      };
      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  },
  "files.writeText": ({ path, data }) => {
    try {
      writeFileSync(path, data);
      return { message: `File ${path} saved` };
    } catch (error: any) {
      return { error: error.message };
    }
  },
  "memory.create": ({ name, description }) => {
    if (!Memory.isExist(name))
      return { message: `Memory '${name}' does not exist` };
    Memory.create(name, description);
    return { message: `Memory '${name}' created` };
  },
  "memory.save": ({ name, data }) => {
    if (!Memory.isExist(name))
      return { message: `Memory '${name}' does not exist` };
    Memory.update(name, data);
    return { message: `Memory '${name}' saved` };
  },
  "memory.load": ({ name }) => {
    if (!Memory.isExist(name))
      return { message: `Memory '${name}' does not exist` };
    return Memory.load(name);
  },
  "memory.delete": ({ name }) => {
    if (!Memory.isExist(name))
      return { message: `Memory '${name}' does not exist` };
    Memory.delete(name);
    return { message: `Memory '${name}' deleted` };
  },
  "memory.list": () => {
    return Memory.list();
  },
  "memory.preview": () => {
    return Memory.preview();
  },
  "command.execute": ({ command, location, shell }) => {
    if (shell === "PowerShell") return powershell({ command, location });
    if (shell === "CMD") return cmd({ command, location });
    if (!shell) return { error: `The value shell is requered.` };
    return { error: `The value '${shell}' in shell not is valid.` };
  },
  "net.httpGet": async ({ url, headers, params }) => {
    try {
      const response = await axios.get<string>(url, {
        headers,
        params,
        transformResponse: (x) => x,
      });
      return { response: truncateText(response.data, 1024) };
    } catch (error: any) {
      return { error: error.message };
    }
  },
  "net.httpPost": async ({ url, headers, data }) => {
    try {
      const response = await axios.post(url, data, {
        headers,
        transformResponse: (x) => x,
      });
      return { response: truncateText(response.data, 1024) };
    } catch (error: any) {
      return { error: error.message };
    }
  },
  eval: async ({ lang, script }) => {
    return new Promise<InterRes>((resolve) => {
      runScript(lang, script, (error, result) => {
        if (error) {
          resolve({ error: error.message });
        } else {
          resolve({ result });
        }
      });
    });
  },
});

export const getInteractionsNames = () => {
  return Object.keys(
    Interactions({
      roles: new Roles({ ai: "A", context: "B", system: "C" }),
      noInput: false,
    })
  );
};

export const TryInteraction = (
  type: string,
  props: object,
  { roles, noInput }: { roles: Roles; noInput: boolean }
): InterRes | Promise<InterRes> => {
  const ins = Interactions({ roles, noInput });
  if (!ins[type]) throw new Error(`Interaction type "${type}" not supported.`);
  return ins[type](props);
};
