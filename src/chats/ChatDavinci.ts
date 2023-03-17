import { writeFileSync } from "fs";
import { TryRunInteraction } from "../interactios";
import { build_prompt, Roles } from "../resources/context";
import { getCircularReplacer, debugLog, getInput } from "../utils";
import { OpenAI } from "./utils/OpenAI";

const generateResponse = async (prompt) => {
  const response = await OpenAI.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.5,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [`\n${Roles.system}:`, `\n${Roles.ai}:`],
  });

  writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

  return response.data.choices[0]?.text?.trim();
};

export const ChatDavinci = async () => {
  let prompt = build_prompt();

  debugLog(prompt);

  let input = { type: "user.request", message: await getInput("You: ") };
  debugLog(input);

  while (input.message !== "bye") {
    const new_prompt = `${Roles.system}: ` + JSON.stringify(input);
    debugLog(new_prompt);
    await getInput("🔴 continuar...");
    prompt += "\n" + new_prompt + `\n${Roles.ai}: `;
    let response = await generateResponse(prompt);
    debugLog(`${Roles.ai}: ${response}`);
    input = await TryRunInteraction(response);
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};
