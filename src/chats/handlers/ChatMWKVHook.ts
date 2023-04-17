import { GenericChatBot } from "./chatGPTHook";
import EventClient from "./utils/EventClient";

export class PythonManager{
    socket:EventClient
    constructor(){
        this.socket = new EventClient();
    }

    _onStart:((p:PythonManager)=> void)[] = []

    onStart(onStart: (p:PythonManager)=> void){
        this._onStart.push(onStart)
    }

    async start(onStart = ()=> {}){
        await new Promise(async complete=> {
            while(true){
                try {
                    console.log("Try connect...")
                    
                    await this.socket.start(async ()=>{
                        this._onStart.forEach(e=> e(this))
                        onStart()
                        console.log("Conectado!")
                        complete(1)
                    });
                } catch(err) {console.log(err)}
                await new Promise(rr=> setTimeout(rr,1))
            }
        })
    }
}

export class ChatMWKVHook implements GenericChatBot {
    client:PythonManager

    onStream:any
    onResponse:any
    onError:any

    id: string

    //@ts-ignore
    async init({context="", python}: {context?:string, python: PythonManager}={}){
        this.id = Math.floor(Math.random() * 999999999).toString()
        this.client = python;
        //@ts-ignore
        this.client.socket.on('sendStream', (value)=>{
            this.onStream && this.onStream(value)
        });

        this.client.socket.on('sendResponse', (value)=>{
            this.onResponse && this.onResponse(value)
        });
        this.client.socket.on('sendError', (value)=>{
            this.onError && this.onError(value)
        });

        this.client.onStart((s)=>{
            s.socket.emit("initChat",  {name:  `chat-${this.id}`, context})
        })
    }

    //@ts-ignore
    sendMessage(message: string, args: { stream?: (msg: string) => void; stop?: string[]; }): Promise<string> {
        this.client.socket.emit("sendMessage", { message, name: `chat-${this.id}` })
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
