const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000

var pepe = ["hola", "adios"];

app.get('/', function (req, res) {
  res.send("hola como estamos");
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));