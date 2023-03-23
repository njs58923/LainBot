import { Decoder } from "./interactios";
import { Roles } from "./resources/context";
import { getInput, LogColor, logMessage, M } from "./utils";

var interaction_debug = async () => {
  while (true) {
    let text = await getInput("Json: ");
    const result = await Decoder.tryInteractionRaw(text, {
      roles: new Roles({ ai: "Ai", system: "Bridge", context: "Context" }),
    });
    logMessage(M("#TEST", result));
    console.log("\n");
  }
};

interaction_debug();
