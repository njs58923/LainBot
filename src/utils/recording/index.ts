// import readline from 'readline';
import { RecordWorker } from './worker';
import { KeyboardHookWorker } from '../win_keyboard-hook/worker';
import { app } from '../..';

export const RecordingEvent = (onAudio: (raw: string) => void = () => { }) => {
  const keyToDetect = 'a';

  //@ts-ignore
  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout
  // });

  process.stdin.setRawMode(true);
  // readline.emitKeypressEvents(process.stdin);

  const worker = RecordWorker(onAudio);

  app.screen.key("a", async () => {
    if (!(await worker.isRecording()))
      worker.start();
    else if ((await worker.isRecording()))
      worker.finish();
  })

  // new KeyboardHookWorker()

  // process.stdin.on('keypress', async (str, key) => {
  //   if (key.name === keyToDetect && !(await worker.isRecording()))
  //     worker.start();
  //   else if (key.name === keyToDetect && (await worker.isRecording()))
  //     worker.finish();

  //   if (key && key.ctrl && key.name === 'c') process.exit();
  // });

  // console.log(`Presiona y suelta la tecla '${keyToDetect}' para grabar y detener la grabación. Para salir, presiona CTRL+C.`);
}