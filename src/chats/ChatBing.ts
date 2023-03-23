import { writeFileSync } from "fs";
import { Environment } from "../environment";
import { Decoder, InterRes } from "../interactios";
import { BingHook } from "../lib/bingHook/bingHook";
import { BuildContext, Roles } from "../resources/context";
import { SampleInits, Samples } from "../resources/samples";
import {
  logMessage,
  getCircularReplacer,
  getInput,
  debugLog,
  M,
} from "../utils";
import { AloneChatResponse } from "./utils/AloneChatResponse";

const api = new BingHook({
  port: 3000,
});

const generateResponse = async (message: string) => {
  try {
    var response = await api.sendMessage(message);
  } catch (error: any) {
    if (error?.response?.data) console.log(error?.response?.data);
    else console.log(error);
    throw error;
  }

  writeFileSync(
    "last_response.json",
    JSON.stringify(response, getCircularReplacer())
  );

  return response;
};

export const ChatBing = async () => {
  await api.createConnection({
    browserURL: "http://127.0.0.1:21222",
  });

  const roles = new Roles({
    ai: "IA",
    system: "App",
    context: "system",
  });

  const ctx = new BuildContext({
    context: "context2b",
    roles,
    samples: Samples.simple(roles).map((m) =>
      Decoder.parseMessage({
        role: m.role,
        content: m.content as InterRes[],
      })
    ),
  });

  const controller = new AloneChatResponse((msg) => generateResponse(msg), {
    debug: Environment.isDebug,
    roles,
  });

  await controller.tryAutoGenerate(
    roles.replaceAll(
      ...SampleInits["traslate this"](await ctx.build_unique_prompt(":"), {
        chatName: "Bing",
      })
    )
  );

  let input = Decoder.createResquest(await getInput("You: "));

  await controller.tryLoopInput(
    async () => JSON.stringify(input),
    async (raw) => {
      input = await Decoder.tryInteractionRaw(raw, { roles });
    }
  );

  await getInput("🟦🟦🟦 FIN 🟦🟦🟦");

  process.exit(0);
};
