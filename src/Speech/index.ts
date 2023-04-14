import edge from 'edge-js';

const TextToSpeech = edge.func({
  assemblyFile: 'C:/Mis cosas/Proyectos IA/Lain/libs/TextToSpeechLibrary/bin/Release/netstandard2.0/TextToSpeechLibrary.dll',
  typeName: 'TextToSpeechLibrary.TextToSpeech',
  methodName: 'Speak'
});

export const Speech = (text: string= 'Texto de ejemplo que quieres convertir a voz')=>{
    //@ts-ignore
    TextToSpeech(text, (error, result) => {
      if (error) {
        console.error('Error al convertir texto a voz:', error);
      }
    });
}