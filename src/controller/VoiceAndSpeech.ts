import { Speech } from "../Speech";
import { AutoText } from "../chats/ChatMWKV";
import EventClient from "../chats/handlers/utils/EventClient";
import { Decoder } from "../interactions";
import { RecordingEvent } from "../records/index2";
import { BuildContext } from "../resources/context";
import { M } from "../utils";

export interface InputSource {
    input():Promise<string>
    output(raw:string):Promise<void>
}

export class VoiceAndSpeech implements InputSource{
    WaitMessage:(msg:string)=>void;
    constructor(public client: EventClient){
  
        RecordingEvent((base64Data)=>{
            // inputMessage({ role: "You" })
            client.emit("audio", base64Data)
            
            client.on('audio_text', (value:AutoText)=>{
                let message = value.segments.map(i=> i.text).join("\n");
                this.WaitMessage(message)
            });

        })
    }
    async input(..._:any){
        return await(new Promise<string>((message)=>{
            this.WaitMessage = message
        }))
    }

    async output(raw: string){
        Speech(raw)
    }
}

export class InputInteractions implements InputSource{
    result?: string
    constructor(public inputSource: InputSource, public ctx: BuildContext, public style: Parameters<BuildContext["build_sample"]>[1]){
    }
    async input(){
        return await this.ctx.build_sample(M(this.ctx.roles.v.system, Decoder.createResquest(this.result || await this.inputSource.input())),this.style)
    }

    async output(raw: string){
        this.result = this.ctx.build_sample(M(this.ctx.roles.v.system, await Decoder.tryInteractionRaw(raw, { roles:this.ctx.roles, noInput: false })),this.style);
    }
}