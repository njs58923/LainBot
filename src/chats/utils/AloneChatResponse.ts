import { Message, Roles, RolesType } from "../../resources/context";
import { M, logMessage, debugLog, getInput } from "../../utils";

export class AloneChatResponse {
  list: Message[] = [];
  fistInput = false;
  debug = false;
  roles: Roles;
  forceEndPromp?: string;
  constructor(
    public generate: (text: string, list: Message[]) => Promise<string>,
    {
      debug = false,
      roles,
      initMessages = [],
      forceEndPromp,
    }: {
      debug?: boolean;
      roles: Roles;
      initMessages?: Message[];
      forceEndPromp?: string;
    }
  ) {
    this.forceEndPromp = forceEndPromp;
    this.debug = debug;
    this.roles = roles;
    this.list = initMessages;
  }
  async tryGenerate(text: string): Promise<string | undefined> {
    const m = M(this.roles.v.system, text);
    this.push(m);

    var fake;
    if (this.debug && !this.fistInput) {
      console.log("\n");
      const opt = (
        await getInput(
          `🔴 Debug: ${
            m.content.split(/\W+/).length * 1.33
          } tokens \n   1: omitir\n   2: editar\n   3: force end\n   4: fake\n   5: salir\n  option: `
        )
      ).toLocaleLowerCase();
      console.log("\n");

      if (opt === "1") return undefined;
      else if (opt === "2")
        return this.tryGenerate(
          await getInput("Nuevo prompt(Nada para cancelar): ")
        );
      else if (opt === "3" && this.forceEndPromp) return this.forceEndPromp;
      else if (opt === "4")
        fake = await getInput("Fake (Nada para cancelar): ");
      else if (opt === "5") process.exit();
      else if (opt) return this.tryGenerate(text);
    }
    this.fistInput = false;

    const r = fake || (await this.generate(m.content, this.list));

    this.push(M(this.roles.v.ai, r));
    return r;
  }

  push(m: Message) {
    this.list.push(m);
    logMessage(m);
  }

  async tryAutoGenerate(list: string[], hook?: (m: string) => string) {
    list = list.slice();
    while (list.length > 0) {
      const text = list.shift();
      if (!text) break;
      const replace = hook ? await hook(text) : null;
      if (replace || text) await this.tryGenerate(replace || text);
    }
  }

  async tryLoopInput(
    getProndt: () => Promise<string | undefined>,
    result: (result) => Promise<void>
  ) {
    while (true) {
      const input = await getProndt();
      if (!input) break;
      const re = await this.tryGenerate(input);
      if (re) await result(re);
    }
  }
}
