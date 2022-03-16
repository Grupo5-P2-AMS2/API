const { ObjectId, Int32 } = require('mongodb');
var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
    title:String,
    description:String,
	subscribers:{
        teachers:Array,
        students:Array
    },
    elements:[{ID:Number,
                type:String,
                title:String,
                description:String,
                order:Number,
                contents:String
            }],
    tasks:[{ID:Number,
            type:String,
            title:String,
            description:String,
            order:Number,
            uploads:[{

            }]}
    ],
    vr_tasks:Array
});

module.exports = mongoose.model('Courses', CourseSchema, 'Courses');