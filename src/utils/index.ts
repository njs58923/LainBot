import { createInterface } from "readline";
import { Message } from "../resources/context";

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
  if (isDebug) console.log("\x1b[90m", ...args, "\x1b[0m");
};

export const logMessage = ({ role, content }) => {
  console.log("\x1b[32m", `${role}: `, "\x1b[90m", `${content}`, "\x1b[0m");
};

export const M = (role, content): Message => {
  return { role, content };
};
