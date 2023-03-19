import { Decoder } from "./interactios";
import { getInput } from "./utils";

var interaction_debug = async () => {
  while (true) {
    let text = await getInput("Json: ");
    const result = await Decoder.tryInteractionRaw(text);
    let BgGray = "\x1b[90m";
    console.log(BgGray, result, "\x1b[0m");
    console.log("\n");
  }
};

interaction_debug();
