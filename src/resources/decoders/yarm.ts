import yaml from "js-yaml";
import { Inter, InterRes } from "../../interactios";
import { Message } from "../context";
import { BaseDecoder } from "./base";

export class YarmDecoder extends BaseDecoder {
  name: string = "YARM";

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
      return JSON.stringify({ error: error?.message });
    }
    console.log(list);
    return JSON.stringify(await this.tryRun(list));
  }
  buildRaw(type: string, props: object): string {
    return yaml.dump({ type, ...props });
  }

  parseMessage(message: Message<string, InterRes>) {
    (message as any).content = yaml.dump(message.content);
    return message as any as Message;
  }
}
