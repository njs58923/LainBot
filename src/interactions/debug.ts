import { Decoder } from ".";
import { Roles } from "../resources/utils/Roles";
import { getInput, LogColor, logMessage, M } from "../utils";

var interaction_debug = async () => {
  while (true) {
    let text = await getInput("Json: ");
    const result = await Decoder.tryInteractionRaw(text, {
      roles: new Roles({ ai: "Ai", system: "Bridge", context: "Context" }),
      noInput: false,
    });
    logMessage(M("#TEST", result));
    app.logs.print("\n");
  }
};

interaction_debug();
