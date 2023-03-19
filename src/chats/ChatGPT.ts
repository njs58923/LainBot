import { writeFileSync } from "fs";
import {
  CreateResquest,
  TryRepairInteraction,
  TryRunInteraction,
} from "../interactios";
import { ChatGPTHook } from "../lib/bingHook/chatGPTHook";
import { BuildContext, Roles } from "../resources/context";
import { SampleInits, Samples } from "../resources/samples";
import { getCircularReplacer, getInput } from "../utils";
import { AloneChatResponse } from "./utils/AloneChatResponse";

const api = new ChatGPTHook({
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

export const ChatGPT = async () => {
  await api.createConnection({
    browserURL: "http://127.0.0.1:21222",
  });

  let roles: Roles = undefined as any;

  let role = 1;
  if (0 === role)
    roles = new Roles({ ai: "IA", system: "App", context: "system" });
  if (1 === role)
    roles = new Roles({
      ai: "ChatGPT",
      system: "Bridge",
      context: "system",
    });

  const controller = new AloneChatResponse((msg) => generateResponse(msg), {
    debug: true,
    roles,
  });

  const ctx = new BuildContext({
    context: "context2",
    roles,
    samples: Samples.simple(roles),
  });

  await controller.tryAutoGenerate(
    roles.replaceAll(
      ...SampleInits["me haces un resumen muy corto"](
        ctx.build_unique_prompt(":"),
        {
          chatName: "chatbot",
        }
      )
    )
  );

  let input = CreateResquest(await getInput("You: "));

  await controller.tryLoopInput(
    async () => {
      return JSON.stringify(input);
    },
    async (raw: string) => {
      input = await TryRunInteraction(TryRepairInteraction(raw));
    }
  );
  await getInput("🟦🟦🟦 FIN 🟦🟦🟦");

  process.exit(0);
};
