import { Env } from "../../environment";
import { BaseHook } from "./baseHook";
import { GenericChatBot } from "./chatGPTHook";

export class BingHook extends BaseHook implements GenericChatBot {
  async init({ browserURL }) {
    const { hasInyect } = await super.createConnection({
      browserURL,
      goto: Env.BING_WEB_HOOK,
    });
    if (!hasInyect) {
      app.logs.print("Loading Page...");
      await this.evaluate(`await chatBing.waitLoading()`);
      app.logs.print("");
    }
    return { hasInyect };
  }

  async sendMessage(message: string): Promise<string> {
    return (await this.evaluate("chatBing.sendInput", message)) as string;
  }
}
