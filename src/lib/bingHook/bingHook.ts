import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import { Message, Roles } from "../../resources/context";
import { BaseHook } from "./baseHook";

export class BingHook extends BaseHook {
  async createConnection({ browserURL }) {
    const { hasInyect } = await super.createConnection({ browserURL, goto: "https://edgeservices.bing.com/edgesvc/chat?clients%E2%80%A68acd7ddfb54f190b3f26f2eeb8bb41720&darkschemeovr=1" });
    if (!hasInyect) {
      console.log("Loading Page...");
      await this.evaluate("await chatBing.waitLoading()");
      console.log("");
    }
    return { hasInyect };
  }

  async sendMessage(message: string): Promise<string> {
    return (await this.evaluate("chatBing.sendInput", message)) as string;
  }
}
