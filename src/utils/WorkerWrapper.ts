import { ChildProcess } from "child_process";

export class WorkerWrapper {
    events: any = {}
    constructor(public worker: any) {
        worker.on('message', ({ event, payload }: any) => {
            if (!(event in this.events)) return;
            const { func, del } = this.events[event];
            func(payload)
            if (del) delete this.events[event]
        });
    }

    on(event, func) {
        this.events[event] = {
            func,
            del: false
        }
    }

    once(event, func) {
        this.events[event] = {
            func,
            del: true
        }
    }

    emit(event, payload = undefined) {
        this.worker.send({ event, payload })
    }
}