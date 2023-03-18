import { createInterface } from "readline";
import { Message } from "../resources/context";
import JSONbig from "json-bigint";
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
export function truncateText(text: string, limit: number = 1000) {
  if (text.length > limit) {
    return text.slice(0, limit) + "…";
  } else {
    return text;
  }
}

export function extractObjects(str) {
  let objects: any[] = [];
  let stack: any[] = [];
  let startIdx = -1;

  for (let i = 0; i < str.length; i++) {
    let char = str[i];

    if (char === "{") {
      if (stack.length === 0) {
        startIdx = i;
      }
      stack.push("{");
    } else if (char === "}") {
      stack.pop();
      if (stack.length === 0 && startIdx !== -1) {
        let jsonString = str.slice(startIdx, i + 1);
        try {
          let obj = JSON.parse(jsonString);
          objects.push(obj);
        } catch (error) {
          console.error("Error al parsear JSON:", error);
        }
        startIdx = -1;
      }
    }
  }

  return objects;
}
