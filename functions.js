const crypto = require('crypto');
const UserModel = require('./models/users');
const CourseModel = require('./models/courses');
const PinsModel = require('./models/pins');
const functions = require('./functions');
module.exports = {
    
    generateRandomString : function(num) {
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result1= ' ';
        const charactersLength = characters.length;
        for ( let i = 0; i < num; i++ ) {
            result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result1;
    },
    //Esto lo tengo que meter en functions.js
    get_token: function(user) {
        if (user.session_token != '') {
        if (Date.now() < user.session_token_expiration_date) {
            return user.session_token;
        }
        }
        var random = Math.floor(Math.random() * 1000);
        var new_token = crypto.createHash('md5').update(user.first_name + user.password + random).digest('hex');
        var expiration_time = new Date(parseInt(Date.now()) + parseInt(process.env.TOKEN_EXPIRATION_TIME));
        
        UserModel.updateOne({first_name: user.first_name, password: user.password}, 
        {session_token_expiration_date: process.env.TOKEN_EXPIRATION_TIME});
        return new_token;
    }
}
