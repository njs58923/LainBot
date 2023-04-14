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
      console.log("Loading Page...");
      await this.evaluate(`await chatBing.waitLoading()`);
      console.log("");
    }
    return { hasInyect };
  }

  async sendMessage(message: string): Promise<string> {
    return (await this.evaluate("chatBing.sendInput", message)) as string;
  }
}
