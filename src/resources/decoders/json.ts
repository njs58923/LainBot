import { Inter, InterRes } from "../../interactions";
import { extractObjects } from "../../utils";
import { Message, Roles } from "../context";
import { BaseDecoder } from "./base";

export class JsonDecoder extends BaseDecoder {
  buildResultRaw(result: InterRes | InterRes[]): string {
    return JSON.stringify(result);
  }

  name: string = "JSON";
  buildRaw(type: string, props: object): string {
    return this.buildResultRaw(this.build(type, props));
  }

  parse(raw: string): Inter[] {
    raw = TryRepairInteraction(raw);
    try {
      try {
        const list = JSON.parse(raw as any);
        return Array.isArray(list) ? list : [list];
      } catch (error) {
        try {
          return extractObjects(raw as any);
        } catch (error) {
          let obj = eval(raw as any) as Inter;
          if (typeof obj === "object") return Array.isArray(obj) ? obj : [obj];
        }
      }
    } catch (error) {}
    throw new Error(`The response is not a valid JSON`);
  }

  async tryInteractionRaw(
    raw: string,
    { roles, noInput }: { roles: Roles; noInput: boolean }
  ) {
    try {
      var interaction = this.parse(raw);
    } catch (error: any) {
      return this.buildResultRaw({ error: error?.message });
    }
    if (interaction.length === 0)
      interaction = [{ type: "user.failed", message: raw }];

    return this.buildResultRaw(
      await this.tryRun(interaction, { roles, noInput })
    );
  }
}

export const TryRepairInteraction = (raw: string) => {
  raw = raw.trim();
  raw = raw.replace(/"|"/g, '"');
  // const regex = raw.match(/\`\`\`([^]*)\`\`\`/);
  // if (regex) raw = regex[1].replace(/\\/g, "\\\\");
  return raw;
};
