const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000

var pepe = ["hola", "adios"];

app.get('/', function (req, res) {
  res.json(pepe)
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));