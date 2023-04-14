import "./environment";
// import { ChatBing } from "./chats/ChatBing";
// import { ChatGPT } from "./chats/ChatGPT";
//@ts-ignore
import { ChatMWKV } from "./chats/ChatMWKV";
import "./records/index2";
// import { GPT3Turbo } from "./chats/GPT3Turbo";
// import { Alpaca } from "./chats/Alpaca";

const start = ()=>{
    ChatMWKV();
}

//@ts-ignore
process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada sin manejo de errores:', reason);
    // Aquí puedes agregar lógica adicional para manejar el error.
});
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    
    setTimeout(() => {
        start();
    }, 1000);
    // Aquí puedes agregar lógica adicional para manejar el error, como reiniciar tu aplicación o enviar una notificación.
});

start()