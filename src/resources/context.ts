const fs = require("fs");

let context = fs.readFileSync("src\\resources\\context.txt", "utf8");
let context2 = fs.readFileSync("src\\resources\\context2.txt", "utf8");

export const Roles = { ai: "TU", system: "App", context: "system" } as const;
type ValuesOf<T> = T[keyof T];
export type RolesNames = ValuesOf<typeof Roles>;

export type Message<T = string> = {
  role: T;
  content: string;
};

context = context.replace(/{{D}}|{{S}}/g, (match) => {
  if (match === "{{D}}") {
    return Roles.ai; // Reemplazar '{{D}}' con 'AI'
  } else {
    return Roles.system; // Reemplazar '{{S}}' con 'System'
  }
});
context2 = context2.replace(/{{D}}|{{S}}/g, (match) => {
  if (match === "{{D}}") {
    return Roles.ai; // Reemplazar '{{D}}' con 'AI'
  } else {
    return Roles.system; // Reemplazar '{{S}}' con 'System'
  }
});

const start_messages = [
  { role: Roles.ai, content: `{"type":"ia.init"}` },
  { role: Roles.system, content: `{result: "OK"}` },
  { role: Roles.ai, content: `{"type":"command.powershell", "commad": "Get-Date"}` },
  { role: Roles.system, content: `{"result":"17:56:45"}` },
  { role: Roles.ai, content: `{"type":"ia.wait"}` },
];

export const build_messages = (): Message[] => {
  return [{ role: Roles.system, content: context2 }, ...start_messages];
};

export const build_messages_intructions = (): Message => {
  return { role: Roles.system, content: context2 };
};

export const build_prompt = () => {
  return `${context}\n\n${start_messages.map((m) => `${m.role}: ${m.content}`).join("\n")}`;
};
