var socket = io("http://localhost:3000");
socket.on("connect", function () {
  console.log("Conexión establecida con Node.js");
  socket.emit("hola", "Hola Node.js, soy la extensión de Chrome");
});
