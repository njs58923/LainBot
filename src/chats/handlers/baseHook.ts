import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import { debugLog } from "../../utils";
const fsp = require('fs').promises;

export class BaseHook {
  constructor(public setting: { port: number }) { }
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
        app.logs.print(e);
        throw e;
      });
  }

  async createConnection({ browserURL, goto }) {
    app.logs.print(browserURL)

    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.9';

    const connect = async () => {
      this.browser = await puppeteer.launch({
        headless: false, args: [
          '--disable-blink-features=AutomationControlled', // Desactiva la función de control de automatización
          '--no-sandbox', // Desactiva el modo de aislamiento del proceso
          '--disable-setuid-sandbox', // Desactiva el aislamiento basado en el usuario
        ]
      });
      this.page = await this.browser.newPage();

      process.on('SIGINT', () => {
        app.logs.print('SIGINT recibido. Cerrando el navegador...');
        this.page.close().then(() => {
          process.exit(0);
        });
      });

      process.on('SIGTERM', () => {
        app.logs.print('SIGTERM recibido. Cerrando el navegador...');
        this.page.close().then(() => {
          process.exit(0);
        });
      });

      try {
        const cookiesString = await fsp.readFile('./cookies.json');
        const cookies = JSON.parse(cookiesString);
        await this.page.setCookie(...cookies);
      } catch (error) {
        app.logs.print('No se encontraron cookies guardadas');
      }

      // Carga el localStorage guardado previamente, si existe
      try {
        const localStorageString = await fsp.readFile('./localStorage.json');
        const localStorageData = JSON.parse(localStorageString);
        for (const key in localStorageData) {
          await this.page.evaluate((key, value) => {
            localStorage.setItem(key, value);
          }, key, localStorageData[key]);
        }
      } catch (error) {
        app.logs.print('No se encontraron datos de localStorage guardados');
      }


      await this.page.setUserAgent(userAgent);
      await this.page.goto(goto);
      ;
      await this.page.waitForSelector('textarea', { timeout: 9999999, visible: true });

      await new Promise(r => setTimeout(r, 500))

      while (await this.page.evaluate(() => !!document.querySelector("*[id*=headlessui-dialog-panel] button"))) {
        await this.page.click("*[id*=headlessui-dialog-panel] button:last-child")
        await new Promise(r => setTimeout(r, 100))
      }

      const cookies = await this.page.cookies();
      await fsp.writeFile('./cookies.json', JSON.stringify(cookies));
      const localStorageData = await this.page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        return data;
      });
      await fsp.writeFile('./localStorage.json', JSON.stringify(localStorageData));

      const hasInyect = await this.page.evaluate("window.inyectOk");
      if (!hasInyect) {
        await this.inyectFile("node_modules/tslib/tslib.js");
        await new Promise((r) => setTimeout(r, 500 + Math.random()));
        await this.inyectFile("src/chats/handlers/inyect/dist/bundle.js");
      }
      await this.exposeFunction();
      return { hasInyect };
    };
    let value: Awaited<ReturnType<typeof connect>>;
    while (true) {
      app.logs.print("Conectado...");
      value = await connect();
      break;
    }
    return value;
  }

  async exposeFunction() {
    await this.page.exposeFunction(`promise_ok`, (id, ...args) => {
      if (!this.promises[id]) return;
      this.promises[id].r(...args);
      delete this.promises[id];
    });
    await this.page.exposeFunction(`promise_err`, (id, ...args) => {
      if (!this.promises[id]) return;
      this.promises[id].e(...args);
      delete this.promises[id];
    });
    await this.page.exposeFunction(`page_log`, (...args) => {
      debugLog(...args);
    });
    await this.page.exposeFunction(`page_type`, async (query, text) => {
      await this.page.type(query, text);
    });
    await this.page.exposeFunction(`page_click`, async (query) => {
      await this.page.click(query);
    });
    await this.page.exposeFunction(`page_focus`, async (query) => {
      await this.page.focus(query);
    });
    await this.page.exposeFunction(
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
    await this.page.exposeFunction(
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
