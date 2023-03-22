import { exec, spawn, ChildProcessWithoutNullStreams } from "child_process";
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import {
  extractObjects,
  getInput,
  LogColor,
  truncateText,
} from "./utils/index";
import { cmd, powershell, runScript } from "./utils/execute";
import axios from "axios";
import { JsonDecoder } from "./resources/decoders/json";
import { YamlDecoder } from "./resources/decoders/yaml";
import { basename } from "path";

export type InteractionRaw = string;
export type Inter = { type: string } & Record<string, unknown>;
export type InterRes = Record<string, unknown>;

export const Decoder = new YamlDecoder();

export const ForceStop = Decoder.buildRaw("user.response", { message: "END" });

// Define the interactions that the AI can perform
export const interactions: Record<
  string,
  (prop: any) => InterRes | Promise<InterRes>
> = {
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
  "ia.wait": async ({}) => {
    return { type: "user.request", message: await getInput("🟢 You: ") };
  },
  "user.request": async ({ message }) => {
    console.log("");
    LogColor(91, `Solo usuarios pueden usar esto (${message})`);
    return {};
  },
  "user.response": async ({ message }) => {
    console.log("");
    LogColor(92, message);
    return { type: "user.request", message: await getInput("🟢 You: ") };
  },
  "user.failed": async ({ message }) => {
    console.log("");
    LogColor(91, message);
    return { type: "user.request", message: await getInput("🟢 You: ") };
  },
  "user.report": ({ message }) => {
    console.log("");
    LogColor(96, message);
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
  "memory.save": ({ name, data }) => {
    writeFileSync(
      `./memory/${name}.txt`,
      typeof data === "string" ? data : JSON.stringify(data)
    );
    return { message: `Memory '${name}' saved` };
  },
  "memory.load": ({ name }) => {
    try {
      var data = readFileSync(`./memory/${name}.txt`, "utf-8");
    } catch (error) {
      return { message: `Memory '${name}' does not exist` };
    }
    const result = {
      data,
      flap: () => (result.data = (result.data || "").slice(0, 16) + "..."),
    };
    return result;
  },
  "memory.delete": ({ name }) => {
    try {
      unlinkSync(`./memory/${name}.txt`);
    } catch (error) {
      return { message: `Memory '${name}' does not exist` };
    }
    return { message: `Memory '${name}' deleted` };
  },
  "memory.list": () => {
    // Retrieve ids of all notes
    const notes = readdirSync("./memory");
    const obj = {};
    notes.map((path) => {
      const data = readFileSync(`./memory/${path}`, "utf-8");
      obj[basename(path, ".txt")] = {
        preview: truncateText(data, 32),
        size: data.length,
      };
    });
    return obj;
  },
  "memory.preview": () => {
    // Retrieve ids of all notes
    const notes = readdirSync("./memory");
    const obj = {};
    notes
      .slice(0, 10)
      .map(
        (path) =>
          (obj[basename(path, ".txt")] = truncateText(
            readFileSync(`./memory/${path}`, "utf-8"),
            64
          ))
      );
    return obj;
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
    return new Promise<InterRes>((resolve, reject) => {
      runScript(lang, script, (error, result) => {
        if (error) {
          resolve({ error: error.message });
        } else {
          resolve({ result });
        }
      });
    });
  },
};

export const getInteractionsNames = () => {
  return Object.keys(interactions);
};

export const TryInteraction = (
  type: string,
  props: object
): InterRes | Promise<InterRes> => {
  if (!interactions[type])
    throw new Error(`Interaction type "${type}" not supported.`);
  return interactions[type](props);
};
