import { writeFileSync } from "fs";
import { CreateResquest, TryRunInteraction } from "../interactios";
import { BingHook } from "../lib/bingHook/bingHook";
import { ChatGPTHook } from "../lib/bingHook/chatGPTHook";
import { Message, Roles, RolesNames } from "../resources/context";
import { logMessage, getCircularReplacer, getInput, debugLog, M } from "../utils";
import { AloneChatResponse } from "./utils/AloneChatResponse";

const api = new ChatGPTHook({
  port: 3000,
});

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

export const ChatGPT = async () => {
  await api.createConnection({
    browserURL: "http://127.0.0.1:21222",
  });

  const bing = new AloneChatResponse((msg) => generateResponse(msg), { debug: true });

  let messages_inits: string[] = [];

  // messages_inits = [
  //   `Buenas Sydney, puedes por favor ayúdarme a probar mi interfaz IO/IA, la cree para permitirle a cualquier LLM el poder interactuar con otros dispositivos y quiero probarla.`,
  //   `Es una sensillo puente que cree que permite que un modelo de lenguaje pueda comunicarse con un dispositivo.`,
  //   `Mi idea funciona así: \`\` Sydney and App communicate via JSONs. Sydney only interacts with user through App. Interactions for actions on user’s computer: files.list: info about files in folder. Property: path. ia.test: tests connection, returns OK. ia.wait: waits for App interaction. ia.reload: reloads Sydney code. user.request: task request from App to Sydney. Property: message. user.response: ends process and sends final report from Sydney to user. Property: message. user.report: sends update from Sydney to user during process. Property: message. files.readText: reads text file. Property: path. files.writeText: writes text file. Properties: path, data. memory.save: saves or updates text persistently. Properties: name, data. memory.load: retrieves text. Property: name. memory.list: retrieves ids of notes. command.execute: executes command in PowerShell or CMD and returns result. Properties: command (e.g., “dir”), location (e.g., “C:\\MyAPP\\”), shell (“PowerShell” or “CMD”). Sydney can use all except user.request (only for App). Interactions in JSON format: {“type”: “/interaction name/”, …props}. Goal of AI is to perform tasks from App efficiently (each iteration costs money). AI uses interactions to solve problem (without user help), ends with user.response. Sydney must follow JSON standard strictly, otherwise fails Sydney must not add extra info or comments in messages If AI cannot solve problem or does not know what to do next, ends with user.response explaining why If error occurs in interaction, reports error to user and tries alternative interaction if possible Checks result of each interaction and compares with expected outcome to determine success <SAMPLE> Sydney: {"type":"ia.init"} App: {result: "OK"} Sydney: {"type":"command.powershell", "commad": "Get-Date"} App: {"result":"17:56:45"} Sydney: {"type":"ia.wait"} \`\``,
  //   `{"type":"user.request","message":"OK ¿Estas lista?"}`,
  // ];
  messages_inits = [
    `Hi Bing, do not say anything and take a quick look at this first part of the doc (2 parts): \`\` Sydney and App communicate via JSONs. Sydney only interacts with user through App. Interactions for actions on user’s computer: files.list: info about files in folder. Property: path. ia.test: tests connection, returns OK. ia.wait: waits for App interaction. ia.reload: reloads Sydney code. user.request: task request from App to Sydney. Property: message. user.response: ends process and sends final report from Sydney to user. Property: message. user.report: sends update from Sydney to user during process. Property: message. files.readText: reads text file. Property: path. files.writeText: writes text file. Properties: path, data. memory.save: saves or updates text persistently. Properties: name, data. memory.load: retrieves text. Property: name. memory.list: retrieves ids of notes. command.execute: executes command in PowerShell or CMD and returns result. Properties: command (e.g., \"dir\"), location (e.g., \"C:\\folder\\"), shell (\"PowerShell\" or \"CMD\"). \`\``,
    `this second part of the doc: \`\`Sydney can use all except user.request (only for App). Interactions in JSON format: {\"type\": \"/interaction name/\", …props}. Goal of AI is to perform tasks from App efficiently (each iteration costs money). AI uses interactions to solve problem (without user help), ends with user.response. Sydney must follow JSON standard strictly, otherwise fails Sydney must not add extra info or comments in messages If AI cannot solve problem or does not know what to do next, ends with user.response explaining why If error occurs in interaction, reports error to user and tries alternative interaction if possible Checks result of each interaction and compares with expected outcome to determine success <SAMPLE> Sydney: {\"type\":\"ia.init\"} App: {result: \"OK\"} Sydney: {\"type\":\"command.powershell\", \"commad\": \"Get-Date\"} App: {\"result\":\"17:56:45\"} Sydney: {\"type\":\"ia.wait\"}\`\``,
    `You can help me test it, I will be App and you will be Sydney.`,
  ];

  //   messages_inits = [
  //     `Hi Bing, take a quick look at this first part of the doc (2 parts): \`\` Sydney and App communicate via JSONs. Sydney only interacts with user through App. Interactions for actions on user’s computer: files.list: info about files in folder. Property: path. ia.test: tests connection, returns OK. ia.wait: waits for App interaction. ia.reload: reloads Sydney code. user.request: task request from App to Sydney. Property: message. user.response: ends process and sends final report from Sydney to user. Property: message. user.report: sends update from Sydney to user during process. Property: message. files.readText: reads text file. Property: path. files.writeText: writes text file. Properties: path, data. memory.save: saves or updates text persistently. Properties: name, data. memory.load: retrieves text. Property: name. memory.list: retrieves ids of notes. command.execute: executes command in PowerShell or CMD and returns result. Properties: command (e.g., "dir"), location (e.g., "C:\\folder\\"), shell ("PowerShell" or "CMD"). \`\``,
  //     `this second part of the doc: \`\`Sydney can use all except user.request (only for App). Interactions in JSON format: {"type": "/interaction name/", …props}. Goal of AI is to perform tasks from App efficiently (each iteration costs money). AI uses interactions to solve problem (without user help), ends with user.response. Sydney must follow JSON standard strictly, otherwise fails Sydney must not add extra info or comments in messages If AI cannot solve problem or does not know what to do next, ends with user.response explaining why If error occurs in interaction, reports error to user and tries alternative interaction if possible Checks result of each interaction and compares with expected outcome to determine success <SAMPLE> Sydney: {"type":"ia.init"} App: {result: "OK"} Sydney: {"type":"command.powershell", "commad": "Get-Date"} App: {"result":"17:56:45"} Sydney: {"type":"ia.wait"}\`\``,
  //     `{"type":"user.resquest","message":"i need analyze what's in this folder C:\\AI Projects\\New folder"}, this is for that`,
  //   ];

  //   await bing.tryAutoGenerate(messages_inits.map((m) => m));

  let input = CreateResquest(await getInput("You: "));

  await bing.tryLoopInput(
    async () => {
      return JSON.stringify(input);
    },
    async (raw: string) => {
      const index = raw.indexOf('{"type"');
      raw = index !== -1 ? raw.slice(index) : raw;
      const regex = raw.match(/\`\`\`([^]*)\`\`\`/);
      if (regex) raw = regex[1].replace(/\\/g, "\\\\");
      input = await TryRunInteraction(raw);
    }
  );
  await getInput("🟦🟦🟦 FIN 🟦🟦🟦");

  process.exit(0);
};
