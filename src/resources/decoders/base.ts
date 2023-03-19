import { Inter, InterRes, TryInteraction } from "../../interactios";
import { Message } from "../context";

export abstract class BaseDecoder {
  abstract name: string;
  abstract tryInteractionRaw(message: string): Promise<string>;
  abstract buildRaw(type: string, props: object): string;
  abstract buildResultRaw(result: InterRes | InterRes[]): string;

  build(type: string, props: object): Inter {
    return { type, ...props };
  }

  createResquest(message: string) {
    return this.buildRaw("user.request", { message });
  }

  async tryRun(inters: Inter[]) {
    const result = await Promise.all(
      inters.map(async (value, key) => {
        if (typeof value !== "object")
          return {
            id: `index:${key}`,
            error: "Invalid interaction.",
          } as InterRes;

        const { type, id, ...properties } = value;
        try {
          return {
            id: id || `index:${key}`,
            ...(await TryInteraction(type, properties)),
          } as InterRes;
        } catch (error: any) {
          return { id: id || `index:${key}`, error: error.message } as InterRes;
        }
      })
    );

    return result;
  }
}
