
import edge from 'edge-js';
import { parentPort } from 'worker_threads';
import { WorkerWrapper } from '../../WorkerWrapper';

const ws = new WorkerWrapper(process)

ws.on('speech', (text) => {

  const TextToSpeech = edge.func({
    assemblyFile: 'src\\utils\\win_speech\\worker\\TextToSpeechLibrary.dll',
    typeName: 'TextToSpeechLibrary.TextToSpeech',
    methodName: 'Speak'
  });

  TextToSpeech(text, (error, result) => {
    if (error) {
      console.error('Error al convertir texto a voz:', error);
    }
  });
  ws.emit("finish")
});