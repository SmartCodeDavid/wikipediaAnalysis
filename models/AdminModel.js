var db = require('../db/db');
var mongoose = require('mongoose');

var adminSchema = new mongoose.Schema({
    name: String
});

var adminModel = db.model('admin', adminSchema);

module.exports = adminModel;