import { Inter } from "../../interactios";
import { extractObjects } from "../../utils";
import { BaseDecoder } from "./base";

export class JsonDecoder extends BaseDecoder {
  name: string = "JSON";
  buildRaw(type: string, props: object): string {
    return JSON.stringify(this.build(type, props));
  }

  parse(raw: string): Inter[] {
    raw = TryRepairInteraction(raw);
    try {
      try {
        return [JSON.parse(raw as any)];
      } catch (error) {
        try {
          return extractObjects(raw as any);
        } catch (error) {
          let obj = eval(raw as any) as Inter;
          if (typeof obj === "object") return [obj];
        }
      }
    } catch (error) {}
    throw new Error(`The response is not a valid JSON`);
  }

  async tryInteractionRaw(raw: string) {
    try {
      var interaction = this.parse(raw);
    } catch (error: any) {
      return JSON.stringify({ error: error?.message });
    }

    return JSON.stringify(await this.tryRun(interaction));
  }
}

export const TryRepairInteraction = (raw: string) => {
  raw = raw.trim();
  raw = raw.replace(/"|"/g, '"');
  // const regex = raw.match(/\`\`\`([^]*)\`\`\`/);
  // if (regex) raw = regex[1].replace(/\\/g, "\\\\");
  return raw;
};
