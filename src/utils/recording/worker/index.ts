
import mic from 'mic';
import streamBuffers from 'stream-buffers';
import { WorkerWrapper } from '../../WorkerWrapper';

const msg = new WorkerWrapper(process)

let isRecording = false;
let micInstance = null;
let outputStream = null;
let writableStreamBuffer = null;

msg.on('recording-start', () => {
  micInstance = mic({ rate: '44100', channels: '1', debug: false, fileType: 'wav', device: "Micrófono (3- USB PnP Sound Device)" });
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
});

msg.on('recording-stop', () => {
  micInstance.stop();
  isRecording = false;

  const audioBuffer = writableStreamBuffer.getContents();
  const base64Audio = audioBuffer.toString('base64');
  msg.emit("base64", base64Audio);
});

msg.on('isRecording', () => {
  msg.emit("isRecording", isRecording);
});

msg.on('status', () => {
  msg.emit("status", isRecording);
});