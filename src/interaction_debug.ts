import { TryRunInteraction } from "./interactios";
import { getInput } from "./utils";

var interaction_debug = async () => {
  while (true) {
    const text = (await getInput("Json: ")).replace(/“|”/g, '"');
    const result = await TryRunInteraction(text);
    let BgGray = "\x1b[90m";
    console.log(BgGray, JSON.stringify(result), "\x1b[0m");
    console.log("\n");
  }
};

interaction_debug();
