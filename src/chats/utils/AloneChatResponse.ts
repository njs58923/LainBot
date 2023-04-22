import { Message } from "../../resources/context";
import { M, logMessage, getInput } from "../../utils";
import { encode } from "gpt-3-encoder";
import { Env } from "../../environment";
import { Decoder } from "../../interactions";
import { Roles } from "../../resources/utils/Roles";
import { app } from "../..";

export class AloneChatResponse {
  list: Message[] = [];
  fistInput = false;
  debug = false;
  hasStream = false;
  roles: Roles;
  forceEndPromp?: string;
  constructor(
    public generate: (
      text: string,
      list: Message[],
      args?: { stream?: (msg: string) => void }
    ) => Promise<string>,
    {
      stream,
      debug = false,
      roles,
      initMessages = [],
      forceEndPromp,
    }: {
      stream?: boolean;
      debug?: boolean;
      roles: Roles;
      initMessages?: Message[];
      forceEndPromp?: string;
    }
  ) {
    this.forceEndPromp = forceEndPromp;
    this.hasStream = stream;
    this.debug = debug;
    this.roles = roles;
    this.list = initMessages;
  }
  async tryGenerate(text: string): Promise<string | undefined> {
    let m = M(this.roles.v.system, text);
    this.push(m);

    var fake;
    if (this.debug && !this.fistInput) {
      console.log("\n");
      const opt = (
        await getInput(
          `🔴 Debug: ${encode(m.content).length
          } tokens \n   1: Omitir\n   2: Editar\n   3: Forzar final\n   4: Reemplazar respuesta\n   5: Capturar ultimo respuesta\n   6: Salir\n  Opciones: `
        )
      )
        .toLocaleLowerCase()
        .trim();
      console.log("\n");

      if (opt === "1") return undefined;
      else if (opt === "2")
        return this.tryGenerate(
          await getInput("Nuevo prompt(Nada para cancelar): ")
        );
      else if (opt === "3" && this.forceEndPromp) return this.forceEndPromp;
      else if (opt === "4")
        fake = await getInput("Reemplazar respuesta (Nada para cancelar): ");
      else if (opt === "5") m = M(this.roles.v.system, text);
      else if (opt === "6") process.exit();
      else if (opt) return this.tryGenerate(text);
    }
    this.fistInput = false;



    if (this.hasStream) {
      logMessage({ ...M(this.roles.v.ai, ""), noEnd: (...args: string[]) => process.stdout.write(args.join("")) })
      var lastMessage = M(this.roles.v.ai, "");
      this.push(lastMessage);
    }
    const r =
      fake ||
      (await this.generate(m.content, this.list, {
        stream: (newPart) => {
          if (this.hasStream) {
            process.stdout.write(newPart);
            lastMessage.content += newPart
          }
          app.messages.setMessages(this.list)
        },
      }));

    if (!this.hasStream) this.push(M(this.roles.v.ai, r));
    return r;
  }

  push(m: Message) {
    this.list.push(m);
    if (Env.isDebug && !this.hasStream) logMessage(m);
  }

  async tryAutoGenerate(list: string[], hook?: (m: string) => string) {
    list = list.slice();
    while (list.length > 0) {
      const text = list.shift();
      if (!text) break;
      const replace = hook ? await hook(text) : null;
      if (replace || text) {
        const result = await this.tryGenerate(replace || text);
        if (result)
          await Decoder.tryInteractionRaw(result, {
            roles: this.roles,
            noInput: true,
          });
      }
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
