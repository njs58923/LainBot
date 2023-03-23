import { Decoder, getInteractionsNames, Interactions } from "../interactios";
import { LogColor, M } from "../utils";

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
export type Message<T = string, C = string> = {
  role: T;
  content: C;
};

export class Roles {
  constructor(public v: RolesType) {}
  replace(text: string) {
    return text.replace(/{{D}}|{{S}}|{{C}}|{{F}}/g, (match) => {
      if (match === "{{F}}") return Decoder.name;
      if (match === "{{D}}") return this.v.ai;
      if (match === "{{S}}") return this.v.system;
      if (match === "{{C}}") return this.v.context;
      throw 0;
    });
  }
  replaceAll(...text: string[]) {
    return text.map((t) => this.replace(t));
  }
}

export const removeComments = (text: string) => text.replace(/^\/\/.*\n/gm, "");

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
    this.samples = samples;
    samples.forEach((s) => (s.content = this.roles.replace(s.content)));
    this.context = removeComments(this.roles.replace(read(context)));
    this.validateContext();
  }

  validateContext() {
    let list = getInteractionsNames().filter((i) => !this.context.includes(i));
    if (list.length === 0) return;
    LogColor(91, `Las siguientes interraciones no estan ${list.join(", ")}.`);
  }

  replaceMessages(msgs: Message[]): Message[] {
    msgs.forEach((s) => (s.content = this.roles.replace(s.content)));
    return msgs;
  }

  build_messages(): Message[] {
    return [M(this.roles.v.system, this.context), ...this.samples];
  }

  build_intruction(): Message {
    return M(this.roles.v.system, this.context);
  }

  build_sample(m: Message<string>, style: ":" | "#" | "###") {
    if (style === ":") return `${m.role}: ${m.content}`;
    if (style === "#") return `# ${m.role}:\n${m.content}`;
    if (style === "###") return `### ${m.role}:\n${m.content}\n`;
  }

  build_samples(style: Parameters<typeof this["build_sample"]>[1]) {
    return this.samples.map((m) => this.build_sample(m, style)).join("\n");
  }

  build_unique_prompt = async (
    style: Parameters<typeof this["build_sample"]>[1]
  ) => {
    return this.context
      .replace(/{{Sample}}/g, this.build_samples(style) ?? "")
      .replace(
        /{{Memory}}/g,
        this.build_sample(
          M(
            "Memory",
            Decoder.buildResultRaw(
              await Interactions(this.roles)["memory.preview"]({})
            )
          ),
          style
        ) || ""
      );
  };
}

// export const Roles = { ai, system: "App", context: "system" } as const;
