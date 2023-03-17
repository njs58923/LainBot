import { writeFileSync } from "fs";
import { TryRunInteraction } from "../interactios";
import { build_messages, Message, Roles } from "../resources/context";
import { getCircularReplacer, logMessage, getInput } from "../utils";
import { OpenAI } from "./utils/OpenAI";

const GenerateResponse = async (messages) => {
  try {
    var response = await OpenAI.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.2,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [`\n${Roles.system}:`, `\n${Roles.ai}:`],
    });
  } catch (error: any) {
    if (error.response.data) console.log(error.response.data);
    else console.log(error);
    throw error;
  }

  writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

  return response.data.choices[0].message as Message | undefined;
};

export const GPT3Turbo = async () => {
  let messages = build_messages();

  messages.forEach((m) => logMessage(m));

  let input = { type: "user.request", message: await getInput("You: ") };

  while (input.message !== "bye") {
    const new_message = { role: Roles.system, content: JSON.stringify(input) };

    messages.push(new_message);
    logMessage(new_message);
    // await getInput("🔴 continuar...");
    await setTimeout(() => {}, 1000);
    let response = await GenerateResponse(messages);
    if (!response) throw new Error("JY1uT");
    response.content = response.content.slice(response.content.indexOf('{"type"'));
    messages.push(response);
    logMessage(response);
    input = await TryRunInteraction(response.content);
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};
