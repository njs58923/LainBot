import yaml from "js-yaml";
import { Inter, InterRes } from "../../interactios";
import { Message } from "../context";
import { BaseDecoder } from "./base";

export class YamlDecoder extends BaseDecoder {
  name: string = "YAML";

  parse(message: string): Inter[] {
    var value: Inter | Inter[];
    message = message.trim();
    console.log(JSON.stringify(message));
    message.replace(/^# ChatGPT:\n/g, "");
    console.log(JSON.stringify(message));
    value = yaml.load(message) as Inter[];

    return Array.isArray(value) ? value : [value];
  }

  async tryInteractionRaw(message: string): Promise<string> {
    try {
      var list = this.parse(message);
    } catch (error: any) {
      return yaml.dump({ error: error?.message });
    }
    console.log(list);
    return yaml.dump(await this.tryRun(list));
  }
  buildRaw(type: string, props: object): string {
    return yaml.dump({ type, ...props });
  }

  parseMessage(message: Message<string, InterRes>) {
    (message as any).content = yaml.dump(message.content);
    return message as any as Message;
  }
}
