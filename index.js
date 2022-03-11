const express = require('express');
const app = express();
const path = require('path');

var pepe ["hola", "adios"];

app.get('/', function (req, res) {
  res.send("hola como estamos");
});
