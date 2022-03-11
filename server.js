const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;


app.get('/', function (req, res) {
  res.send("Hello world!")
});

//Retorno de datos de ejemplo
app.get('/datos', function (req, res) {
  MongoClient.connect('mongodb://localhost:27017', async function (err, client) {

        if (err) throw err;
    
        var db = client.db('EjemploProjecto');
        
        const findResult = await db.collection('Ejemplo').find().toArray();
        res.json(findResult);
    })
});
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
