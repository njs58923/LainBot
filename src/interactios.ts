import { exec, spawn, ChildProcessWithoutNullStreams } from "child_process";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { extractObjects, getInput, truncateText } from "./utils/index";
import { cmd, powershell, runScript } from "./utils/execute";
import axios from "axios";

export type InteractionRaw = string;
export type Interaction = { type: string } & Record<string, unknown>;

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

export const CreateResquest = (message: string) => {
  return { type: "user.request", message };
};

export const TryRunInteraction = async (raw: Interaction | InteractionRaw) => {
  try {
    var interaction: Interaction[] = [];
    if (typeof raw !== "string") interaction = [raw];
    else {
      try {
        interaction = extractObjects(raw as any) as Interaction[];
      } catch (error) {
        throw error;
      }
    }
  } catch (error) {
    return {
      error: `The response is not a valid JSON`,
    };
  }

  if (typeof interaction !== "object")
    return { error: "Format of interations not valid, requered object." };

  const result = (
    await Promise.all(
      interaction.map(async (value, key) => {
        if (typeof value !== "object")
          return [
            key,
            {
              error: `Invalid interaction, you must respect the following format: {"type":"xxx", ...props}`,
            },
          ];

        const { type, ...properties } = value;

        if (!interactions[type])
          return [
            key,
            {
              error: `Interaction type "${type}" not supported, you must respect the following format: {"type":"xxx", ...props}`,
            },
          ];

        try {
          return [key, await interactions[type](properties)];
        } catch (error: any) {
          return [key, error.message];
        }
      })
    )
  ).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});

  //   console.log(result);
  return Object.keys(result).length === 1
    ? result[Object.keys(result)[0]]
    : result;
};

export const TryRepairInteraction = (raw: string) => {
  raw = raw.trim();
  raw = raw.replace(/"|"/g, '"');
  const regex = raw.match(/\`\`\`([^]*)\`\`\`/);
  if (regex) raw = regex[1].replace(/\\/g, "\\\\");
  return raw;
};
