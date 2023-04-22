import { writeFileSync } from "fs";
import { Env } from "../environment";
import { Decoder, ForceStop, InterRes } from "../interactions";
import { BuildContext } from "../resources/context";
//@ts-ignore
import { SampleInits, Samples } from "../resources/samples";
import { getCircularReplacer } from "../utils";
import { AloneChatResponse } from "./utils/AloneChatResponse";
import { Roles } from "../resources/utils/Roles";
import { ChatMWKVHook, PythonManager } from "./handlers/ChatMWKVHook";
import { VoiceAndSpeech } from "../controller/VoiceAndSpeech";

export type AutoText = {
  segments: Array<{
    start: number
    end: number
    text: string
  }>
  info: {
    language: string
    language_probability: number
  }
}


export const ChatMWKV = async () => {
  const api = new ChatMWKVHook();

  let roles: Roles = undefined as any;

  let role = 2;
  if (0 === role)
    roles = new Roles({
      ai: "IA",
      system: "App",
      context: "system",
    });

  if (1 === role)
    roles = new Roles({
      ai: "Lain",
      system: "Bridge",
      context: "system",
    });

  if (2 === role)
    roles = new Roles({
      system: "Q",
      ai: "A",
      context: "system",
    });

  const controller = new AloneChatResponse(
    (msg, _, s) => generateResponse(msg, { stream: s?.stream }),
    {
      stream: true,
      debug: Env.isDebug,
      roles,
      forceEndPromp: ForceStop,
    }
  );

  const ctx = new BuildContext({
    context: "simple_chat_corto",
    roles,
    samples: Samples.simple(roles).map((m) =>
      Decoder.parseMessage({
        role: m.role,
        content: m.content as InterRes[],
      })
    ),
  });

  const services = new PythonManager()

  await api.init({
    context: await ctx.build_unique_prompt(":"),
    python: services
  });

  const generateResponse = async (message, { stream }) => {
    try {
      var response = await api.sendMessage(message, {
        stop: Decoder.getStop({ roles }),
        stream,
      });
    } catch (error: any) {
      if (error?.response?.data) app.logs.print(error?.response?.data);
      else app.logs.print(error);
      throw error;
    }

    writeFileSync(
      "last_response.json",
      JSON.stringify(response, getCircularReplacer())
    );

    return response;
  };


  // await controller.tryAutoGenerate(
  //   roles.replaceAll(
  //     ...SampleInits["quiero que actues"](await ctx.build_unique_prompt("#"), {
  //       chatName: "chatbot",
  //     })
  //   )
  // );


  const ui = new VoiceAndSpeech(services.socket);

  await services.start()

  await controller.tryLoopInput(
    () => ui.input(),
    (raw: string) => ui.output(raw)
  );

  // await getInput("🟦🟦🟦 FIN 🟦🟦🟦");

};
