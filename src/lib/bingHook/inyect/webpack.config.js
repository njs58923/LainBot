const path = require("path");

module.exports = {
  entry: "./src/index.js", // archivo de entrada js
  output: {
    filename: "bundle.js", // archivo de salida js
    path: path.resolve(__dirname, "dist"), // carpeta de destino
  },
};
