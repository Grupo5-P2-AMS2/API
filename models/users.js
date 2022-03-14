var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	ID:Number,
    first_name:String,
    last_name:String,
    email:String,
    role:String,
    session_token:String,
    session_token_expiration_date:Number
});

module.exports = mongoose.model('Users', UserSchema, 'Users');