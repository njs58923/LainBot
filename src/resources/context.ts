import { M } from "../utils";

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

export class Roles {
  constructor(public v: RolesType) {}
  replace(text) {
    return text.replace(/{{D}}|{{S}}/g, (match) => {
      if (match === "{{D}}") return this.v.ai;
      if (match === "{{S}}") return this.v.ai;
    });
  }
  replaceAll(...text) {
    return text.map((t) => this.replace(t));
  }
}

export class BuildContext {
  context: string;
  roles: Roles;
  samples: Message<string>[];
  constructor({
    context,
    roles,
    samples,
  }: {
    context: string;
    roles: Roles;
    samples: Message[];
  }) {
    this.roles = roles;
    this.samples = samples.map(
      (s) => (s.content = this.roles.replace(s.content))
    );
    this.context = this.roles.replace(read(context));
  }

  replaceMessages(msgs: Message[]): Message[] {
    return msgs.map((s) => (s.content = this.roles.replace(s.content)));
  }

  build_messages(): Message[] {
    return [M(this.roles.v.system, this.context), ...this.samples];
  }

  build_intructions(): Message {
    return M(this.roles.v.system, this.context);
  }
  build_unique_prompt = () => {
    return `${this.context}\n\n${this.samples
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n")}`;
  };
}

// export const Roles = { ai, system: "App", context: "system" } as const;
