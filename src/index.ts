import "./environment";
// import { ChatBing } from "./chats/ChatBing";
// import { ChatGPT } from "./chats/ChatGPT";
//@ts-ignore
import { ChatMWKV } from "./chats/ChatMWKV";
import "./records/index2";
import { InitApp } from "./utils/uncaughtException";
// import { GPT3Turbo } from "./chats/GPT3Turbo";
// import { Alpaca } from "./chats/Alpaca";


InitApp(()=>{
    ChatMWKV();
})