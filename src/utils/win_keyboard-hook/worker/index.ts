
import edge from 'edge-js';
import { parentPort } from 'worker_threads';
import { WorkerWrapper } from '../../WorkerWrapper';

const ws = new WorkerWrapper(process)

const keyListener = edge.func({
  assemblyFile: 'src\\utils\\win_keyboard-hook\\worker\\WinKeyboardHook.dll',
  references: ['System.Windows.Forms.dll'],
  typeName: 'WinKeyboardHook.KeyListener', // Agrega esta línea
  methodName: 'Start', // Agrega esta línea
});

keyListener(null, (error, result) => {
  if (error) {
    console.error(error);
  }
  console.log(result);
});