import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const getInput = (prompt) => {
  return new Promise<string>((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

export const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export const isDebug = process.env.DEBUG?.toLocaleLowerCase() === `true`;

export const debugLog = (...args) => {
  let BgGray = "\x1b[90m";
  if (isDebug) console.log(BgGray, ...args, "\x1b[0m");
};

export const logMessage = ({ role, content }) => {
  debugLog(`${role}: ${content}`);
};
