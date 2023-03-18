import { BaseHook } from "./baseHook";

export class ChatGPTHook extends BaseHook {
  async createConnection({ browserURL }) {
    const { hasInyect } = await super.createConnection({
      browserURL,
      goto: "https://chat.openai.com/chat",
    });
    if (!hasInyect) {
      console.log("Loading Page...");
      await this.evaluate("await chatGPT.waitLoading()");
      console.log("");
    }
    return { hasInyect };
  }

  sendModelInfo = false;
  async sendMessage(message: string): Promise<string> {
    const result = (await this.evaluate(
      "chatGPT.sendInput",
      message
    )) as string;
    if (this.sendModelInfo) {
      const data = (await this.evaluate("chatGPT.findModelInfo")) as any;
      if (data) {
        this.sendModelInfo = true;
        console.log("ModelInfo:", JSON.parse(data));
      }
    }
    return result;
  }
}
