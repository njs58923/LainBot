import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";

interface Hook {
  sendMessage(content: string): Promise<void>;
}

export class BingHook {
  constructor(public setting: { port: number }) {}
  browser: Browser = undefined as any;
  page: Page = undefined as any;
  async createConnection() {
    const connect = async () => {
      const tslibContent = fs.readFileSync("node_modules/tslib/tslib.js", "utf8");

      this.browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:21222" });
      this.page = await this.browser.newPage();
      await this.page.goto("https://chat.openai.com/chat");

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

      await new Promise((r) => setTimeout(r, 2500 + Math.random()));

      await this.loadHook();
    };

    while (true) {
      console.log("Conectado...");
      return await connect();
    }
  }
  promises: Record<string, { r: (...any) => void; e: (...any) => void }> = {};
  promise_cound = 0;
  async evaluate(script, ...args) {
    return new Promise(async (r, e) => {
      const id = this.promise_cound++;
      this.promises[id] = { r, e };
      const code = `
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
    `;
      console.log(code);
      await new Promise((r) => setTimeout(r, 500 + Math.random()));
      this.page.evaluateHandle(code);
    });
    typeof this.evaluate === "function";
  }

  async loadHook() {
    // Init
    await this.evaluate(
      `()=>{
              window.hook = {
                  waitInput: async () => {
                      while (true) {
                          let conteiner = document.querySelector(".dark\\\\:bg-gray-700");
                          let input = conteiner?.querySelector("textarea");
                          let btn = conteiner?.querySelector("button");
                          if (!conteiner || !input || !btn) {
                              await new Promise((r) => setTimeout(r, 1000 + Math.random()));
                              continue;
                          }
                          break;
                      }
                  },
                  setInput: async (content) => {
                    let conteiner = document.querySelector(".dark\\\\:bg-gray-700");
                    let input = conteiner?.querySelector("textarea");
                    if(input){
                        input.outerText = content;
                        return true;
                    }
                    return false;
                  }

              }
          }
        `
    ).catch((e) => {
      console.error(e);
      throw e;
    });
    await new Promise((r) => setTimeout(r, 5000 + Math.random()));
  }

  async sendMessage(message: string) {
    console.log("F");

    const result = await this.evaluate(
      `
      async (message)=>{
        await hook.sendMessage(message);
      }
      `,
      message
    ).catch((e) => {
      console.error(e);
      throw e;
    });

    return `{"type":"ia.wait"}`;
  }
}
