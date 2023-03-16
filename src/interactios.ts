import { exec, spawn, ChildProcessWithoutNullStreams } from "child_process";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { getInput } from "./utils/index";

let powershellProcess: ChildProcessWithoutNullStreams = null as any;

// Define the interactions that the AI can perform
export const interactions = {
  "files.allFiles": ({ path }) => {
    const files = readdirSync(path);
    return { files };
  },
  "ia.init": () => {
    return "OK";
  },
  "ia.wait": async ({}) => {
    return { "#": { type: "client.resquest", message: await getInput("🟢 You: ") } };
  },
  "client.request": async ({ message }) => {
    console.log(`🟢 ${message}`);
    process.exit();
  },
  "client.response": async ({ message }) => {
    console.log(`🟢 ${message}`);
    process.exit();
  },
  "client.report": ({ message }) => {
    console.log(`AI report: ${message}`);
    return {};
  },
  "files.readFileText": ({ path }) => {
    const data = readFileSync(path, "utf-8");
    const result = {
      data,
      flap: () => (result.data = (result.data || "").slice(0, 16) + "..."),
    };
    return result;
  },
  "files.writeFileText": ({ path, data }) => {
    writeFileSync(path, data);
    return { message: `File ${path} saved` };
  },
  "memory.write": ({ name, data }) => {
    // Save or update text persistently
    writeFileSync(`./memory/${name}.txt`, data);
    return { message: `Note ${name} saved` };
  },
  "memory.read": ({ name }) => {
    // Retrieve existing text
    const data = readFileSync(`./memory/${name}.txt`, "utf-8");
    const result = {
      data,
      flap: () => (result.data = (result.data || "").slice(0, 16) + "..."),
    };
    return result;
  },
  "memory.ls": () => {
    // Retrieve ids of all notes
    const notes = readdirSync("./memory");
    return { notes };
  },
  "command.cmd": ({ command, location }) => {
    // Execute a command in PowerShell and return the result
    return new Promise((resolve, reject) => {
      exec(`cmd.exe  ${command}`, { cwd: location }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ result: stdout.trim() });
      });
    });
  },
  "command.powershell": ({ command, location }) => {
    command = command.replace(/\\/g, "\\\\");
    // location = location?.replace(/\\/g, "\\\\");

    if (!powershellProcess) {
      powershellProcess = spawn(`powershell.exe`, ["-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "-"]);
      if (location) powershellProcess.stdin.write(`cd "${location}"\n`);
    }
    let output = "";

    return new Promise((resolve, reject) => {
      const code = setTimeout(() => {
        if (output) return resolve({ result: output?.trim() || "" });
        reject(new Error("timeout(15s)"));
      }, 10000);

      const code2 = setTimeout(() => {
        if (output === "") return resolve({ result: "" });
      }, 2500);

      powershellProcess.stdout.on("data", (data, data2) => {
        clearTimeout(code2);
        output += data.toString("utf8");
      });

      powershellProcess.stderr.on("data", (data) => {
        clearTimeout(code2);
        reject(new Error(data.toString("utf8")));
      });

      powershellProcess.on("exit", () => {
        clearTimeout(code);
        clearTimeout(code2);
        resolve({ result: output?.trim() || "" });
      });
      powershellProcess.on("close", () => {
        clearTimeout(code);
        clearTimeout(code2);
        resolve({ result: output?.trim() || "" });
      });

      powershellProcess.stdin.write(`${command}\r\n`);
    }).catch((err) => ({ error: err.message }));
  },
};

export const run_interactions = async (interaction) => {
  try {
    interaction = JSON.parse(interaction);
  } catch (error) {
    return { "#": { error: `Format of interations not valid, requered alone valid JSON and you must respect the following format: {"type":"xxx", ...props}` } };
  }

  if (typeof interaction !== "object") return { "#": { error: "Format of interations not valid, requered object." } };

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
