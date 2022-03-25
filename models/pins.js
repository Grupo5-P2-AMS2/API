const { ObjectId, Int32 } = require('mongodb');
var mongoose = require('mongoose');

var PinsSchema = new mongoose.Schema({
    pin:Number,
    userId:Number,
    VRtaskID:Number
});
module.exports = mongoose.model('Pins', PinsSchema, 'Pins');