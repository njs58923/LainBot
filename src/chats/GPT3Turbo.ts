import { writeFileSync } from "fs";
import { ChatCompletionRequestMessage } from "openai";
import { Decoder } from "../interactios";
import { BuildContext, Message, Roles } from "../resources/context";
import { Samples } from "../resources/samples";
import { getCircularReplacer, logMessage, getInput, M } from "../utils";
import { AloneChatResponse } from "./utils/AloneChatResponse";
import { OpenAI } from "./utils/OpenAI";

const generateResponse = async (
  roles: Roles,
  messages: ChatCompletionRequestMessage[]
) => {
  try {
    var response = await OpenAI.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.3,
      max_tokens: 200,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [`\n${roles.v.system}:`, `\n${roles.v.ai}:`],
    });
  } catch (error: any) {
    if (error.response.data) console.log(error.response.data);
    else console.log(error);
    throw error;
  }

  writeFileSync(
    "last_response.json",
    JSON.stringify(response, getCircularReplacer())
  );

  return response.data.choices[0].message as Message | undefined;
};

export const GPT3Turbo = async () => {
  const roles = new Roles({
    ai: "assistant",
    system: "user",
    context: "system",
    format: Decoder.name,
  });

  const ctx = new BuildContext({
    context: "context2",
    roles,
    samples: Samples.simple(roles),
  });

  const controller = new AloneChatResponse(
    (msg, list) =>
      generateResponse(roles, list as any).then((i) => i?.content || ""),
    { debug: true, roles, initMessages: ctx.build_messages() }
  );

  controller.list.forEach((m) => logMessage(m));

  let input = Decoder.createResquest(await getInput("You: "));

  await controller.tryLoopInput(
    async () => {
      return JSON.stringify(input);
    },
    async (raw) => {
      input = await Decoder.tryInteractionRaw(raw);
    }
  );
  await getInput("🟦🟦🟦 FIN 🟦🟦🟦");

  process.exit(0);
};
