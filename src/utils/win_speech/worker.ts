import { fork, ChildProcess } from 'child_process';
import { WorkerWrapper } from '../WorkerWrapper';

export class SpeechWorker {
  ws: WorkerWrapper
  constructor() {
    const worker = fork('./src/utils/win_speech/worker/index.ts');
    this.ws = new WorkerWrapper(worker)
  }

  speech(text: string) {
    return new Promise(resolve => {
      this.ws.once('finish', resolve)
      this.ws.emit('speech', text)
    })
  }
}