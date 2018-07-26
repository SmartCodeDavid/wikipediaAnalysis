var db  = require('../db/db');
var articleModel = require('../models/ArticleModel');
var adminModel = require('../models/AdminModel');
var botModel = require('../models/BotModel');
var util = require('../controllers/Util');
var OverallInfo = require('../classes/Overall_Info');


var OverallController = {
    getOverallInfo: (req, res) => {
        articleModel.getOverallInfo(OverallInfo, ()=>{
            //build an array
            OverallInfo.showArray = [['Year', 'Administator', 'Anonymous', 'Bot', 'Regular user']].concat(util.buildArrayForShowingBarChart(OverallInfo));
            var jsonShowArray = JSON.stringify(OverallInfo.showArray);
            
            //show page
             showOverallPage(req, res, jsonShowArray);
        });
    },

    ////this function is used to handle ajax request
    grabInfoBasedOnNumber: (req, res) => {
        articleModel.grabInfoBasedOnNumber(req,OverallInfo,()=>{
            ////return json to ajax in client-side 
            res.json(OverallInfo);
        });
    }
};

//call this fucntion after data has been retrieved from db 
var showOverallPage = (req, res, jsonShowArray) => {
    console.log("Show overall page");
    res.render("overallanalytics", { login: req.session.login, username: req.session.username, page: "overall", signupPage: false, info: OverallInfo, jsonArray:jsonShowArray});
}

module.exports = OverallController;