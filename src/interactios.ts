import { exec, spawn, ChildProcessWithoutNullStreams } from "child_process";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { getInput } from "./utils/index";
import { cmd, powershell } from "./utils/execute";

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
    return { type: "user.resquest", message: await getInput("🟢 You: ") };
  },
  "user.resquest": async ({ message }) => {
    console.log(`🟢 ${message}`);
    process.exit();
  },
  "user.response": async ({ message }) => {
    console.log(`🟢 ${message}`);
    process.exit();
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
};

export const run_interactions = async (interaction) => {
  try {
    interaction = JSON.parse(interaction);
  } catch (error) {
    return { error: `Format of interations not valid, requered alone valid JSON and you must respect the following format: {"type":"xxx", ...props}` };
  }

  if (typeof interaction !== "object") return { error: "Format of interations not valid, requered object." };

  const result = (
    await Promise.all(
      Object.entries({ interaction }).map(async ([key, value]) => {
        if (typeof value !== "object") return [key, { error: `Invalid interaction, you must respect the following format: {"type":"xxx", ...props}` }];

        const { type, ...properties } = interaction;

        if (!interactions[type]) return [key, { error: `Interaction type "${type}" not supported, you must respect the following format: {"type":"xxx", ...props}` }];

        try {
          return [key, await interactions[type](properties)];
        } catch (error: any) {
          return [key, error.message];
        }
      })
    )
  ).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});

  //   console.log(result);
  return result["interaction"];
};
