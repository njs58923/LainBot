import { Inter, TryInteraction } from "../../interactios";
import { Message } from "../context";

export abstract class BaseDecoder {
  abstract name: string;
  abstract tryInteractionRaw(message: string): Promise<string>;
  abstract buildRaw(type: string, props: object): string;

  build(type: string, props: object): Inter {
    return { type, ...props };
  }

  createResquest(message: string) {
    return this.buildRaw("user.request", { message });
  }

  async tryRun(inters: Inter[]) {
    const result = (
      await Promise.all(
        inters.map(async (value, key) => {
          try {
            if (typeof value !== "object")
              throw new Error("Invalid interaction.");

            const { type, ...properties } = value;
            return [key, await TryInteraction(type, properties)];
          } catch (error: any) {
            return [key, error.message];
          }
        })
      )
    ).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});

    return Object.keys(result).length === 1
      ? result[Object.keys(result)[0]]
      : result;
  }
}
