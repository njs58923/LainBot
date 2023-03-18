import { writeFileSync } from "fs";
import { TryRunInteraction } from "../interactios";
import { Context } from "../resources/context";
import { Samples } from "../resources/samples";
import { getCircularReplacer, debugLog, getInput } from "../utils";
import { OpenAI } from "./utils/OpenAI";

export const roles = { ai: "AI", system: "App", context: "system" } as const;

const ctx = new Context({ context: "context", roles, samples: Samples.simple(roles) });

const generateResponse = async (prompt) => {
  const response = await OpenAI.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.5,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [`\n${ctx.roles.system}:`, `\n${ctx.roles.ai}:`],
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
    const new_prompt = `${ctx.roles.system}: ` + JSON.stringify(input);
    debugLog(new_prompt);
    await getInput("🔴 continuar...");
    prompt += "\n" + new_prompt + `\n${ctx.roles.ai}: `;
    let response = await generateResponse(prompt);
    debugLog(`${ctx.roles.ai}: ${response}`);
    input = await TryRunInteraction(response as string);
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};
