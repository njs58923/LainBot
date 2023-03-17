import { run_interactions } from "./interactios";
import { getInput } from "./utils";

var interactions_testing = async () => {
  while (true) {
    const text = (await getInput("Json: ")).replace(/“|”/g, '"');
    const result = await run_interactions(text);
    let BgGray = "\x1b[90m";
    console.log(BgGray, JSON.stringify(result), "\x1b[0m");
    console.log("\n");
  }
};

interactions_testing();
