import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import { debugLog } from "../../utils";

export class BaseHook {
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

  async createConnection({ browserURL, goto }) {
    const connect = async () => {
      this.browser = await puppeteer.connect({
        browserURL,
        defaultViewport: null,
      });
      let pages = await this.browser.pages();
      const allPages = pages.map((p) => ({ page: p, url: p.url() }));
      const existPage = allPages.find((i) => i.url.includes(goto))?.page;
      if (existPage) {
        this.page = existPage;
      } else {
        this.page = await this.browser.newPage();
        this.page.goto(goto);
      }
      const hasInyect = await this.page.evaluate("window.inyectOk");
      if (!hasInyect) {
        await this.inyectFile("node_modules/tslib/tslib.js");
        await new Promise((r) => setTimeout(r, 500 + Math.random()));
        await this.inyectFile("src/chats/handlers/inyect/dist/bundle.js");
      }
      this.exposeFunction();
      return { hasInyect };
    };
    let value: Awaited<ReturnType<typeof connect>>;
    while (true) {
      console.log("Conectado...");
      value = await connect();
      break;
    }
    console.log("");
    return value;
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
    this.page.exposeFunction(`page_log`, (...args) => {
      debugLog(...args);
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
    this.page.exposeFunction(
      `page_keyboard`,
      //@ts-ignore
      async (text: string, jumpLine = false) => {
        const clipboard = (await import("clipboardy")).default;
        const value = clipboard.readSync();
        clipboard.writeSync(text);
        await this.page.keyboard.down("ControlLeft");
        await this.page.keyboard.press("KeyV");
        await this.page.keyboard.up("ControlLeft");
        clipboard.writeSync(value);
        await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));
        await this.page.keyboard.type("\n");
      }
    );
    this.page.exposeFunction(
      `page_live`,
      (msg) => this.stream && this.stream(msg)
    );
  }
  stream?: (msg: string) => void;
  stop?: string[];

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
            Promise.resolve(_eval(...JSON.parse(decodeURIComponent("${encodeURIComponent(
              JSON.stringify(args)
            )}"))))
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
  }
}
