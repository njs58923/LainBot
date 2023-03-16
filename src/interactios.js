const { exec } = require("child_process");
const fs = require("fs");

// Define the interactions that the AI can perform
const interactions = {
  "files.allFiles": ({ path }) => {
    const files = fs.readdirSync(path);
    return { files };
  },
  "ia.init": () => {
    return "OK";
  },
  "ia.wait": () => {
    return undefined;
  },
  "client.request": ({ message }) => {
    // End the interaction and send a brief final report
    console.log(`AI response: ${message}`);
    process.exit();
  },
  "client.response": ({ message }) => {
    // End the interaction and send a brief final report
    console.log(`AI response: ${message}`);
    process.exit();
  },
  "client.report": ({ message }) => {
    // Send a brief report to the user about what is happening
    console.log(`AI report: ${message}`);
  },
  "files.readFileText": ({ path }) => {
    const data = fs.readFileSync(path, "utf-8");
    return { data };
  },
  "files.writeFileText": ({ path, data }) => {
    fs.writeFileSync(path, data);
    return { message: `File ${path} saved` };
  },
  "memory.write": ({ name, data }) => {
    // Save or update text persistently
    fs.writeFileSync(`./memory/${name}.txt`, data);
    return { message: `Note ${name} saved` };
  },
  "memory.read": ({ name }) => {
    // Retrieve existing text
    const data = fs.readFileSync(`./memory/${name}.txt`, "utf-8");
    return { data };
  },
  "memory.ls": () => {
    // Retrieve ids of all notes
    const notes = fs.readdirSync("./memory");
    return { notes };
  },
  "command.cmd": ({ command }) => {
    // Execute a command in PowerShell and return the result
    return new Promise((resolve, reject) => {
      exec(`cmd.exe  ${command}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ result: stdout.trim() });
      });
    });
  },
  "command.powershell": ({ command }) => {
    // Execute a command in PowerShell and return the result
    return new Promise((resolve, reject) => {
      exec(`powershell.exe  ${command}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ result: stdout.trim() });
      });
    });
  },
};

exports.interactions = interactions;

exports.run_interactions = async (interaction) => {
  try {
    interaction = JSON.parse(interaction);
  } catch (error) {
    return { "#": { error: `Format of interations not valid, requered alone valid JSON and you must respect the following format: { "xxx": {"type":"xxx", ...props} }` } };
  }

  if (typeof interaction !== "object") return { "#": { error: "Format of interations not valid, requered object." } };

  const result = (
    await Promise.all(
      Object.entries(interaction).map(async ([key, value]) => {
        if (typeof value !== "object") return [key, { error: `Invalid interaction, you must respect the following format: { "xxx": {"type":"xxx", ...props} }` }];

        const { type, ...properties } = value;

        if (!interactions[type]) return [key, { error: `Interaction type "${type}" not supported, you must respect the following format: { "xxx": {"type":"xxx", ...props} }` }];

        try {
          const response = await interactions[type](properties);
          return [key, response];
        } catch (error) {
          return [key, error.message];
        }
      })
    )
  ).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});

  //   console.log(result);
  return result;
};

var interactions_testing = () => {
  // Start listening for interactions from System
  process.stdin.on("data", async (data) => {});

  //{"read file": {"type":"files.readFileText", "path":"C:\\MyAPP\\Loop.cs"}}

  // Send a test interaction to System to confirm the connection
  console.log(JSON.stringify({ init: { type: "test.init" } }));
};
