import { exec, spawn, ChildProcessWithoutNullStreams } from "child_process";
import { PowerShell } from "node-powershell";

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

  return new Promise((resolve, reject) => {
    const code = setTimeout(() => {
      if (output) return resolve({ result: output?.trim() || "" });
      reject(new Error("timeout(60s)"));
    }, 600000);

    powershellProcess
      .invoke(`${command}`)
      .then((output) => {
        clearTimeout(code);
        resolve({ result: output.raw || "", startTime: output.startTime, duration: output.duration, hadErrors: output.hadErrors });
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

  return new Promise((resolve, reject) => {
    const code = setTimeout(() => {
      if (output) return resolve({ result: output?.trim() || "" });
      reject(new Error("timeout(60s)"));
    }, 60000);

    powershellProcess
      .invoke(`${command}`)
      .then((output) => {
        clearTimeout(code);
        resolve({ result: output.raw || "", startTime: output.startTime, duration: output.duration, hadErrors: output.hadErrors });
      })
      .catch((err) => {
        clearTimeout(code);
        reject(new Error(err.toString("utf8")));
      });
  }).catch((err) => ({ error: err.message }));
};
