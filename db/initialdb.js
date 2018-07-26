var fs = require('fs');
var db = require('./db');
var articleModel = require('../models/ArticleModel');
var adminModel = require('../models/AdminModel');
var botModel = require('../models/BotModel');
var fileArray = [];
// var dirPath = __dirname + "/../DataSet/revisions/"; ///Users/David/Desktop/COMP_5347/Assignment/Dataset/revisions
var dirPath = "/Users/David/Desktop/COMP_5347/Assignment/Dataset/revisions/";
var data ;
var index = 0;

function insertIntoDB(index) {
    data = fs.readFileSync(dirPath + fileArray[index]);
    articleModel.insertMany(JSON.parse(data), (err) => {
        if (err) {
            console.log(err);
        }
        console.log("insert document " + index);
        if(index + 1 == fileArray.length){
            console.log("success insert all of json");
        }else{
            index++;
            insertIntoDB(index);
        }
    });
}

function insertTxtToDB(){
    data = fs.readFileSync("/Users/David/Desktop/COMP_5347/Assignment/Dataset/Admin.txt");
    var dataStr = data.toString();
    var dataArray = dataStr.split("\n");
    for(var i = 0; i < dataArray.length; i++) {        
        dataArray[i] = {name: dataArray[i]}
    }

    adminModel.insertMany(dataArray)
    .then(() => {
        console.log("success insert admin");
        data = fs.readFileSync("/Users/David/Desktop/COMP_5347/Assignment/Dataset/Bot.txt");
        var dataStr = data.toString();
        var dataArray = dataStr.split("\n");  
        for(var i = 0; i < dataArray.length; i++) {        
            dataArray[i] = {name: dataArray[i]}
        }
         return botModel.insertMany(dataArray);
    })
    .then((returnData) => {
            console.log("success insert bot");
    });
}

function main() {
    //insert json file to db
    if(insertIntoDB(index) && (index + 1)  != fileArray.length) {
        insertIntoDB(++index);
    }

    //insert two admin.txt and bot.txt
    insertTxtToDB();
}


module.exports.initialDatabase = () => {
    fs.readdir(dirPath, (err, files) =>  {
        fileArray = files;
        insertIntoDB(index);
    });

    insertTxtToDB();
};
