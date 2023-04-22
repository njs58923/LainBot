import { fork, ChildProcess } from 'child_process';
import { WorkerWrapper } from '../WorkerWrapper';

export class KeyboardHookWorker {
  ws: WorkerWrapper
  constructor() {
    const worker = fork('./src/utils/win_keyboard-hook/worker/index.ts');
    this.ws = new WorkerWrapper(worker)
  }

  // speech(text: string) {
  //   return new Promise(resolve => {
  //     this.ws.once('finish', resolve)
  //     this.ws.emit('speech', text)
  //   })
  // }
}