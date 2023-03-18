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
          } tokens \n   1: omitir\n   2: editar\n   3: simulate(End)\n   4: simulate\n   5: salir\n  option: `
        )
      ).toLocaleLowerCase();
      console.log("\n");

      if (opt === "1") return undefined;
      if (opt === "2")
        return this.tryGenerate(
          await getInput("Nuevo prompt(Nada para cancelar): ")
        );
      if (opt === "3") return `{ "type": "user.response", "message": "END" }`;
      if (opt === "4")
        fake = await getInput("Fake response(Nada para cancelar): ");
      if (opt === "5") process.exit();
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
