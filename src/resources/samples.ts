import { Decoder, Inter } from "../interactios";
import { M } from "../utils";
import { Roles, RolesType } from "./context";

export const Samples = {
  simple: (roles: Roles) => [
    {
      role: roles.v.system,
      content: [
        {
          type: "user.request",
          message: "¿Que hora es?",
        },
      ],
    },
    {
      role: roles.v.ai,
      content: [
        {
          id: "command0",
          type: "command.execute",
          commad: "Get-Date",
          shell: "PowerShell",
        },
        {
          type: "user.report",
          message: "try run 'Get-Date' in PowerShell...",
          shell: "PowerShell",
        },
      ],
    },
    {
      role: roles.v.system,
      content: [{ id: "command0", result: "17:56:45" }],
    },
    {
      role: roles.v.ai,
      content: [{ type: "user.response", message: "Son las 17:56:45" }],
    },
    {
      role: roles.v.system,
      content: [{ type: "user.request", message: "Buenas {{D}}, presentate." }],
    },
  ],
  multiFile: (roles: Roles) => [
    M<string, Inter[]>(roles.v.ai, [
      {
        id: "interactios",
        type: "files.readText",
        path: "C:\\Lain\\src\\interactios",
      },
      {
        id: "chatGPTHook",
        type: "files.readText",
        path: "C:\\Lain\\src\\lib\\bingHook\\chatGPTHook",
      },
      {
        id: "context",
        type: "files.readText",
        path: "C:\\Lain\\src\\resources\\context",
      },
      {
        id: "samples",
        type: "files.readText",
        path: "C:\\Lain\\src\\resources\\samples",
      },
      {
        id: "utils",
        type: "files.readText",
        path: "C:\\Lain\\src\\utils",
      },
      {
        id: "AloneChatResponse",
        type: "files.readText",
        path: "C:\\Lain\\src\\chats\\utils\\AloneChatResponse",
      },
    ]),
  ],
};

export const SampleInits = {
  "Ayudame a probar mi interfaz": [
    `Buenas {{D}}, puedes por favor ayúdarme a probar mi interfaz IO/IA, la cree para permitirle a cualquier LLM el poder interactuar con otros dispositivos y quiero probarla.`,
    `Es una sensillo puente que cree que permite que un modelo de lenguaje pueda comunicarse con un dispositivo.`,
    `Mi idea funciona así: \`\` {{D}} and {{S}} communicate via {{F}}. {{D}} only interacts with user through {{S}}. Interactions for actions on user’s computer: files.list: info about files in folder. Property: path. ia.test: tests connection, returns OK. ia.wait: waits for {{S}} interaction. ia.reload: reloads {{D}} code. user.request: task request from {{S}} to {{D}}. Property: message. user.response: ends process and sends final report from {{D}} to user. Property: message. user.report: sends update from {{D}} to user during process. Property: message. files.readText: reads text file. Property: path. files.writeText: writes text file. Properties: path, data. memory.save: saves or updates text persistently. Properties: name, data. memory.load: retrieves text. Property: name. memory.list: retrieves ids of notes. command.execute: executes command in PowerShell or CMD and returns result. Properties: command (e.g., “dir”), location (e.g., “C:\\MyAPP\\”), shell (“PowerShell” or “CMD”). {{D}} can use all except user.request (only for {{S}}). Interactions in {{F}} format: {“type”: “/interaction name/”, …props}. Goal of AI is to perform tasks from {{S}} efficiently (each iteration costs money). AI uses interactions to solve problem (without user help), ends with user.response. {{D}} must follow {{F}} standard strictly, otherwise fails {{D}} must not add extra info or comments in messages If AI cannot solve problem or does not know what to do next, ends with user.response explaining why If error occurs in interaction, reports error to user and tries alternative interaction if possible Checks result of each interaction and compares with expected outcome to determine success <SAMPLE> {{D}}: {"type":"ia.init"} {{S}}: {result: "OK"} {{D}}: {"type":"command.powershell", "commad": "Get-Date"} {{S}}: {"result":"17:56:45"} {{D}}: {"type":"ia.wait"} \`\``,
    `{"type":"user.request","message":"OK ¿Estas lista?"}`,
  ],
  "take a quick look": [
    `Hi Bing, take a quick look at this first part of the doc (2 parts): \`\` {{D}} and {{S}} communicate via {{F}}. {{D}} only interacts with user through {{S}}. Interactions for actions on user’s computer: files.list: info about files in folder. Property: path. ia.test: tests connection, returns OK. ia.wait: waits for {{S}} interaction. ia.reload: reloads {{D}} code. user.request: task request from {{S}} to {{D}}. Property: message. user.response: ends process and sends final report from {{D}} to user. Property: message. user.report: sends update from {{D}} to user during process. Property: message. files.readText: reads text file. Property: path. files.writeText: writes text file. Properties: path, data. memory.save: saves or updates text persistently. Properties: name, data. memory.load: retrieves text. Property: name. memory.list: retrieves ids of notes. command.execute: executes command in PowerShell or CMD and returns result. Properties: command (e.g., "dir"), location (e.g., "C:\\folder\\"), shell ("PowerShell" or "CMD"). \`\``,
    `this second part of the doc: \`\`{{D}} can use all except user.request (only for {{S}}). Interactions in {{F}} format: {"type": "/interaction name/", …props}. Goal of AI is to perform tasks from {{S}} efficiently (each iteration costs money). AI uses interactions to solve problem (without user help), ends with user.response. {{D}} must follow {{F}} standard strictly, otherwise fails {{D}} must not add extra info or comments in messages If AI cannot solve problem or does not know what to do next, ends with user.response explaining why If error occurs in interaction, reports error to user and tries alternative interaction if possible Checks result of each interaction and compares with expected outcome to determine success <SAMPLE> {{D}}: {"type":"ia.init"} {{S}}: {result: "OK"} {{D}}: {"type":"command.powershell", "commad": "Get-Date"} {{S}}: {"result":"17:56:45"} {{D}}: {"type":"ia.wait"}\`\``,
    `{"type":"user.request","message":"i need analyze what's in this folder C:\\\\AI Projects\\\\New folder"}, this is for that`,
  ],
  "traslate this": (context: string, { chatName }) => [
    "buenas " +
      chatName +
      ", me traduces esto al español\n\n" +
      context +
      "\n\npd: no traduscas los nombres de las interaciones, ni las key de los props.",
    "y que hace?",
    "y tú puedes simular ser {{D}} y yo {{S}}?",
  ],
  "me haces un resumen": (context: string, { chatName }) => [
    "buenas " +
      chatName +
      ", me haces un resumen de esto\n\n" +
      context +
      "\n\npd: no traduscas los nombres de las interaciones, ni las key de los props.",
    "y que hace?",
    "y tú puedes simular ser {{D}} y yo {{S}}?",
  ],
  "me haces un resumen muy corto": (context: string, { chatName }) => [
    "buenas " +
      chatName +
      ", me haces un resumen muy corto de esto\n\n" +
      context,
    // "y que hace?",
    "perfecto, ahora tú puedes simular ser {{D}} y yo {{S}}, asi puedes ayudarme a resolver problemas complejos.\nY aclaro, no quiero nada mas que uno solo ChatGPT: y sus interaciones, nada mas, no comentarios, no anotaciones, no avisos, no posibles resultadaos de la interacion, nada excepto tus interaciones.\n te parece bien?\npd: recuerda usar report de vez en cuando para ir informando y no respondas hasta terminar o fallar.\npd2: las interaciones se ejecutan todas al mismo tiempo, así que no puedes usar los resultado de una hasta que Bridge responda.",
  ],
  "quiero que actues": (context: string, { chatName }) => [
    "quiero que actues como {{D}} y yo {{S}}, asi puedes ayudarme como asistente con problemas mas complejos, las interaciones tienen prioridad sobre los comandos.\nY aclaro, no quiero nada mas que uno solo {{D}}: y sus interaciones en {{F}}, nada mas, no comentarios, no anotaciones, no avisos, no posibles resultadaos de la interacion, nada excepto tus interaciones.\npd: recuerda usar report de vez en cuando para tareas largas, y no respondas hasta terminar o fallar.\npd2: las interaciones se ejecutan todas al mismo tiempo, así que no puedes usar los resultado de una hasta que {{S}} responda.\n\n " +
      context,
  ],
};

/*

  -¿Cuanto es 2 + 3?
  -Believe me in "C:\Projects\" (create folder) a new project of a simple web in react that shows a gallery of kittens
  -arregla el problema que tengo en "C:\MyAPP\", el loop no llega hasta el 100 por algún motivo
  -solve the problem that I have in "C:\MyAPP\", the loop is broken
  -investiga esta api https://catfact.ninja/fact
  -Cuanto es 100 * 100?
  -ahora la prueba final.\n ve a esta carpeta C:\AI Projects y creame un proyecto en react simple que muestre solo una galeria de fotos de gatitos, no quiro nada muy complejo solo que funcione ya que es una prueba nomas, deberas interar muchas veces, sobre las fotos, en la misma carpeta hay un archivo que tiene todas las urls de las fotos, buscalo.
*/
