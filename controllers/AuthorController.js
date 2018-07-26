var db = require('../db/db');
var articleModel = require('../models/ArticleModel');
var individualInfo = require('../classes/Individual_Info');
var util = require('../controllers/Util');

var AuthorController = {
    getArticlesWithAuthor: (req, res) => {
        articleModel.getArticlesWithAuthor(req.body.authorName, (data)=>{
            res.send(data);
        });
    },

    getSpecificArticle: (req, res) => {
        articleModel.getSpecificArticle(req.body.article, req.body.authorName, (data) => {
            res.send(data);
        });
    }
}

module.exports = AuthorController;