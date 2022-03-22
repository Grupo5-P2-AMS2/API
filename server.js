const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose');
//Importamos los modelos
const UserModel = require('./models/users')
const CourseModel = require('./models/courses');
const functions = require('./functions');
const crypto = require('crypto');
const { ConnectionPoolClosedEvent } = require('mongodb');
//Nos conectamos al mongoAtlas
mongoose.connect('mongodb+srv://victor:WzRZK8JRGBo8dyML@cluster0.vudsg.mongodb.net/ClassVRroomDB?retryWrites=true&w=majority')


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();

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
          session_token = get_token(docs[0]);
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
    UserModel.updateOne({session_token: req.query.session_token }, 
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


  //Get course
  app.get('/api/get_courses', function(req,res){
    //1. Buscamos el usuario con ese token
    UserModel.find({ session_token:req.query.session_token}, function (err, docs) {
      if(docs.length == 0){
        res.json({"status":"ERROR","message":"session_token is required"})
      }else{
        var id = docs[0].ID;
        
        //2. Buscamos los cursos que tengan ese usuario
        CourseModel.find({$or:[{"subscribers.students":id},{"subscribers.teachers":id}]}, async function(err,docs){
          if(docs.length == 0){
            res.json({"status":"ERROR","message":"session_token is required"})
          }else{
            //for para mirar la id de cada usuario y buscarla
            //sacar el nombre y modificar la variable
            var names = []
            for(var element of docs){
              for(var element2 of element.subscribers.teachers){
                var teacher = await UserModel.find({ ID: element2 })
                names.push(teacher[0].first_name)
              }
              element.subscribers.teachers = names;
            }
            res.json({"status":"OK","course_list":element})
            
          }
        })
      }
    })
  })

  //Get Course Details
  app.get('/api/get_course_details',function(req,res){
    //1. Buscamos el usuario con ese token
    var _id = req.query.courseID;
    UserModel.find({ session_token:req.query.session_token}, function (err, docs) {
      if(docs.length == 0){
        res.json({"status":"ERROR","message":"Insufficient permissions."})
      }else{
        var id = docs[0].ID;//Almacenamos la id del usuario
        //2. Buscamos que exista el courseID
        //3. Buscamos los cursos que tengan ese usuario
        CourseModel.find({$and :[{$or:[{"subscribers.students":id},{"subscribers.teachers":id}]},{"_id":_id}]},function(err,docs){
          if(docs.length == 0){
            res.json({"status":"ERROR","message":"courseID is required"})
          }
          else{
            res.json({"status":"OK","course":docs})
          }
        })
      }
    })
  })

  //Endpoint para el ERP de Navision
  app.get('/api/export_database',function(req,res){
    var user = req.query.user;
    var password = req.query.password;
    UserModel.find({ first_name: user, password: password }, function (err, docs) {
          if(docs.length == 0){
            res.json({"status":"ERROR","message":"Insufficient permissions."})
          }else{
            CourseModel.find({}, function (err, docs) {
              res.json({"status":"OK","course_list":docs})
            })
          }
    })

  })


}); 


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

//Esto lo tengo que meter en functions.js
function get_token(user) {
  if (user.session_token != '') {
    if (Date.now() < user.session_token_expiration_date) {
      return user.session_token;
    }
  }
  var random = Math.floor(Math.random() * 1000);
  var new_token = crypto.createHash('md5').update(user.first_name + user.password + random).digest('hex');
  var expiration_time = new Date(parseInt(Date.now()) + parseInt(process.env.TOKEN_EXPIRATION_TIME));
  
  UserModel.updateOne({first_name: user.first_name, password: user.password}, 
    {session_token_expiration_date: expiration_time}, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Updated Docs : ", docs);
      }
  });
  return new_token;
}