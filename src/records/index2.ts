import readline from 'readline';
import mic from 'mic';
import streamBuffers from 'stream-buffers';



export const RecordingEvent = (onAudio:(raw:string)=>void =()=>{})=>{
  const keyToDetect = 'a';

  let isRecording = false;
  let micInstance = null;
  let outputStream = null;
  let writableStreamBuffer = null;

  function startRecording() {
    // console.log('Comenzando a grabar...');
    process.stdout.write("🔴")
    micInstance = mic({rate: '44100', channels: '1', debug: false, fileType: 'wav', device: "Micrófono (3- USB PnP Sound Device)"});
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
    process.stdout.write(".")
    // console.log('Deteniendo la grabación...');
    micInstance.stop();
    isRecording = false;

    const audioBuffer = writableStreamBuffer.getContents();
    const base64Audio = audioBuffer.toString('base64');
    // console.log('Audio en Base64:', base64Audio.length);
    onAudio(base64Audio)
  }

  //@ts-ignore
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  process.stdin.setRawMode(true);
  readline.emitKeypressEvents(process.stdin);

  //@ts-ignore
  process.stdin.on('keypress', (str, key) => {
    if (key.name === keyToDetect && !isRecording) {
      startRecording();
    } else if (key.name === keyToDetect && isRecording) {
      stopRecording();
    }

    if (key && key.ctrl && key.name === 'c') {
      process.exit();
    }
  });

  console.log(`Presiona y suelta la tecla '${keyToDetect}' para grabar y detener la grabación. Para salir, presiona CTRL+C.`);
}