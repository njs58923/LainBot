require("dotenv").config();
import { Configuration, OpenAIApi } from "openai";
import { build_prompt, build_messages, roles } from "./resources/context";
import { writeFileSync } from "fs";
import { run_interactions } from "./interactios";
import { getInput, getCircularReplacer, logMessage, debugLog } from "./utils/index";
import { BingHook } from "./lib/bingHook";

const demo = 'solve the problem that I have in "C:\\MyAPP\\", the loop does not reach 100 for some reason, it is broken';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const chat_GPT3Turbo = async () => {
  let messages = build_messages();

  const generateResponse = async (messages) => {
    try {
      var response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.2,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [`\n${roles.system}:`, `\n${roles.ai}:`],
      });
    } catch (error: any) {
      if (error.response.data) console.log(error.response.data);
      else console.log(error);
      throw error;
    }

    writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

    return response.data.choices[0].message;
  };
  messages.forEach((m) => logMessage(m));

  let input = { type: "client.resquest", message: await getInput("You: ") };

  while (input.message !== "bye") {
    const new_message = { role: roles.system, content: JSON.stringify(input) };

    messages.push(new_message);
    logMessage(new_message);
    // await getInput("🔴 continuar...");
    await setTimeout(() => {}, 1000);
    let response = await generateResponse(messages);
    if (!response) throw new Error("JY1uT");
    response.content = response.content.slice(response.content.indexOf('{"type"'));
    messages.push(response);
    logMessage(response);
    input = await run_interactions(response.content);
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};

const chat_Bing = async () => {
  const api = new BingHook({
    port: 3000,
  });

  await api.createConnection();

  let messages = build_messages();

  const generateResponse = async (message) => {
    try {
      var response = await api.sendMessage(message);
    } catch (error: any) {
      if (error?.response?.data) console.log(error?.response?.data);
      else console.log(error);
      throw error;
    }

    writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

    return response;
  };

  let input = { type: "client.resquest", message: demo ?? (await getInput("You: ")) };

  messages.forEach((m) => debugLog(m));

  while (input.message !== "bye") {
    const new_message = { role: roles.system, content: JSON.stringify(input) };

    messages.push(new_message);
    debugLog(new_message);
    // await getInput("🔴 continuar...");
    await setTimeout(() => {}, 1000);
    let response = {
      role: roles.ai,
      content: await generateResponse(new_message.content),
    };
    response.content = response.content.slice(response.content.indexOf('{"type"'));
    messages.push(response);
    debugLog(response);
    input = await run_interactions(response.content);
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};

const chat_davinci = async () => {
  let prompt = build_prompt();

  const generateResponse = async (prompt) => {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.5,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [`\n${roles.system}:`, `\n${roles.ai}:`],
    });

    writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

    return response.data.choices[0]?.text?.trim();
  };

  let input = { type: "client.resquest", message: await getInput("You: ") };
  debugLog(input);
  while (input.message !== "bye") {
    const new_prompt = `${roles.system}: ` + JSON.stringify(input);
    debugLog(new_prompt);
    await getInput("🔴 continuar...");
    prompt += "\n" + new_prompt + `\n${roles.ai}: `;
    let response = await generateResponse(prompt);
    debugLog(`${roles.ai}: ${response}`);
    input = await run_interactions(response);
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};

chat_GPT3Turbo();

//{"read file": {"type":"files.readFileText", "path":"C:\\MyAPP\\Loop.cs"}}
//{"#":{"type":"client.resquest","message":"arregla el problema que tengo en \"C:\\MyAPP\", el loop no llega hasta el 100 por algún motivo"}}

//arregla el problema que tengo en "C:\MyAPP\", el loop no llega hasta el 100 por algún motivo
