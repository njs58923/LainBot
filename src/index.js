const { Configuration, OpenAIApi } = require("openai");
const readline = require("readline");
const fs = require("fs");
const { stringify } = require("flatted");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const context = fs.readFileSync("./src/resources/contex.txt", "utf8");

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

const generateResponse = async (prompt) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.5,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: ["\nSystem:", "\nAI:"],
  });

  fs.writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

  return response.data.choices[0].text.trim();
};

let prompt = context;
const chat = async () => {
  let input = await getInput("You: ");
  while (input !== "bye") {
    prompt += "\n" + `System: ${input}`;
    console.log(prompt);
    prompt += `\nAI: `;
    let response = await generateResponse(prompt);
    console.log(`AI: ${response}`);
    input = await getInput("You: ");
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};

const getInput = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

chat();
