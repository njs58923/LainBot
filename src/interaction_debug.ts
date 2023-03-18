import { TryRunInteraction } from "./interactios";
import { getInput } from "./utils";

var interaction_debug = async () => {
  while (true) {
    let text = (await getInput("Json: ")).replace(/“|”/g, '"');

    text = `Okay, let's use the \`files.list\` interaction to get information about the files in the folder \`C:\\AI Projects\\New folder\`. Here's the interaction message:

    \`\`\`
    {
      "type": "files.list",
      "path": "C:\\AI Projects\\New folder"
    }
    \`\`\`

    You should send this message to me as App, and I'll respond with a message containing information about the files in the specified folder.`;

    const regex = text.match(/\`\`\`([^]*)\`\`\`/);
    if (regex) text = regex[1].replace(/\\/g, "\\\\");
    console.log(`🟢${text.trim()}🟢`);
    console.log(`🟢${JSON.stringify(text.trim())}🟢`);

    const result = await TryRunInteraction(text.trim());
    let BgGray = "\x1b[90m";
    console.log(BgGray, JSON.stringify(result), "\x1b[0m");
    console.log("\n");
  }
};

interaction_debug();
