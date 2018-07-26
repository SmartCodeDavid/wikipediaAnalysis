var db = require('../db/db');
var md5 = require('md5');
var userModel = require('../models/UserModel');
var md5 = require('md5');

var SignUpController = {
    signUp: (req, res) => {
        //check username if exist on database
        userModel.find({username: req.body.username}, (err, result) => {
            if(result.length == 0) {
                var body = req.body;
                req.body.password = md5(req.body.password);
                console.log(body);
                var newUser = new userModel(body);
                newUser.save(() => {
                    console.log("save");
                    //save to session 
                    req.session.login = true;
                    req.session.username = body.username;
                    res.render('index', { login: req.session.login, username: req.session.username, signupPage: false, page: "home"});
                });
            }else{
                res.render('signup', { login: req.session.login, username: req.session.username, signupPage: true, alert: true });
            }
        });
    }
};

module.exports = SignUpController;