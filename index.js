const express = require('express');

var pepe = ["hola", "adios"];

app.get('/', function (req, res) {
  res.json(pepe);
});
