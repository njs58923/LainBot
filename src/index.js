const { Configuration, OpenAIApi } = require("openai");
const readline = require("readline");
const { build_prompt, build_messages, roles } = require("./resources/context");
const fs = require("fs");
const { run_interactions } = require("./interactios");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

const chat_GPT3Turbo = async () => {
  let messages = build_messages();

  const generateResponse = async (messages) => {
    try {
      var response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.5,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [`\n${roles.system}:`, `\n${roles.ai}:`],
      });
    } catch (error) {
      if (error.response.data) console.log(error.response.data);
      else console.log(error);
      throw error;
    }

    fs.writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

    return response.data.choices[0].message;
  };

  let input = { "#": { type: "client.resquest", message: 'fix the problem that I have in "C:\\MyAPP\\", the loop does not reach 100 for some reason' || (await getInput("You: ")) } };

  messages.forEach((m) => console.log(m));

  while (input !== "bye") {
    const new_message = { role: roles.system, content: JSON.stringify(input) };

    messages.push(new_message);
    console.log(new_message);

    let response = await generateResponse(messages);
    response.content = response.content.slice(response.content.indexOf("{"));
    messages.push(response);
    console.log(response);
    input = await run_interactions(response.content);
  }
  console.log("AI: Goodbye!");
  process.exit(0);
};

const chat_davinci = async () => {
  let prompt = build_prompt();

  const generateResponse = async (prompt) => {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.5,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [`\n${roles.system}:`, `\n${roles.ai}:`],
    });

    fs.writeFileSync("last_response.json", JSON.stringify(response, getCircularReplacer()));

    return response.data.choices[0].text.trim();
  };

  let input = { "#": { type: "client.resquest", message: 'fix the problem that I have in "C:\\MyAPP\\", the loop does not reach 100 for some reason' || (await getInput("You: ")) } };
  console.log(input);
  while (input !== "bye") {
    const new_prompt = `${roles.system}: ` + JSON.stringify(input);
    console.log(new_prompt);
    prompt += "\n" + new_prompt + `\n${roles.ai}: `;
    let response = await generateResponse(prompt);
    console.log(`${roles.ai}: ${response}`);
    input = await run_interactions(response);
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

chat_GPT3Turbo();

//{"read file": {"type":"files.readFileText", "path":"C:\\MyAPP\\Loop.cs"}}
//{"#":{"type":"client.resquest","message":"arregla el problema que tengo en \"C:\\MyAPP\", el loop no llega hasta el 100 por algún motivo"}}

//arregla el problema que tengo en "C:\MyAPP\", el loop no llega hasta el 100 por algún motivo
