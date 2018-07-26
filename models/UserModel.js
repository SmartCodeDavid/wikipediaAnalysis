var db = require('../db/db');
var mongoose = require('mongoose');


var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    email: String
});

var userModel = db.model('User', userSchema);

module.exports = userModel;