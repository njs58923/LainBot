using System;
using System.Globalization;
using System.Speech.Synthesis;
using System.Threading.Tasks;

namespace TextToSpeechLibrary
{
  public class Result
  {
    String result = "";
    public Result(string r)
    {
      this.result = r;
    }
  }

  public class TextToSpeech
  {
    public Task<Object> Speak(string text)
    {
      using (var speechSynthesizer = new SpeechSynthesizer())
      {
        // Selecciona una voz que hable español
        var spanishVoice = GetSpanishVoice(speechSynthesizer);

        if (spanishVoice != null)
        {
          speechSynthesizer.SelectVoice(spanishVoice.VoiceInfo.Name);
          speechSynthesizer.Speak(text);
          var result = new Object();
          return Task.FromResult(new Result("Texto convertido a voz exitosamente") as Object);
        }
        else
        {
          var result = new Object();
          return Task.FromResult(new Result("No se encontró ninguna voz en español en el sistema") as Object);
        }
      }
    }

    private InstalledVoice GetSpanishVoice(SpeechSynthesizer synthesizer)
    {
      foreach (var voice in synthesizer.GetInstalledVoices())
      {
        if (voice.VoiceInfo.Culture.TwoLetterISOLanguageName.Equals("es", StringComparison.InvariantCultureIgnoreCase))
        {
          return voice;
        }
      }
      return null;
    }
  }
}
