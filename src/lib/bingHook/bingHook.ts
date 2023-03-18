import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import { Message, Roles } from "../../resources/context";
import { BaseHook } from "./baseHook";

export class BingHook extends BaseHook {
  async sendMessage(message: string): Promise<string> {
    return (await this.evaluate("chatBing.sendInput", message)) as string;
  }

  async createConnection({ browserURL, goto }) {
    const { hasInyect } = await super.createConnection({ browserURL, goto });
    if (!hasInyect) {
      console.log("Loading Page...");
      await this.evaluate("await chatBing.waitLoading()");
      console.log("");
    }

    return { hasInyect };
  }
}
