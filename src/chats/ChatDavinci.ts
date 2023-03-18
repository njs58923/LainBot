import { writeFileSync } from "fs";
import { TryRunInteraction } from "../interactios";
import { BuildContext, Roles } from "../resources/context";
import { Samples } from "../resources/samples";
import { getCircularReplacer, debugLog, getInput } from "../utils";
import { OpenAI } from "./utils/OpenAI";

export const roles = new Roles({ ai: "AI", system: "App", context: "system" });

const ctx = new BuildContext({ context: "context", roles, samples: Samples.simple(roles) });

const generateResponse = async (prompt) => {
  const response = await OpenAI.createCompletion({
    model: "text-davinci-002",
    prompt,
    temperature: 0.2,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [`\n${roles.v.system}:`, `\n${roles.v.ai}:`],
  });

  writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

  return response.data.choices[0]?.text?.trim();
};

export const ChatDavinci = async () => {
  let prompt = ctx.build_unique_prompt();

  debugLog(prompt);

  let input = { type: "user.request", message: await getInput("You: ") };
  debugLog(input);

  while (input.message !== "bye") {
    const new_prompt = `${roles.v.system}: ` + JSON.stringify(input);
    debugLog(new_prompt);
    await getInput("🔴 continuar...");
    prompt += "\n" + new_prompt + `\n${roles.v.ai}: `;
    let response = await generateResponse(prompt);
    debugLog(`${roles.v.ai}: ${response}`);
    input = await TryRunInteraction(response as string);
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};
