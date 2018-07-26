var db = require('../db/db');
var mongoose = require('mongoose');

var botSchema = new mongoose.Schema({
    name: String
});

var botModel = db.model('bot', botSchema);

module.exports = botModel;