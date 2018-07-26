var db = require('../db/db');
var mongoose = require('mongoose');
var adminModel = require('../models/AdminModel');
var botModel = require('../models/BotModel');

var articleSchema = new mongoose.Schema({
    parentid: Number,
    minor: String,
    user: String,
    timestamp: Date,
    size: Number,
    sha1: String,
    parsedcomment: String,
    title: String,
    revid: Number,
    anon: String
});
var bots = [];
var admins = [];

//getNumberOfRevInArticles
articleSchema.statics.getNumberOfRevInArticle = (articleName, callback) => {
    articleModel.count({title: articleName}, (err, count) => {
        callback(count);
    });
}

//update to articles through Wikimedia
articleSchema.statics.updateArticlesFromWikimedia = (articles, callback) => {
    articleModel.insertMany(articles, (data)=>{
        callback();
    });
}

//get lastest version of article 
articleSchema.statics.getLastestVersionOfArticle = (articleName, callback) => {
    articleModel.aggregate([
        {
            $match: {
                title: articleName
            }
        },
        {
            $project: {
                timestamp: 1
            }
        },
        {
            $sort: {
                timestamp: -1
            }
        },
        {
            $limit: 1
        }
    ])
    .then(data=>{
        console.log(data);
        callback(data);
    })
}

//getSpecificArticle
articleSchema.statics.getSpecificArticle = (articleName, authorName, callback) => {
    let query = eval('/' + authorName + '/i');
    articleModel.aggregate([
        {
            $match: {
                user: query,
                title: articleName
            }
        },
        {
            $group: {
                _id: "$timestamp",
                user: {
                    $push: "$user"
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ])
    .then( data=> {
        console.log(data);
        callback(data);
    });
}

//getArticlesWithAuthor -- author page
articleSchema.statics.getArticlesWithAuthor = (authorName, callback) => {
    //
    let query = eval('/'+ authorName + '/i');
    
    articleModel.aggregate([
        {
            $match: {
                user: query
            }
        },
        {
            $group: {
                _id: "$title",
                num: {
                    $sum: 1
                }
            }
        }
    ])
    .then(data => {
        console.log(data);
        callback(data);
    })
    
}


//get bar chart data for each persons.
articleSchema.statics.getBarChartWithProvidedUsers = (individualInfo, userSelect, title, callback) => {
    console.log(userSelect instanceof Array);
    userSelect = (userSelect instanceof Array) ? userSelect : new Array(userSelect);
    for (let index in userSelect) {
        //Jdorje -- TopFiveUser
        articleModel.aggregate([{
                    $match: {
                        title: title,
                        user: userSelect[index]
                    }
                },
                {
                    $group: {
                        _id: {
                            $year: "$timestamp"
                        },
                        num: {
                            $sum: 1
                        }
                    }
                }
            ])
            .then(data => {
                individualInfo.BarchartInfoOfSelectedUsers.push({
                    name: userSelect[index],
                    numInyears: data
                })
                if (individualInfo.BarchartInfoOfSelectedUsers.length == userSelect.length) {
                    console.log('finish');
                    callback();
                }
            })
    }
}

//• A pie chart of revision number distribution based on user type for this article.
articleSchema.statics.getPieChartInArticle = (individualInfo, title, callback) => {
    //bot 
    articleModel.aggregate([{
                $match: {
                    title: title,
                    user: {
                        $in: individualInfo.bots
                    }
                }
            },
            {
                $group: {
                    _id: title,
                    numOfBots: {
                        $sum: 1
                    }
                }
            }
        ])
        .then(data => {
            individualInfo.revisionInBot = (data.length != 0) ? data[0].numOfBots : 0;
            //admin
            return articleModel.aggregate([{
                    $match: {
                        title: title,
                        user: {
                            $in: individualInfo.admins
                        }
                    }
                },
                {
                    $group: {
                        _id: title,
                        numOfAdmin: {
                            $sum: 1
                        }
                    }
                }
            ])
        })
        .then(data => {
            individualInfo.revisionInAdmin = (data.length != 0) ? data[0].numOfAdmin : 0;
            //anon
            return articleModel.aggregate([{
                    $match: {
                        title: title,
                        anon: {
                            $exists: true
                        }
                    }
                },
                {
                    $group: {
                        _id: title,
                        numOfAnon: {
                            $sum: 1
                        }
                    }
                }
            ])
        })
        .then(data => {
            individualInfo.revisionInAnon = (data.length != 0) ? data[0].numOfAnon : 0;
            //regular 
            return articleModel.aggregate([{
                    $match: {
                        title: title,
                        anon: {
                            $exists: false
                        },
                        user: {
                            $nin: individualInfo.admins.concat(individualInfo.bots)
                        }
                    }
                },
                {
                    $group: {
                        _id: title,
                        numOfRegular: {
                            $sum: 1
                        }
                    }
                }
            ])
        })
        .then(data => {
            individualInfo.revisionInRegularUser = (data.length != 0) ? data[0].numOfRegular : 0;
            callback();
            return;
        })
}

////• A bar chart of revision number distributed by year and by user type for this article. 
articleSchema.statics.getBarChartInArticle = (individualInfo, title, callback) => {
    articleModel.getBarChartDataInEachYears(individualInfo, title, callback);
}

articleSchema.statics.getTopFiveUsersRankedByRevNum = (individualInfo, title, callback) => {

    //get bots
    botModel.distinct("name").then((data) => {
            console.log(data);
            individualInfo.bots = data;
            //get admins
            return adminModel.distinct("name");
        })
        .then(data => {
            console.log(data);
            individualInfo.admins = data;
            return articleModel.aggregate([{
                    $match: {
                        title: title,
                        anon: {
                            $exists: false
                        },
                        user: {
                            $nin: individualInfo.bots.concat(individualInfo.admins)
                        }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        num: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        num: -1
                    }
                },
                {
                    $limit: 5
                }
            ]);
        })
        .then(callback);
}

articleSchema.statics.getTitleAndNumOfRev = (callback) => {
    articleModel.aggregate([{
                $group: {
                    _id: "$title",
                    numberOfRev: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    numberOfRev: 1
                }
            }
        ])
        .then(callback);
}

articleSchema.statics.getBarChartDataInEachYears = (OverallInfo, title, callback) => {
    /////get the number of bot in each years, which will be used on the bar chart
    let aggregate = articleModel.aggregate([]);
    let basicQuery = [{
            $match: {
                user: {
                    $in: OverallInfo.bots
                },
                if (title) {
                    title: title
                }
            }
        },
        {
            $project: {
                user: 1,
                year: {
                    $year: "$timestamp"
                }
            }
        },
        {
            $group: {
                _id: "$year",
                "bots": {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ];

    if (title) {
        aggregate.append({
            $match: {
                title: title
            }
        });
    }
    aggregate.append(basicQuery);

    aggregate.exec()
        .then(data => {
            OverallInfo.numberOfBotInEachYears = data;

            ////get the number of admin in each years, which will be used on the bar chart
            let aggregate = articleModel.aggregate([]);
            let basicQuery = [{
                    $match: {
                        user: {
                            $in: OverallInfo.admins
                        }
                    }
                },
                {
                    $project: {
                        user: 1,
                        year: {
                            $year: "$timestamp"
                        }
                    }
                },
                {
                    $group: {
                        _id: "$year",
                        "admins": {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ];
            if (title) {
                aggregate.append({
                    $match: {
                        title: title
                    }
                });
            }
            aggregate.append(basicQuery);
            return aggregate.exec();
        })
        .then(data => {
            OverallInfo.numberOfAdminInEachYears = data;

            ////get the number of regular user in each years, which will be used on the bar chart   
            var array = OverallInfo.admins.concat(OverallInfo.bots);
            let aggregate = articleModel.aggregate([]);
            let basicQuery = [{
                    $match: {
                        user: {
                            $nin: array
                        },
                        anon: {
                            $exists: false
                        }
                    }
                },
                {
                    $project: {
                        user: 1,
                        year: {
                            $year: "$timestamp"
                        }
                    }
                },
                {
                    $group: {
                        _id: "$year",
                        "regularUser": {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ];
            if (title) {
                aggregate.append({
                    $match: {
                        title: title
                    }
                });
            }
            aggregate.append(basicQuery);
            return aggregate.exec();
        })
        .then(data => {
            OverallInfo.numberOfRegularUserInEachYears = data;

            ///get the number of anonymous in each years, which will be used on the bar chart    
            let aggregate = articleModel.aggregate([]);
            let basicQuery = [{
                    $match: {
                        anon: {
                            $exists: true
                        }
                    }
                },
                {
                    $project: {
                        user: 1,
                        year: {
                            $year: "$timestamp"
                        }
                    }
                },
                {
                    $group: {
                        _id: "$year",
                        "anonymous": {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ];
            if (title) {
                aggregate.append({
                    $match: {
                        title: title
                    }
                });
            }
            aggregate.append(basicQuery);
            return aggregate.exec();
        })
        .then(data => {
            OverallInfo.numberOfAnonymousInEachYears = data;

            ///get the number of years that will be displayed on overall page
            return articleModel.aggregate([{
                $group: {
                    _id: {
                        $year: "$timestamp"
                    }
                }
            }])
        })
        .then(data => {
            OverallInfo.numberOfYears = data;
            callback();
        })
}

articleSchema.statics.getOverallInfo = (OverallInfo, callback) => {
    ////Titles of the three articles with highest number of revisions. This is the default behavior.
    articleModel.aggregate([{
                $match: {}
            },
            {
                $group: {
                    _id: "$title",
                    numberOfRevs: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    numberOfRevs: -1
                }
            },
            {
                $limit: 3
            }
        ])
        .then(data => {
            OverallInfo.highestArticles = data;

            ////Titles of the three articles with lowest number of revisions. This is the default behavior.
            return articleModel.aggregate([{
                    $match: {}
                },
                {
                    $group: {
                        _id: "$title",
                        numberOfRevs: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        numberOfRevs: 1
                    }
                },
                {
                    $limit: 3
                }
            ]);
        })
        .then(data => {
            OverallInfo.lowestArticles = data;

            ////The article edited by largest group of registered users.
            return articleModel.aggregate([{
                    '$group': {
                        '_id': {
                            'title': "$title",
                            'user': "$user"
                        }
                    }
                },
                {
                    '$group': {
                        '_id': "$_id.title",
                        'number': {
                            $sum: 1
                        }
                    }
                },
                {
                    '$sort': {
                        number: -1
                    }
                },
                {
                    '$limit': 1
                }
            ]);
        })
        .then(data => {
            OverallInfo.largestGroupArticle = data[0]._id;

            ////The article edited by smallest group of registered users.
            return articleModel.aggregate([{
                    '$group': {
                        '_id': {
                            'title': "$title",
                            'user': "$user"
                        }
                    }
                },
                {
                    '$group': {
                        '_id': "$_id.title",
                        'number': {
                            $sum: 1
                        }
                    }
                },
                {
                    '$sort': {
                        number: 1
                    }
                },
                {
                    '$limit': 1
                }
            ]);
        })
        .then(data => {
            OverallInfo.smallestGroupArticle = data[0]._id;

            ///The top 3 articles with the longest history (measured by age).
            return articleModel.aggregate([{
                    $group: {
                        _id: "$title",
                        oldestDate: {
                            $min: "$timestamp"
                        }
                    }
                },
                {
                    $sort: {
                        oldestDate: 1
                    }
                },
                {
                    $limit: 3
                }
            ]);
        })
        .then(data => {
            OverallInfo.longestHistoryArticles = data;
            ///get bots and admins and then drawing
            return botModel.distinct('name');
        })
        .then(data => {
            OverallInfo.bots = data;

            /////get admin
            return adminModel.distinct('name');
        })
        .then(data => {
            OverallInfo.admins = data;

            /////count number of bot associated with revision
            return articleModel.find({
                user: {
                    $in: OverallInfo.bots
                }
            }).count();
        })
        .then(data => {
            OverallInfo.revisionInBot = data;

            ////count number of admin associated with revision
            return articleModel.find({
                user: {
                    $in: OverallInfo.admins
                }
            }).count();
        })
        .then(data => {
            OverallInfo.revisionInAdmin = data;

            ////count number of anon assosciated with revision
            return articleModel.find({
                anon: {
                    $exists: true
                }
            }).count();
        })
        .then(data => {
            OverallInfo.revisionInAnon = data;

            ////count number of regular user associated with revision
            var array = OverallInfo.admins.concat(OverallInfo.bots);
            return articleModel.find({
                anon: {
                    $exists: false
                },
                user: {
                    $nin: array
                }
            }).count()
        })
        .then(data => {
            OverallInfo.revisionInRegularUser = data;
            articleModel.getBarChartDataInEachYears(OverallInfo, null, () => {
                ///get the number of years that will be displayed on overall page
                articleModel.aggregate([{
                        $group: {
                            _id: {
                                $year: "$timestamp"
                            }
                        }
                    }])
                    .then(data => {
                        OverallInfo.numberOfYears = data;
                        callback();
                    })
            })
        })
}

articleSchema.statics.grabInfoBasedOnNumber = (req, OverallInfo, callback) => {
    if (req.body.number) {
        var number = parseInt(req.body.number);
        ////Titles of the num? articles with highest number of revisions. This is the default behavior.
        articleModel.aggregate([{
                    $match: {}
                },
                {
                    $group: {
                        _id: "$title",
                        numberOfRevs: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        numberOfRevs: -1
                    }
                },
                {
                    $limit: number
                }
            ])
            .then(data => {
                OverallInfo.highestArticles = data;

                ////Titles of the num? articles with lowest number of revisions. This is the default behavior.
                return articleModel.aggregate([{
                        $match: {}
                    },
                    {
                        $group: {
                            _id: "$title",
                            numberOfRevs: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            numberOfRevs: 1
                        }
                    },
                    {
                        $limit: number
                    }
                ]);
            })
            .then(data => {
                OverallInfo.lowestArticles = data;

                ///The top num? articles with the longest history (measured by age).
                return articleModel.aggregate([{
                        $group: {
                            _id: "$title",
                            oldestDate: {
                                $min: "$timestamp"
                            }
                        }
                    },
                    {
                        $sort: {
                            oldestDate: 1
                        }
                    },
                    {
                        $limit: number
                    }
                ]);
            })
            .then(data => {
                OverallInfo.longestHistoryArticles = data;
                callback();
            })
    }
}

var articleModel = db.model('Article', articleSchema);


module.exports = articleModel;