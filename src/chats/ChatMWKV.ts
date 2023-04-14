import { writeFileSync } from "fs";
import { Env } from "../environment";
import { Decoder, ForceStop, InterRes } from "../interactions";
import { BuildContext } from "../resources/context";
//@ts-ignore
import { SampleInits, Samples } from "../resources/samples";
import { getCircularReplacer, getInput, inputMessage, M } from "../utils";
import { AloneChatResponse } from "./utils/AloneChatResponse";
import { Roles } from "../resources/utils/Roles";
import { ChatMWKVHook } from "./handlers/ChatMWKVHook";
import { RecordingEvent } from "../records/index2";
import { Speech } from "../Speech";

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
      (msg, _, s) => generateResponse(msg, { stream: s?.stream }),
      {
        stream: true,
        debug: Env.isDebug,
        roles,
        forceEndPromp: ForceStop,
      }
    );

    const ctx = new BuildContext({
      context: "simple_chat",
      roles,
      samples: Samples.simple(roles).map((m) =>
        Decoder.parseMessage({
          role: m.role,
          content: m.content as InterRes[],
        })
      ),
    });

    await api.init({
      context: await ctx.build_unique_prompt(":")
    });

    const generateResponse = async (message, {stream}) => {
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


  // await controller.tryAutoGenerate(
  //   roles.replaceAll(
  //     ...SampleInits["quiero que actues"](await ctx.build_unique_prompt("#"), {
  //       chatName: "chatbot",
  //     })
  //   )
  // );
  
  let WaitMessage:(msg:string)=>void;
  
  RecordingEvent((base64Data)=>{
    inputMessage({ role: "You" })
    api.client.emit("audio", base64Data)
    
    api.client.on('audio_text', (value:AutoText)=>{
        let message = value.segments.map(i=> i.text).join("\n");
        WaitMessage(message)
    });

  })

  const input = async ()=>{
    let message = await(new Promise<string>((message)=>{
      WaitMessage = message
    }))
    console.log(message+"\n")
    return ctx.build_sample(M(roles.v.system, Decoder.createResquest(message)),"")
  }


  await controller.tryLoopInput(
    async () => await input (),
    //@ts-ignore
    async (raw: string) => {
      Speech(raw)
      // input = await  inputMessage({ role: "You" });
      // input = ctx.build_sample(M(roles.v.system, await Decoder.tryInteractionRaw(raw, { roles, noInput: false })),":");
    }
  );
  await getInput("🟦🟦🟦 FIN 🟦🟦🟦");

};
