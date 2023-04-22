import "./environment";
// import { ChatBing } from "./chats/ChatBing";
// import { ChatGPT } from "./chats/ChatGPT";
//@ts-ignore

import { ConsolaManager } from "./utils/console";
export const app = new ConsolaManager()
app.logs.print("Iniciando...")

import { ChatMWKV } from "./chats/ChatMWKV";
import { InitApp } from "./utils/uncaughtException";
// import { GPT3Turbo } from "./chats/GPT3Turbo";
// import { Alpaca } from "./chats/Alpaca";

InitApp(() => {
    ChatMWKV();
})