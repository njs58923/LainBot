require("dotenv").config();
import { Configuration, OpenAIApi } from "openai";
import { build_prompt, build_messages, Roles, Message, build_messages_intructions } from "./resources/context";
import { writeFileSync } from "fs";
import { run_interactions } from "./interactios";
import { getInput, getCircularReplacer, logMessage, debugLog } from "./utils/index";
import { BingHook } from "./lib/bingHook/bingHook";

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
  messages.forEach((m) => logMessage(m));

  let input = { type: "user.request", message: await getInput("You: ") };

  while (input.message !== "bye") {
    const new_message = { role: Roles.system, content: JSON.stringify(input) };

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

  let messages: Message[] = [];
  let push = (message: Message) => {
    messages.push(message);
    logMessage(message);
  };

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

  const messages_inits = [
    `Buenas Sydney, puedes por favor ayúdarme a probar mi interfaz IO/IA, la cree para permitirle a cualquier LLM el poder interactuar con otros dispositivos y quiero probarla.`,
    `Es una sensillo puente que cree que permite que un modelo de lenguaje pueda comunicarse con un dispositivo.`,
    `Mi idea funciona así: \`\` Sydney and App communicate via JSONs. Sydney only interacts with user through App. Interactions for actions on user’s computer: files.list: info about files in folder. Property: path. ia.test: tests connection, returns OK. ia.wait: waits for App interaction. ia.reload: reloads Sydney code. user.request: task request from App to Sydney. Property: message. user.response: ends process and sends final report from Sydney to user. Property: message. user.report: sends update from Sydney to user during process. Property: message. files.readText: reads text file. Property: path. files.writeText: writes text file. Properties: path, data. memory.save: saves or updates text persistently. Properties: name, data. memory.load: retrieves text. Property: name. memory.list: retrieves ids of notes. command.execute: executes command in PowerShell or CMD and returns result. Properties: command (e.g., “dir”), location (e.g., “C:\\MyAPP\\”), shell (“PowerShell” or “CMD”). Sydney can use all except user.request (only for App). Interactions in JSON format: {“type”: “/interaction name/”, …props}. Goal of AI is to perform tasks from App efficiently (each iteration costs money). AI uses interactions to solve problem (without user help), ends with user.response. Sydney must follow JSON standard strictly, otherwise fails Sydney must not add extra info or comments in messages If AI cannot solve problem or does not know what to do next, ends with user.response explaining why If error occurs in interaction, reports error to user and tries alternative interaction if possible Checks result of each interaction and compares with expected outcome to determine success <SAMPLE> Sydney: {"type":"ia.init"} App: {result: "OK"} Sydney: {"type":"command.powershell", "commad": "Get-Date"} App: {"result":"17:56:45"} Sydney: {"type":"ia.wait"} \`\``,
    `{"type":"user.request","message":"OK ¿Estas lista?"}`,
  ];

  console.log(messages_inits);

  while (messages_inits.length > 0) {
    const text = await getInput("🔴 continuar...");

    messages.forEach((m) => debugLog(m));
    const instructions = { role: Roles.system, content: text || messages_inits.shift() || "" };
    push(instructions);

    let response = await generateResponse(instructions.content);
    push(response);
  }

  let input = { type: "user.request", message: await getInput("You: ") };

  while (input.message !== "bye") {
    const new_message = { role: Roles.system, content: JSON.stringify(input) };

    push(new_message);
    await getInput("🔴 continuar...");
    // await setTimeout(() => {}, 1000);
    let response = await generateResponse(new_message.content);
    console.log(response);
    const index = response.content.indexOf('{"type"');
    response.content = index !== -1 ? response.content.slice(index) : response.content;
    push(response);
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
      stop: [`\n${Roles.system}:`, `\n${Roles.ai}:`],
    });

    writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

    return response.data.choices[0]?.text?.trim();
  };

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
    input = await run_interactions(response);
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};

chat_Bing();

//{"read file": {"type":"files.readFileText", "path":"C:\\MyAPP\\Loop.cs"}}
//{"#":{"type":"user.request","message":"arregla el problema que tengo en \"C:\\MyAPP\", el loop no llega hasta el 100 por algún motivo"}}

//arregla el problema que tengo en "C:\MyAPP\", el loop no llega hasta el 100 por algún motivo
