
const mic = require('mic');
const streamBuffers = require('stream-buffers');
const { parentPort } = require('worker_threads');

class WorkerWrapper {
  events = {}
  worker = undefined
  constructor(worker) {
    this.worker = worker;
    process.on('message', ({ event, payload }) => {
      const { func, del } = this.events[event];
      func()
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
    process.send({ event, payload })
  }
}

const msg = new WorkerWrapper(parentPort)

let isRecording = false;
let micInstance = null;
let outputStream = null;
let writableStreamBuffer = null;

msg.on('recording-start', () => {
  process.stdout.write("[-")
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
  process.stdout.write("]")
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