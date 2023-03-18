import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import { Message, Roles } from "../../resources/context";
import { BaseHook } from "./baseHook";

export class ChatGPTHook extends BaseHook {
  async sendMessage(message: string): Promise<string> {
    return (await this.evaluate("chatGPT.sendInput", message)) as string;
  }
  async createConnection({ browserURL }) {
    const { hasInyect } = await super.createConnection({ browserURL, goto: "https://chat.openai.com/chat" });
    if (!hasInyect) {
      console.log("Loading Page...");
      await this.evaluate("await chatGPT.waitLoading()");
      console.log("");
    }
    return { hasInyect };
  }
}
