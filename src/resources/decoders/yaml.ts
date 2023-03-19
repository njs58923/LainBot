import yaml from "js-yaml";
import { Inter, InterRes } from "../../interactios";
import { Message } from "../context";
import { BaseDecoder } from "./base";

export class YamlDecoder extends BaseDecoder {
  name: string = "YAML";

  parse(message: string): Inter[] {
    var value: Inter | Inter[];
    message = message.trim();
    message.replace(/^# ChatGPT:\n/g, "");
    value = yaml.load(message) as Inter[];

    return Array.isArray(value) ? value : [value];
  }

  async tryInteractionRaw(message: string): Promise<string> {
    try {
      var list = this.parse(message);
    } catch (error: any) {
      return yaml.dump({ error: error?.message }, { replacer: this.replacer });
    }
    const result = await this.tryRun(list);
    return yaml.dump(result, { replacer: this.replacer });
  }
  buildRaw(type: string, props: object): string {
    return yaml.dump([{ type, ...props }], { replacer: this.replacer });
  }

  replacer(key, value) {
    if (typeof value === "function") {
      return undefined;
    }
    return value;
  }

  parseMessage(message: Message<string, InterRes | InterRes[]>) {
    (message as any).content = yaml.dump(message.content, {
      replacer: this.replacer,
    });
    return message as any as Message;
  }
}
