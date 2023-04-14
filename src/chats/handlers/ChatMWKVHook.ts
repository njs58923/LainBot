import { GenericChatBot } from "./chatGPTHook";
import EventClient from "./utils/EventClient";

export class ChatMWKVHook implements GenericChatBot {
    client:EventClient

    onStream:any
    onResponse:any
    onError:any

    id: string

    //@ts-ignore
    async init({context=""}: {context?:string}={}){
        this.id = Math.floor(Math.random() * 999999999).toString()
        this.client = new EventClient();
        //@ts-ignore
        this.client.on('sendStream', (value)=>{
            this.onStream && this.onStream(value)
        });

        this.client.on('sendResponse', (value)=>{
            this.onResponse && this.onResponse(value)
        });
        this.client.on('sendError', (value)=>{
            this.onError && this.onError(value)
        });

        await new Promise(async complete=> {
            while(true){
                try {
                    console.log("Try connect...")
                    
                    await this.client.start(async ()=>{
                        console.log("Conectado!")
                        this.client.emit("initChat",  {name:  `chat-${this.id}`, context})
                        complete(1)
                    });
                } catch(err) {console.log(err)}
                await new Promise(rr=> setTimeout(rr,1))
            }
        })
    }

    //@ts-ignore
    sendMessage(message: string, args: { stream?: (msg: string) => void; stop?: string[]; }): Promise<string> {
        this.client.emit("sendMessage", { message, name: `chat-${this.id}` })
        this.onStream = args.stream;
        return new Promise((r,e)=>{
            this.onResponse = (message)=>{
                r(message)
            }
            this.onError = (err)=>{
                e(err)
            }
        })
    }

}
