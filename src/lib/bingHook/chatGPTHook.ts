import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import { Message, Roles } from "../../resources/context";
import { BaseHook } from "./baseHook";

export class BingHook extends BaseHook {
  async sendMessage(message: string): Promise<string> {
    return (await this.evaluate("chatBing.sendInput", message)) as string;
  }
}
