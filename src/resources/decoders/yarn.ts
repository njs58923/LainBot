import { BaseDecoder } from "./json";

export class YarnDecoder extends BaseDecoder {
  createResquest(message: string): string {
    throw new Error("Method not implemented.");
  }
  tryInteractionRaw(message: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  buildRaw(type: string, props: object): string {
    throw new Error("Method not implemented.");
  }
}
