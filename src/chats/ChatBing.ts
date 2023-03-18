import { writeFileSync } from "fs";
import {
  CreateResquest,
  TryRepairInteraction,
  TryRunInteraction,
} from "../interactios";
import { BingHook } from "../lib/bingHook/bingHook";
import { BuildContext, Roles } from "../resources/context";
import { Samples } from "../resources/samples";
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

const generateResponse = async (message) => {
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
    ai: "assistant",
    system: "user",
    context: "system",
  });

  const ctx = new BuildContext({
    context: "context2",
    roles,
    samples: Samples.simple(roles),
  });

  const controller = new AloneChatResponse((msg) => generateResponse(msg), {
    debug: true,
    roles,
  });

  let messages_inits: string[] = [ctx.build_unique_prompt("#")];

  await controller.tryAutoGenerate(roles.replaceAll(messages_inits));

  let input = CreateResquest(await getInput("You: "));

  await controller.tryLoopInput(
    async () => {
      return JSON.stringify(input);
    },
    async (raw) => {
      input = await TryRunInteraction(TryRepairInteraction(raw));
    }
  );
  await getInput("🟦🟦🟦 FIN 🟦🟦🟦");

  process.exit(0);
};
