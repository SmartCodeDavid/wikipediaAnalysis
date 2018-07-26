var db  = require('../db/db');
var articleModel = require('../models/ArticleModel');
var individualInfo = require('../classes/Individual_Info');
var util = require('../controllers/Util');
var request = require('request');

var IndividualController = {
    getBarChartWithProvidedUsers: (req, res) => {
        individualInfo.BarchartInfoOfSelectedUsers = [];
        articleModel.getBarChartWithProvidedUsers(individualInfo, req.body.userSelect, req.body.titleselect, () => {
            console.log(individualInfo.BarchartInfoOfSelectedUsers);
            res.send(individualInfo.BarchartInfoOfSelectedUsers);
        });
    },

    getIndividualInfo: (req, res) => {
        ///get titles
        articleModel.getTitleAndNumOfRev((data)=>{
        ///get number of revisions of each titles
            console.log(data);
            res.render('individualanalytics', { login: req.session.login, username: req.session.username, page: "individual", signupPage: false, titlesAndNum: data });
        });
    },

    processAjaxAndReturnData: (req, res) => {
        var titleSelect = req.body.titleselect;
        individualInfo.seletedArticle = req.body.titleselect;

        console.log(titleSelect);
        //check Update And Insert
        //get lastest version of article
        new Promise( resolve => articleModel.getLastestVersionOfArticle(req.body.titleselect, (data)=>{
            console.log(data);

            //use wikimedia api to get articles information
            var timestamp = data[0].timestamp;
            let date = new Date(timestamp).toISOString();
            
            var wikiEndpoint = "https://en.wikipedia.org/w/api.php",
                parameters = ["action=query",
                    "format=json",
                    "prop=revisions", `titles=${req.body.titleselect}`, `rvstart=${date}`, "rvdir=newer",
                    "rvlimit=max",
                    "rvprop=timestamp|userid|user|ids"
                ]

            var url = wikiEndpoint + "?" + parameters.join("&");

            console.log("url: " + url)
            var options = {
                url: url,
                Accept: 'application/json',
                'Accept-Charset': 'utf-8'
            };
            request(options, function (err, res, data) {
                if (err) {
                    console.log('Error:', err);
                    resolve();
                } else if (res.statusCode !== 200) {
                    console.log('Status:', res.statusCode);
                } else {
                    json = JSON.parse(data);
                    pages = json.query.pages
                    revisions = pages[Object.keys(pages)[0]].revisions
                    console.log("There are " + revisions.length + " revisions.");
                    
                    if(revisions.length > 0) {
                        lastestVersionTime = revisions[revisions.length - 1].timestamp;
                        
                        //compare lastestVersionTime and timestamp
                        let d1 = timestamp.valueOf();
                        let d2 = new Date(lastestVersionTime).valueOf();

                        const seconds = d2 - d1;
                        const daySec = 60 * 60 * 24;

                        //consider to update this article 
                        if (seconds > daySec) {
                            for (let index in revisions) {
                                if (new Date(revisions[index].timestamp).valueOf() == d1) continue;
                                revisions[index].title = titleSelect;
                            }

                            //update to database
                            articleModel.updateArticlesFromWikimedia(revisions, () => {
                                resolve();
                            });

                        } else {
                            resolve();
                        }
                    } else {
                        resolve();
                    }
                }
            });
        }))
        .then(() => {
            return new Promise(resolve => articleModel.getNumberOfRevInArticle(individualInfo.seletedArticle, (data) => {
                console.log(data);
                individualInfo.numRevInSelectedArticle = data;
                resolve();
            }))
        })
        .then(() => {
            //get data for displaying the page
             return new Promise(resolve => articleModel.getTopFiveUsersRankedByRevNum(individualInfo, titleSelect, (data) => {
                console.log(data);
                let result = data;
                individualInfo.TopFiveUser = data;
                resolve(result);  
            }))
        })
        .then((result)=>{
            console.log('abc');
            return new Promise(resolve => articleModel.getBarChartInArticle(individualInfo, titleSelect, () => {
                    console.log(individualInfo);
                    individualInfo.showArray = [
                        ['Year', 'Administator', 'Anonymous', 'Bot', 'Regular user']
                    ].concat(util.buildArrayForShowingBarChart(individualInfo));
                    resolve(result);
            }));
        })
        .then((result) => {
            //get pie chart data. 
            articleModel.getPieChartInArticle(individualInfo, titleSelect, () => {
                console.log('callback');

                let jsonShowArray = JSON.stringify(individualInfo.showArray);
                res.send({
                    tableInfo: result,
                    barchartInfo: jsonShowArray,
                    info: individualInfo
                });
            })
        })
    }
};

module.exports = IndividualController;