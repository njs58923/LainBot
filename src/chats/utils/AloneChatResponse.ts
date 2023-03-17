import { CreateResquest, TryRunInteraction } from "../../interactios";
import { Message, Roles } from "../../resources/context";
import { M, logMessage, debugLog, getInput } from "../../utils";

export class AloneChatResponse {
  list: Message[] = [];
  constructor(public generate: (text: string) => Promise<string>) {}
  async tryGenerate(text: string) {
    const m = M(Roles.system, text);
    this.push(m);
    const r = await this.generate(m.content);
    this.push(M(Roles.ai, r));
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
      const m = M(Roles.system, text);
      const replace = hook ? await hook(text) : null;
      this.list.forEach((m) => debugLog(m));
      if (replace || m.content) this.tryGenerate(replace || m.content);
    }
  }

  async tryLoopInput(getInput: () => Promise<string | undefined>, result: (result) => Promise<void>) {
    while (true) {
      const input = await getInput();
      if (!input) break;
      await result(await this.tryGenerate(input));
    }
  }
}
