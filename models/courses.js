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
            uploads:[{studentID:Number,
                      text:String,
                      file:String,
                      grade:Number,
                      feedback:String

            }]}
    ],
    vr_tasks:[{ID:Number,
               title:String,
               description:String,
               VRexID:Number,
               versionID:Number,
               pollID:Number,
               completions:{studentID:Number,
                            position_data:[{
                                data:String
                            }]
               },
               autograde:[{passed_items:Number,
                           failed_items:Number,
                           comments:String
               }],
               grade:Number,
               feedback:String
    }]
});

module.exports = mongoose.model('Courses', CourseSchema, 'Courses');