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
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
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
    var username = req.query.username;
    var password = req.query.password;
    var status,message = "";
    var session_token = null;
  
    UserModel.find({ first_name: username, password: password }, function (err, docs) {
        if(docs.length == 0){
          status = "ERROR";
          message = "Wrong credentials";
          res.json({'status':status,'message':message})
        }else{
          status = "OK";
          session_token = crypto.randomBytes(20).toString('hex');
          //session_token ='aa';
          //Me queda meterlo en la base de datos
          UserModel.updateOne({first_name: username, password: password}, 
            {session_token:session_token}, function (err, docs) {
            if (err){
                console.log(err)
            }
            else{
                console.log("Updated Docs : ", docs);
              }
          });
          res.send({'status':status,"session_token":session_token})
        }
    });
    
  
  })
  
  //Aqui solo tendremos que eliminar el token que nos llega de la base de datos
  app.get('/api/logout',function(req,res){
    UserModel.updateOne({ session_token: "aa" }, 
            {session_token:""}, function (err, docs) {
            if (err){
                console.log(err)
                res.json({'status':"ERROR","message":"session_token is required"});
            }
            else{
                console.log("Updated Docs : ", docs);
                res.json({'status':"OK","message":"Session successfully closed."});
            }
    });
  })
}); 


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
