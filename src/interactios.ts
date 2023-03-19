import { exec, spawn, ChildProcessWithoutNullStreams } from "child_process";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { extractObjects, getInput, truncateText } from "./utils/index";
import { cmd, powershell, runScript } from "./utils/execute";
import axios from "axios";
import { JsonDecoder } from "./resources/decoders/json";
import { YarmDecoder } from "./resources/decoders/yarm";

export type InteractionRaw = string;
export type Inter = { type: string } & Record<string, unknown>;
export type InterRes = Record<string, unknown>;

export const Decoder = new YarmDecoder();

export const ForceStop = Decoder.buildRaw("user.response", { message: "END" });

// Define the interactions that the AI can perform
export const interactions = {
  "files.list": ({ path }) => {
    try {
      const files = readdirSync(path);
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
    console.log(`🔴 Solo usuarios pueden usar esto (${message})`);
    return {};
  },
  "user.response": async ({ message }) => {
    console.log(`🟦 ${message}`);
    return { type: "user.request", message: await getInput("🟢 You: ") };
  },
  "user.report": ({ message }) => {
    console.log(`AI report: ${message}`);
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
    // Save or update text persistently
    writeFileSync(`./memory/${name}.txt`, data);
    return { message: `Note ${name} saved` };
  },
  "memory.load": ({ name }) => {
    // Retrieve existing text
    const data = readFileSync(`./memory/${name}.txt`, "utf-8");
    const result = {
      data,
      flap: () => (result.data = (result.data || "").slice(0, 16) + "..."),
    };
    return result;
  },
  "memory.list": () => {
    // Retrieve ids of all notes
    const notes = readdirSync("./memory");
    return { notes };
  },
  "command.execute": ({ command, location, shell }) => {
    if (shell === "PowerShell") return powershell({ command, location });
    if (shell === "CMD") return cmd({ command, location });
    return { error: `The value ${shell} in shell not is valid.` };
  },
  "ia.httpGet": async ({ url, headers, params }) => {
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
  "ia.httpPost": async ({ url, headers, data }) => {
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
    return new Promise((resolve, reject) => {
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

export const TryInteraction = (type: string, props: object) => {
  if (!interactions[type])
    throw new Error(`Interaction type "${type}" not supported.`);
  return interactions[type](props);
};
