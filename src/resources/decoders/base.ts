import { Inter, InterRes, TryInteraction } from "../../interactions";
import { Message } from "../context";
import { Roles } from "../utils/Roles";

export abstract class BaseDecoder {
  abstract name: string;
  abstract tryInteractionRaw(
    message: string,
    { roles }: { roles: Roles }
  ): Promise<string>;
  abstract buildRaw(type: string, props: object): string;
  abstract buildResultRaw(result: InterRes | InterRes[]): string;

  build(type: string, props: object): Inter {
    return { type, ...props };
  }

  parseMessage(message: Message<string, InterRes | InterRes[]>) {
    (message as any).content = this.buildResultRaw(message.content);
    return message as any as Message;
  }

  createResquest(message: string) {
    return this.buildRaw("user.request", { message });
  }

  async tryRun(
    inters: Inter[],
    { roles, noInput }: { roles: Roles; noInput: boolean }
  ) {
    const result = await Promise.all(
      inters.map(async (value, key) => {
        if (typeof value !== "object" || !value)
          return {
            id: `index:${key}`,
            error: "Invalid interaction.",
          } as InterRes;

        const { type, id, ...properties } = value;
        try {
          return {
            id: id || `index:${key}`,
            ...(await TryInteraction(type, properties, { roles, noInput })),
          } as InterRes;
        } catch (error: any) {
          return { id: id || `index:${key}`, error: error.message } as InterRes;
        }
      })
    );

    return result.filter(
      (i) => !(i && Object.keys(i).length === 1 && "id" in i)
    );
  }
}
