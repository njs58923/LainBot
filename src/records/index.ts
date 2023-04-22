import { fork, ChildProcess } from 'child_process';

class WorkerWrapper {
  events: any = {}
  constructor(public worker: ChildProcess) {
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

export const RecordWorker = (onResult: (...a: any[]) => void = () => { }) => {
  const worker = fork('./src/records/worker/index.js');
  const msg = new WorkerWrapper(worker)

  msg.on('base64', onResult);

  return {
    start: () => msg.emit('recording-start'),
    finish: () => msg.emit('recording-stop'),
    isRecording: () => new Promise(resolve => {
      msg.once('isRecording', resolve)
      msg.emit('isRecording')
    }),
    status: () => new Promise(resolve => {
      msg.once('status', resolve)
      msg.emit('status')
    })
  }
}