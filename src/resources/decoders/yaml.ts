import yaml from "js-yaml";
import { Inter, InterRes } from "../../interactios";
import { Message } from "../context";
import { BaseDecoder } from "./base";

export class YamlDecoder extends BaseDecoder {
  name: string = "YAML";

  parse(message: string): Inter[] {
    var value: Inter | Inter[];
    message = message.trim();
    message = message.replace(/^ChatGPT:(?:\n|\\n)/g, "");
    value = yaml.load(message) as Inter[];

    return Array.isArray(value) ? value : [value];
  }

  buildResultRaw(result: InterRes | InterRes[]): string {
    return yaml.dump(result, { replacer: this.replacer });
  }

  async tryInteractionRaw(message: string): Promise<string> {
    try {
      var list = this.parse(message);
    } catch (error: any) {
      return this.buildResultRaw({ error: error?.message });
    }
    console.log("🟢", list);
    const result = await this.tryRun(list);
    return this.buildResultRaw(result);
  }
  buildRaw(type: string, props: object): string {
    return this.buildResultRaw([{ type, ...props }]);
  }

  replacer(key, value) {
    if (typeof value === "function") {
      return undefined;
    }
    return value;
  }

  parseMessage(message: Message<string, InterRes | InterRes[]>) {
    (message as any).content = this.buildResultRaw(message.content);
    return message as any as Message;
  }
}
