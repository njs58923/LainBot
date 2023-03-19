import { exec, spawn, ChildProcessWithoutNullStreams } from "child_process";
import { PowerShell } from "node-powershell";
import shellEscape from "shell-escape";
import { InterRes } from "../interactios";

let powershellProcess: PowerShell = undefined as any;

export const powershell = ({ command, location }) => {
  command = command.replace(/\\/g, "\\\\");

  powershellProcess = new PowerShell({
    executableOptions: {
      "-ExecutionPolicy": "Bypass",
      "-NoProfile": true,
    },
    spawnOptions: {
      cwd: location,
    },
  });

  let output = "";

  return new Promise<InterRes>((resolve, reject) => {
    const code = setTimeout(() => {
      if (output) return resolve({ result: output?.trim() || "" });
      reject(new Error("timeout(60s)"));
    }, 6000000);

    powershellProcess
      .invoke(`${command}`)
      .then((output) => {
        clearTimeout(code);
        resolve({
          result: output.raw || "",
          startTime: output.startTime,
          duration: output.duration,
          hadErrors: output.hadErrors,
        });
      })
      .catch((err) => {
        clearTimeout(code);
        reject(new Error(err.toString("utf8")));
      });
  }).catch((err) => ({ error: err.message }));
};

export const cmd = ({ command, location }) => {
  command = command.replace(/\\/g, "\\\\");

  powershellProcess = new PowerShell({
    executableOptions: {
      "-ExecutionPolicy": "Bypass",
      "-NoProfile": true,
    },
    spawnOptions: {
      cwd: location,
    },
  });

  let output = "";

  return new Promise<InterRes>((resolve, reject) => {
    const code = setTimeout(() => {
      if (output) return resolve({ result: output?.trim() || "" });
      reject(new Error("timeout(60s)"));
    }, 6000000);

    powershellProcess
      .invoke(`${command}`)
      .then((output) => {
        clearTimeout(code);
        resolve({
          result: output.raw || "",
          startTime: output.startTime,
          duration: output.duration,
          hadErrors: output.hadErrors,
        });
      })
      .catch((err) => {
        clearTimeout(code);
        reject(new Error(err.toString("utf8")));
      });
  }).catch((err) => ({ error: err.message }));
};
const escapeDoubleQuotes = (str) => {
  return str.replace(/"/g, '\\"');
};

export const runScript = (language: string, script: string, callback) => {
  let command;

  if (language.toLocaleLowerCase() === "js") {
    const escapedScript = escapeDoubleQuotes(script);
    command = `node -p "${escapedScript}"`;
  } else if (language.toLocaleLowerCase() === "python") {
    const escapedScript = escapeDoubleQuotes(script);
    command = `python -c "print(${escapedScript})"`;
  } else {
    return callback(new Error(`Language not supported`));
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return callback(error);
    }
    callback(null, stdout.trim());
  });
};
