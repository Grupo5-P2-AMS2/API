const { ObjectId, Int32 } = require('mongodb');
var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
    title: String,
    description: String,
    subscribers: Object,
    elements: Array,
    tasks: Array,
    vr_tasks: Array

});

module.exports = mongoose.model('Courses', CourseSchema, 'Courses');
