const fs = require("fs");

let context = fs.readFileSync("src\\resources\\context.txt", "utf8");
const roles = { ai: "assistant", system: "user", context: "system" };
exports.roles = roles;

context = context.replace(/{{ai}}|{{system}}/g, (match) => {
  if (match === "{{ai}}") {
    return roles.ai; // Reemplazar '{{ai}}' con 'AI'
  } else {
    return roles.system; // Reemplazar '{{system}}' con 'System'
  }
});

const start_messages = [
  { role: roles.ai, content: `{"type":"ia.init"}` },
  { role: roles.system, content: `{result: "OK"}` },
  { role: roles.ai, content: `{"type":"command.powershell", "commad": "Get-Date"}` },
  { role: roles.system, content: `{"result":"17:56:45"}` },
  { role: roles.ai, content: `{"type":"ia.wait"}` },
];

exports.build_messages = () => {
  return [{ role: roles.system, content: context }, ...start_messages];
};

exports.build_prompt = () => {
  return `${context}\n\n${start_messages.map((m) => `${m.role}: ${m.content}`).join("\n")}`;
};
