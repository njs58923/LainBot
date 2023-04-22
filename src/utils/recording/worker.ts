import { fork, ChildProcess } from 'child_process';
import { WorkerWrapper } from '../WorkerWrapper';

export const RecordWorker = (onResult: (...a: any[]) => void = () => { }) => {
  const worker = fork('./src/utils/recording/worker/index.ts');
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