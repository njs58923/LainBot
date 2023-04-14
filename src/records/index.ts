

import mic from 'mic';
import streamBuffers from 'stream-buffers';
import ioHook from 'iohook';

console.log("AAAAAAA")

const keyToDetect = 65; // Tecla 'a' como ejemplo
let isRecording = false;
let micInstance = null;
let outputStream = null;
let writableStreamBuffer = null;

function startRecording() {
  console.log('Comenzando a grabar...');
  micInstance = mic({rate: '44100', channels: '2', debug: false, fileType: 'wav', device: "Micrófono (3- USB PnP Sound Device)"});
  outputStream = micInstance.getAudioStream();
  writableStreamBuffer = new streamBuffers.WritableStreamBuffer();

  outputStream.on('data', (data) => {
    writableStreamBuffer.write(data);
  });

  outputStream.on('error', (err) => {
    console.error('Error en el stream de audio:', err);
  });

  micInstance.start();
  isRecording = true;
}

function stopRecording() {
  console.log('Deteniendo la grabación...');
  micInstance.stop();
  isRecording = false;

  const audioBuffer = writableStreamBuffer.getContents();
  const base64Audio = audioBuffer.toString('base64');
  console.log('Audio en Base64:', base64Audio);

  // Envía el audio en Base64 por la red (por ejemplo, a través de una API)
  //sendAudio(base64Audio);
}

ioHook.on('keydown', (event) => {
  if (event.keycode === keyToDetect && !isRecording) {
    startRecording();
  }
});

ioHook.on('keyup', (event) => {
  if (event.keycode === keyToDetect && isRecording) {
    stopRecording();
  }
});

export const StartKeyListen = ()=>{
    ioHook.start(true);
}
