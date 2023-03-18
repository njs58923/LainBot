const fs = require("fs");

// let context = fs.readFileSync("src\\resources\\context.txt", "utf8");
// let context2 = fs.readFileSync("src\\resources\\context2.txt", "utf8");

export const read = (fileName: string) => {
  return fs.readFileSync(`src\\resources\\${fileName}.txt`, "utf8");
};

export type RolesType = {
  ai: string;
  system: string;
  context: string;
};
export type Message<T = string> = {
  role: T;
  content: string;
};

export class Context {
  context: string;
  roles: RolesType;
  samples: Message<string>[];
  constructor({ context, roles, samples }: { context: string; roles: { ai; system; context }; samples: Message[] }) {
    this.context = read(context).replace(/{{D}}|{{S}}/g, (match) => {
      if (match === "{{D}}") return roles.ai;
      else return roles.system;
    });
    this.roles = roles;
    this.samples = samples;
  }
  build_messages(): Message[] {
    return [{ role: this.roles.system, content: this.context }, ...this.samples];
  }
  build_intructions(): Message {
    return { role: this.roles.system, content: this.context };
  }
  build_unique_prompt = () => {
    return `${this.context}\n\n${this.samples.map((m) => `${m.role}: ${m.content}`).join("\n")}`;
  };
}

// export const Roles = { ai, system: "App", context: "system" } as const;
