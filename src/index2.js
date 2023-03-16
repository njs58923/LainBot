const { run_interactions } = require("./interactios");

var interactions_testing = () => {
  // Start listening for interactions from System
  process.stdin.on("data", async (data) => {
    const result = await run_interactions(data);
    console.log(result);
  });

  //{"read file": {"type":"files.readFileText", "path":"C:\\MyAPP\\Loop.cs"}}

  // Send a test interaction to System to confirm the connection
  console.log(JSON.stringify({ init: { type: "test.init" } }));
};

interactions_testing();
