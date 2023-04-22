import { BaseHook } from "./baseHook";

export interface GenericChatBot {
  init(...args: any): Promise<any>
  sendMessage(message: string, args: { stream?: (msg: string) => void; stop?: string[] }): Promise<string>
}

export class ChatGPTHook extends BaseHook implements GenericChatBot {
  async init({ browserURL }) {
    const { hasInyect } = await super.createConnection({
      browserURL,
      goto: "https://chat.openai.com/",
    });
    if (!hasInyect) {
      app.logs.print("Loading Page...");
      await this.evaluate("await chatGPT.waitLoading()");
      app.logs.print("");
    }
    return { hasInyect };
  }

  sendModelInfo = false;

  async sendMessage(
    message: string,
    {
      stream,
      stop = [],
    }: { stream?: (msg: string) => void; stop?: string[] } = {}
  ): Promise<string> {
    this.stream = stream;

    const result = (await this.evaluate("chatGPT.sendInput", message, {
      stop,
    })) as string;

    if (this.sendModelInfo) {
      const data = (await this.evaluate("chatGPT.findModelInfo")) as any;
      if (data) {
        this.sendModelInfo = true;
        app.logs.print("ModelInfo:", JSON.parse(data));
      }
    }

    return result;
  }
}
