import { writeFileSync } from "fs";
import { Decoder, InterRes } from "../interactios";
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

const generateResponse = async (message: string) => {
  try {
    var response = "aaa";
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

export const Alpaca = async () => {
  const roles = new Roles({
    ai: "Response",
    system: "Input",
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
    debug: true,
    roles,
  });

  const initMessages = roles.replaceAll(
    ...SampleInits["traslate this"](await ctx.build_unique_prompt("###"), {
      chatName: "chatbot",
    })
  );

  initMessages.forEach((i, ix) => {
    if (ix > 0) console.log("");
    console.log(i);
  });

  process.exit(0);
};
