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
  MongoClient.connect('mongodb+srv://victor:WzRZK8JRGBo8dyML@cluster0.vudsg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', async function (err, client) {
        if (err) throw err;
    
        var db = client.db('ClassVRroomDB');
        
        const findResult = await db.collection('Courses').find().toArray();
        res.json(findResult);
    })
});
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
