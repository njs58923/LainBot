import { writeFileSync } from "fs";
import { Env } from "../environment";
import { Decoder, ForceStop, InterRes } from "../interactions";
import { ChatGPTHook } from "./handlers/chatGPTHook";
import { BuildContext } from "../resources/context";
import { SampleInits, Samples } from "../resources/samples";
import { getCircularReplacer, getInput } from "../utils";
import { AloneChatResponse } from "./utils/AloneChatResponse";
import { Roles } from "../resources/utils/Roles";
import { InputInteractions, VoiceAndSpeech } from "../controller/VoiceAndSpeech";
import { PythonManager } from "./handlers/ChatMWKVHook";

const api = new ChatGPTHook({
  port: 3000,
});

const generateResponse = async (
  message,
  {
    roles,
    stream,
  }: { roles: Roles; stream?: ((msg: string) => void) | undefined }
) => {
  try {
    var response = await api.sendMessage(message, {
      stop: Decoder.getStop({ roles }),
      stream,
    });
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
  await api.init({
    browserURL: Env.BROWSER_HOOK_URL,
  });

  let roles: Roles = undefined as any;

  let role = 1;
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

  const controller = new AloneChatResponse(
    (msg, _, s) => generateResponse(msg, { roles, stream: s?.stream }),
    {
      debug: Env.isDebug,
      roles,
      forceEndPromp: ForceStop,
    }
  );

  // const ctx = new BuildContext({
  //   context: "context2",
  //   roles,
  //   samples: Samples.simple(roles).map((m) =>
  //     Decoder.parseMessage({
  //       role: m.role,
  //       content: m.content as InterRes[],
  //     })
  //   ),
  // });

  // await controller.tryAutoGenerate(
  //   roles.replaceAll(
  //     ...SampleInits["quiero que actues"](await ctx.build_unique_prompt("#"), {
  //       chatName: "chatbot",
  //     })
  //   )
  // );

  const a0 = new PythonManager()

  const a1 = new VoiceAndSpeech(a0.socket)

  // const a2 = new InputInteractions(a1,ctx, "#")

  await a0.start()

  await controller.tryLoopInput(
    () => a1.input(),
    (raw: string) => a1.output(raw)
  );
  
  await getInput("🟦🟦🟦 FIN 🟦🟦🟦");

  process.exit(0);
};
