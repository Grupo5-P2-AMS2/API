const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose');
//Importamos los modelos
const UserModel = require('./models/users')
const CourseModel = require('./models/courses');
const functions = require('./functions');
const crypto = require('crypto')
//Nos conectamos al mongoAtlas
mongoose.connect('mongodb+srv://victor:WzRZK8JRGBo8dyML@cluster0.vudsg.mongodb.net/ClassVRroomDB?retryWrites=true&w=majority')

//Rutas de la API tipo GET

app.get('/', function (req, res) {
  res.send("Hello world!")
});

//Ruta para ver los cursos
app.get('/courses', function (req, res) {
  CourseModel.find(function (err, users) {
    if (err) {
      res.send(err);
    }
    res.json(users);
  });

});

//Ruta para ver los usuarios (alumnos y profesores)
app.get('/users', function (req, res) {
  UserModel.find(function (err, users) {
    if (err) {
      res.send(err);
    }
    res.json(users);
  });
  
})


//Ruta login
//Aqui lo que haremos sera lo siguiente:
//1. Recoger los datos que nos llega con el req y comprobar si existen en la base de datos
//2. Generar el token y meterlo en la base de datos

app.get('/api/login',function(req,res){
  var username = req.body.username;
  var password = req.body.password;
  var status,message = "";
  var session_token = null;

  UserModel.find({ first_name: username, password: password }, function (err, docs) {
      if(docs.length == 0){
        status = "ERROR";
        message = "Wrong credentials";
        res.json({'status':status,'message':message})
      }else{
        status = "OK";
        session_token = crypto.randomBytes(20).toString(password);
        res.send({'status':status,"session_token":session_token})
        //Me queda meterlo en la base de datos
      }
  });
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();

})

//Aqui solo tendremos que eliminar el token que nos llega de la base de datos
app.get('/api/logout',function(req,res){
  UserModel.updateOne({ session_token: req.body.session_token }, {$set: {session_token: "0"}},
    function(error, info) {

  });
    

})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
