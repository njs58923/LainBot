import { AutoText } from "../chats/ChatMWKV";
import { EventClient } from "../chats/handlers/utils/EventClient";
import { Decoder } from "../interactions";
import { BuildContext } from "../resources/context";
import { M } from "../utils";
import { RecordingEvent } from "../utils/recording";
import { SpeechWorker } from "../utils/win_speech/worker";

export interface InputSource {
    input(): Promise<string>
    output(raw: string): Promise<void>
}

const speechWorker = new SpeechWorker();

export class VoiceAndSpeech implements InputSource {
    WaitMessage: (msg: string) => void;
    constructor(public client: EventClient) {


        RecordingEvent(async (base64Data) => {
            // inputMessage({ role: "You" })
            const list = await client.emit("support_list", undefined) as string[]
            const notFound = ["audio", "sendMessage"].filter(n => !list.includes(n))
            if (notFound.length > 0) {
                app.logs.print("Faltan los siguientes recursos " + notFound.join(", "))
                return;
            }
            const value: AutoText = await client.emit("audio", base64Data)
            let message = value.segments.map(i => i.text).join("\n");

            app.logs.print(`Audio a texto -> ${message}`)

            if (this.WaitMessage) this.WaitMessage(message)
        })
    }
    async input(..._: any) {
        return await (new Promise<string>((message) =>
            this.WaitMessage = message
        ))
    }

    async output(raw: string) {
        speechWorker.speech(raw)
    }
}

export class InputInteractions implements InputSource {
    result?: string
    constructor(public inputSource: InputSource, public ctx: BuildContext, public style: Parameters<BuildContext["build_sample"]>[1]) {
    }
    async input() {
        return await this.ctx.build_sample(M(this.ctx.roles.v.system, Decoder.createResquest(this.result || await this.inputSource.input())), this.style)
    }

    async output(raw: string) {
        this.result = this.ctx.build_sample(M(this.ctx.roles.v.system, await Decoder.tryInteractionRaw(raw, { roles: this.ctx.roles, noInput: false })), this.style);
    }
}