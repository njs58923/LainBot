import { app } from "../..";
import { GenericChatBot } from "./chatGPTHook";
import { EventClient } from "./utils/EventClient";

export class PythonManager {
    socket: EventClient
    constructor() {
        this.socket = new EventClient();
    }

    _onStart: ((p: PythonManager) => void)[] = []

    onStart(onStart: (p: PythonManager) => void) {
        this._onStart.push(onStart)
    }

    async start() {
        await new Promise(async complete => {
            while (true) {
                try {
                    await this.socket.start(async () => {
                        await Promise.all(this._onStart.map(e => Promise.resolve(e(this))))
                        app.logs.print("Conectado!")
                        complete(1)
                    });
                } catch (err) { app.logs.print(err) }
                await new Promise(rr => setTimeout(rr, 1))
            }
        })
    }
}

export class ChatMWKVHook implements GenericChatBot {
    client: PythonManager

    onStream: any
    onResponse: any
    onError: any

    id: string

    //@ts-ignore
    async init({ context = "", python }: { context?: string, python: PythonManager } = {}) {
        this.id = Math.floor(Math.random() * 999999999).toString()
        this.client = python;

        this.client.socket.on('sendStream', (value) => this.onStream && this.onStream(value));

        this.client.onStart(async (e) => {
            while (true) {
                const r = await e.socket.emit("initChat", { name: `chat-${this.id}`, context })
                if (r === true) return;
                await new Promise(r => setTimeout(r, 250))
            }
        })
    }

    //@ts-ignore
    async sendMessage(message: string, args: { stream?: (msg: string) => void; stop?: string[]; }): Promise<string> {
        this.onStream = args.stream;
        const { response, error } = await this.client.socket.emit("sendMessage", { message, name: `chat-${this.id}` })
        if (error) throw new Error(error?.message || "fail: sendMessage")
        return response
    }

}
