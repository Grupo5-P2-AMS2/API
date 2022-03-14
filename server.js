const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose');
//Importamos los modelos
const UserModel = require('./models/users')
const CourseModel = require('./models/courses')

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
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
