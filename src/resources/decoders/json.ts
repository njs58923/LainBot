import { Interaction, InteractionRaw, interactions } from "../../interactios";
import { extractObjects } from "../../utils";

export abstract class BaseDecoder {
  abstract createResquest(message: string): string;
  abstract tryInteractionRaw(message: string): Promise<string>;
  abstract buildRaw(type: string, props: object): string;
}

export class JsonDecoder extends BaseDecoder {
  createResquest(message: string) {
    return this.buildRaw("user.request", { message });
  }

  build(type: string, props: object) {
    return { type, ...props };
  }

  buildRaw(type: string, props: object): string {
    return JSON.stringify(this.build(type, props));
  }

  static StopForceRaw = `{ "type": "user.response", "message": "END" }`;

  parse(raw: string): Interaction[] {
    raw = TryRepairInteraction(raw);
    try {
      try {
        return [JSON.parse(raw as any)];
      } catch (error) {
        try {
          return extractObjects(raw as any);
        } catch (error) {
          let obj = eval(raw as any) as Interaction;
          if (typeof obj === "object") return [obj];
        }
      }
    } catch (error) {}
    throw new Error(`The response is not a valid JSON`);
  }

  async tryRun(inters: Interaction[]) {
    const result = (
      await Promise.all(
        inters.map(async (value, key) => {
          if (typeof value !== "object")
            return [
              key,
              {
                error: `Invalid interaction, you must respect the following format: {"type":"xxx", ...props}`,
              },
            ];

          const { type, ...properties } = value;

          if (!interactions[type])
            return [
              key,
              {
                error: `Interaction type "${type}" not supported, you must respect the following format: {"type":"xxx", ...props}`,
              },
            ];

          try {
            return [key, await interactions[type](properties)];
          } catch (error: any) {
            return [key, error.message];
          }
        })
      )
    ).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});

    //   console.log(result);
    return Object.keys(result).length === 1
      ? result[Object.keys(result)[0]]
      : result;
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
