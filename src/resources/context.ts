import { Decoder, getInteractionsNames, Interactions } from "../interactions";
import { LogColor, M } from "../utils";
import { Roles } from "./utils/Roles";

const fs = require("fs");

// let context = fs.readFileSync("src\\resources\\context.txt", "utf8");
// let context2 = fs.readFileSync("src\\resources\\context2.txt", "utf8");

export const read = (fileName: string) => {
  return fs.readFileSync(`src\\resources\\contexts\\${fileName}.txt`, "utf8");
};

export type Message<T = string, C = string> = {
  role: T;
  content: C;
};

export const removeComments = (text: string) =>
  text.replace(/^\/\/[^\n]*\n/gm, "");

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
    this.context = this.roles.replace(removeComments(read(context)));
    this.validateContext();
  }

  validateContext() {
    let list = getInteractionsNames().filter((i) => !this.context.includes(i));
    if (list.length === 0) return;
    LogColor(
      91,
      `Las siguientes interraciones no estan en el contexto ${list.join(", ")}.`
    );
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
    throw new Error("Option style not valid");
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
              await Interactions({ roles: this.roles, noInput: false })[
                "memory.preview"
              ]({})
            )
          ),
          style
        ) || ""
      );
  };
}

// export const Roles = { ai, system: "App", context: "system" } as const;
