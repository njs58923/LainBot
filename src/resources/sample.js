[
  {
    by: "System",
    raw: {
      "#": {
        type: "user.resquest",
        message: 'arregla el problema que tengo en "C:\\MyAPP", el loop no llega hasta el 100 por algún motivo',
      },
    },
    raw: `{"#":{"type":"user.resquest","message":"arregla el problema que tengo en \"C:\\MyAPP\", el loop no llega hasta el 100 por algún motivo"}}`,
  },
  {
    by: "IA",
    raw: {
      "see MyAPP": {
        type: "files.allFiles",
        path: "C:\\MyAPP\\",
      },
      "#": {
        type: "report",
        message: "Buscando archivos en C:\\MyAPP\\",
      },
    },
  },
  {
    by: "System",
    raw: {
      "see MyAPP": [
        { name: ".vscode", type: "Folder", size: null },
        { name: "index.js", type: "File", size: 82 },
        { name: "package.json", type: "File", size: 201 },
        { name: "reglas.jsonc", type: "File", size: 3038 },
      ],
    },
  },
  {
    by: "IA",
    raw: {
      "see index.js": {
        type: "files.readFileText",
        path: "C:\\MyAPP\\index.js",
      },
      "#": {
        type: "report",
        message: "Mirando archivos en C:\\MyAPP\\index.js",
      },
    },
  },
  {
    by: "System",
    raw: {
      "see index.js": {
        fileName: "index.js",
        text: "for (let index = 0; index < 100; index++) {\n  console.log(index);\n}\n",
      },
    },
  },
  {
    by: "IA",
    raw: {
      "#": {
        type: "report",
        message: "Mirando archivos en C:\\MyAPP\\index.js",
      },
    },
  },
];
