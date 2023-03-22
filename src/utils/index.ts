import { createInterface } from "readline";
import { Message } from "../resources/context";
import JSONbig from "json-bigint";
import { Environment } from "../environment";
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const getInput = (prompt) => {
  console.log("");
  return new Promise<string>((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.replace(/\\n/g, "\n"));
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

export const debugLog = (...args) => {
  if (Environment.isDebug) LogColor(90, ...args);
};
export const LogColor = (color, ...args) => {
  console.log(`\x1b[${color}m`, ...args, "\x1b[0m");
};

export const logMessage = ({ role, content }) => {
  console.log("");
  console.log(
    "\x1b[32m",
    `${role}(Raw): `,
    "\x1b[90m",
    `${content.replace(/\n/g, "\\n")}`,
    "\x1b[0m"
  );
  console.log("\x1b[94m", `${content}`, "\x1b[0m");
};

export const M = <R = string, A = string>(
  role: R,
  content: A
): Message<R, A> => {
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
          console.log("🟦", jsonString);
          let obj = JSON.parse(jsonString);
          objects.push(obj);
        } catch (error) {
          console.error("Error al parsear JSON:", error);
          throw error;
        }
        startIdx = -1;
      }
    }
  }

  return objects;
}
