import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import { Message, Roles } from "../../resources/context";

interface Hook {
  sendMessage(content: string): Promise<void>;
}
export class BingHook {
  constructor(public setting: { port: number }) {}
  browser: Browser = undefined as any;
  page: Page = undefined as any;

  async inyectFile(pach) {
    const tslibContent = fs.readFileSync(pach, "utf8");
    await this.page
      .evaluate((tslibContent) => {
        const script = document.createElement("script");
        script.textContent = tslibContent;
        document.head.appendChild(script);
      }, tslibContent)
      .catch((e) => {
        console.log(e);
        throw e;
      });
  }

  async createConnection() {
    const connect = async () => {
      this.browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:21222" });
      this.page = await this.browser.newPage();
      await this.page.goto("https://edgeservices.bing.com/edgesvc/chat?clientscopes=chat,noheader&udsframed=1&form=SHORUN&shellsig=e823d889fd0c1a675cfcc2b6318aaae74167eab5&darkschemeovr=1");
      await this.inyectFile("node_modules/tslib/tslib.js");
      await new Promise((r) => setTimeout(r, 500 + Math.random()));
      await this.inyectFile("src/lib/bingHook/inyect/dist/bundle.js");

      this.exposeFunction();

      console.log("🟢 WAIT");
      await this.evaluate("await chatBing.waitLoading()");
      console.log("🟢 OK");
    };

    while (true) {
      console.log("Conectado...");
      return await connect();
    }
  }

  exposeFunction() {
    this.page.exposeFunction(`promise_ok`, (id, ...args) => {
      if (!this.promises[id]) return;
      this.promises[id].r(...args);
      delete this.promises[id];
    });
    this.page.exposeFunction(`promise_err`, (id, ...args) => {
      if (!this.promises[id]) return;
      this.promises[id].e(...args);
      delete this.promises[id];
    });
    this.page.exposeFunction(`page_type`, async (query, text) => {
      await this.page.type(query, text);
    });
    this.page.exposeFunction(`page_click`, async (query) => {
      await this.page.click(query);
    });
    this.page.exposeFunction(`page_focus`, async (query) => {
      await this.page.focus(query);
    });
    this.page.exposeFunction(`page_keyboard`, async (text) => {
      await this.page.keyboard.type(text);
    });
  }

  promises: Record<string, { r: (...any) => void; e: (...any) => void }> = {};
  promise_cound = 0;
  async evaluate(script, ...args) {
    return new Promise(async (r, e) => {
      const id = this.promise_cound++;
      this.promises[id] = { r, e };
      const code = `
      (async ()=>{

        let _eval = (${script});
        if(typeof _eval === "function"){
            Promise.resolve(_eval(...JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(args))}"))))
            .then((...args)=> promise_ok("${id}", ...args))
            .catch((...args)=> promise_err("${id}", ...args))
        }else{
            Promise.resolve(_eval)
            .then((...args)=> promise_ok("${id}", ...args))
            .catch((...args)=> promise_err("${id}", ...args))
        }

      })()
    `;
      await new Promise((r) => setTimeout(r, 500 + Math.random()));
      this.page.evaluateHandle(code);
    });
    typeof this.evaluate === "function";
  }

  async sendMessage(message: string): Promise<Message> {
    const response = (await this.evaluate("chatBing.sendInput", message)) as string;
    return { role: Roles.ai, content: response };
  }
}
