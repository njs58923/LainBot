import { writeFileSync } from "fs";
import { ChatCompletionRequestMessage } from "openai";
import { Env } from "../environment";
import { Decoder, InterRes } from "../interactions";
import { BuildContext, Message } from "../resources/context";
import { Samples } from "../resources/samples";
import { getCircularReplacer, logMessage, getInput, M } from "../utils";
import { AloneChatResponse } from "./utils/AloneChatResponse";
import { OpenAI } from "./utils/OpenAI";
import { Roles } from "../resources/utils/Roles";

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
      presence_penalty: 0,
      stop: [`\n${roles.v.system}:`, `\n${roles.v.ai}:`],
    });
  } catch (error: any) {
    if (error.response.data) app.logs.print(error.response.data);
    else app.logs.print(error);
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
  });

  const ctx = new BuildContext({
    context: "context2",
    roles,
    samples: Samples.simple(roles).map((m) =>
      Decoder.parseMessage({
        role: m.role,
        content: m.content as InterRes[],
      })
    ),
  });

  const controller = new AloneChatResponse(
    (msg, list) =>
      generateResponse(roles, list as any).then((i) => i?.content || ""),
    { debug: Env.isDebug, roles, initMessages: ctx.build_messages() }
  );

  if (Env.isDebug) controller.list.forEach((m) => logMessage(m));

  let input = ctx.build_sample(
    M(roles.v.system, Decoder.createResquest(await getInput("You: "))),
    "#"
  );

  await controller.tryLoopInput(
    async () => {
      return input;
    },
    async (raw) => {
      input = await Decoder.tryInteractionRaw(raw, { roles, noInput: false });
    }
  );
  await getInput("🟦🟦🟦 FIN 🟦🟦🟦");

  process.exit(0);
};
