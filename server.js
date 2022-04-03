//Librerias
const express = require('express');
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose');
var cors = require('cors')
//Importamos los modelos
const UserModel = require('./models/users')
const CourseModel = require('./models/courses');
const PinsModel = require('./models/pins');
const functions = require('./functions');
var bodyParser = require("body-parser");
const { ConnectionPoolClosedEvent } = require('mongodb');
const { json } = require('express/lib/response');
//Nos conectamos al mongoAtlas
mongoose.connect('mongodb+srv://victor:WzRZK8JRGBo8dyML@cluster0.vudsg.mongodb.net/ClassVRroomDB?retryWrites=true&w=majority')


//app.use(function(req, res, next) {
  //Header para poder acceder a la API desde heroku (y para que no pete este)
  //res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", '*');
  //res.header('Access-Control-Allow-Methods', '*');
  //res.header('Allow', '*');
  //next();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
  
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
  //=====GET====
  // app.get('*', function (req, res) {
  //   res.send("Hello world!")
  // });
  
  router.get('/', function (req, res) {
    res.send("Hello world!")
  });
  
  //Ruta para ver los cursos
  router.get('/courses', function (req, res) {
    CourseModel.find(function (err, users) {
      if (err) {
        res.send(err);
      }
      res.json(users);
    });
  
  });
  
  //Ruta para ver los usuarios (alumnos y profesores)
  router.get('/users', function (req, res) {
    UserModel.find(function (err, users) {
      if (err) {
        res.send(err);
      }
      res.json(users);
    });
    
  });
  
  
  //Ruta login
  //Aqui lo que haremos sera lo siguiente:
  //1. Recoger los datos que nos llega con el req y comprobar si existen en la base de datos
  //2. Generar el token y meterlo en la base de datos
  
  router.get('/api/login',function(req,res){
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
          session_token = functions.get_token(docs[0]);
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
  });
  
  //Aqui solo tendremos que eliminar el token que nos llega de la base de datos
  router.get('/api/logout',function(req,res){
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
  });


  //Get course
  router.get('/api/get_courses', function(req,res){
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
            var array = [];
            for(var element of docs){
              for(var element2 of element.subscribers.teachers){
                var teacher = await UserModel.find({ ID: element2 })
                names.push(teacher[0].first_name)
              }
              element.subscribers.teachers = names;
              array.push(element)
            }
            res.json({"status":"OK","course_list":array})
            
          }
        })
      }
    })
  });

  //Get Course Details
  router.get('/api/get_course_details',function(req,res){
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
  });

  //GET Endpoint para el ERP de Navision
  //
  router.get('/api/export_database',function(req,res){
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

  });


  //GET Pin request
  //req: session_token, VRTaskID
  //res: pin
  router.get('/api/pin_request', async function(req,res){
    var boolean = false;
    //While para comprobar generar pin y comprobar que no este ya creado
    while(!boolean){
      var min = 0,
      max = 9999,
      pin = ("" + Math.floor(Math.random() * (max - min + 1))).substring(-4);
      //Si el pin no esta en la base de datos seguimos
      var query = await PinsModel.find({"pin":pin});
      if(query.length == 0 && String(pin).length == 4){
        boolean = true;
        var arrayUser = await UserModel.find({session_token:req.query.session_token});
        var arrayVRtaskID = await CourseModel.find({"vr_tasks.ID":req.query.VRtaskID});
        if(arrayUser[0] != undefined && req.query.session_token != undefined){
          if(arrayVRtaskID != [] && req.query.VRtaskID != undefined){ 
            PinsModel.insertMany({"pin":pin,"userId":arrayUser[0].ID,"VRtaskID":req.query.VRtaskID});
            res.json({"status":"OK","PIN":pin})
          }else{
            res.json({"status":"ERROR","message":"VRtaskID is required"})
          }
        }else{
          res.json({"status":"ERROR","message":"session_token is required"})
        }   
      }
    }
  });

  //GET start_vr_exercise
  //req: pin
  //res: username and VRExerciseID
  router.get('/api/start_vr_exercise', async function(req,res){

    if(!req.query.pin || String(req.query.pin).length != 4){
      res.json({"status":"ERROR","message":"PIN is required"})
    }else{
      var pin = await PinsModel.find({"pin":req.query.pin});

      var queryUsername = await UserModel.find({ID:pin[0].userId});
      var username = queryUsername[0].first_name;
      var course = await CourseModel.find({"vr_tasks.ID":pin[0].VRtaskID});
      
      for (var element of course[0].vr_tasks){
        if(element.ID == pin[0].VRtaskID){
          var exerciceID = element.VRexID;
        }
      }

      res.send({"status":"OK","username":username,"VRexerciceID":exerciceID});
    }
  });

  //=====POST=====

  //POST finish_vr_exercise
  //req: pin, autograde, exerciceVersionID
  router.post('/api/finish_vr_exercise', async function(req,res){
    try{
      console.log(req.body)
      if(!req.body.pin){
        res.json({"status":"ERROR","message":"PIN is required"})
      }else{
        if(!req.body.VRexerciseID){
          res.json({"status":"ERROR","message":"VRexerciseID is required"})
        }else{
          if(!req.body.exerciseVersionID){
            res.json({"status":"ERROR","message":"exerciseVersionID is required"})
          }else{
            var queryPin = await PinsModel.find({"pin":req.body.pin});
            var VRtaskID = queryPin[0].VRtaskID;
  
            var result = {"studentID":queryPin[0].userId,"autograde":req.body.autograde,"VRexerciseID":req.body.exerciseVersionID};
            await CourseModel.updateOne({"vr_tasks.ID":VRtaskID},{ $push: { "vr_tasks.$.completions": result }}).then( err => {
              if (err){
                  console.log( 'err', err)
                  return false;
              } else {
                  console.log("Document updated")
                  return true;
              }
              });
            res.json({"status":"OK","message":"Exercise data successfully stored."})
          }
        }
        
      }
    }catch(err){
      console.log("ERR:"+err)
    }
  });
  app.use("/", router);
//}); 


//Abertura de puerto para el server
app.listen(PORT, () => console.log(`Listening on https://localhost:${ PORT }`));