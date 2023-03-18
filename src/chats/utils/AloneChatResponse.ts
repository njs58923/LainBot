import { CreateResquest, TryRunInteraction } from "../../interactios";
import { Message, Roles, RolesType } from "../../resources/context";
import { M, logMessage, debugLog, getInput } from "../../utils";

export class AloneChatResponse {
  list: Message[] = [];
  fistInput = false;
  debug = false;
  roles: Roles;
  constructor(
    public generate: (text: string, list: Message[]) => Promise<string>,
    {
      debug = false,
      roles,
      initMessages = [],
    }: { debug?: boolean; roles: Roles; initMessages?: Message[] }
  ) {
    this.debug = debug;
    this.roles = roles;
    this.list = initMessages;
  }
  async tryGenerate(text: string) {
    const m = M(this.roles.v.system, text);
    this.push(m);

    if (this.debug && !this.fistInput) {
      const opt = (
        await getInput(
          `🔴 Debug: \n -1: omitir\n -2: editar\n -3: salir\noption: `
        )
      ).toLocaleLowerCase();
      if (opt === "1") return undefined;
      if (opt === "2") {
        const p = await getInput("Nuevo prompt(Nada para cancelar)");
        if (p) m.content = p;
      }
      if (opt === "3") return undefined;
    }
    this.fistInput = false;

    const r = await this.generate(m.content, this.list);

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
      const m = M(this.roles.v.system, text);
      const replace = hook ? await hook(text) : null;
      this.list.forEach((m) => debugLog(m));
      if (replace || m.content) this.tryGenerate(replace || m.content);
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
