var db  = require('../db/db');
var userModel = require('../models/UserModel');
var md5 = require('md5');

var LoginController = {
    checkLoginWithUser: (req, res) => {
        var username = req.body.username;
        var passwd   = req.body.password;
        userModel.findOne({ username: username, password: md5(passwd) }, (err, result) => {
            if(err) {
                console.log('error');
            }
            if (result) {
                req.session.login = true;
                req.session.username = username;
                res.send({ 'result': 'success' });
            }else{
                res.send({ 'result': 'fail' });
            }
        });
    }
};

module.exports = LoginController;