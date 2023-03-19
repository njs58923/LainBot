import { Decoder } from "./interactios";
import { getInput, LogColor, logMessage, M } from "./utils";

var interaction_debug = async () => {
  while (true) {
    let text = await getInput("Json: ");
    const result = await Decoder.tryInteractionRaw(text);
    logMessage(M("#TEST", result));
    console.log("\n");
  }
};

interaction_debug();
