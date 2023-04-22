import { inputMessage } from "../utils";
import { InputSource } from "./VoiceAndSpeech";

export class InputKeyboard implements InputSource {
    WaitMessage: (msg: string) => void;
    constructor() {

    }
    async input(..._: any) {
        return await inputMessage({ role: "You" })
    }

    async output(raw: string) {
        app.logs.print(raw)
    }
}