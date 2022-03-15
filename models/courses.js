var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
    title:String,
    description:String,
	subscribers:{
        teachers:Array,
        students:Array
    },
    elements:Array,
    tasks:Array,
    vr_tasks:Array
});

module.exports = mongoose.model('Courses', CourseSchema, 'Courses');