import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";

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
      this.browser = await puppeteer.connect({ browserURL });
      this.page = await this.browser.newPage();
      await this.page.goto(goto);
      await this.inyectFile("node_modules/tslib/tslib.js");
      await new Promise((r) => setTimeout(r, 500 + Math.random()));
      await this.inyectFile("src/lib/bingHook/inyect/dist/bundle.js");

      this.exposeFunction();

      console.log("Loading node_modules/tslib/tslib.js");
      await this.evaluate("await chatBing.waitLoading()");
      console.log("🟢 node_modules/tslib/tslib.js");
      console.log("");
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
  }
}