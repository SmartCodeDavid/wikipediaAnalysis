var individualInfo = {
    titles: [],
    highestArticles: [],
    lowestArticles: [],
    largestGroupArticle: {
        numberOfUsers: -1,
        name: ""
    },
    smallestGroupArticle: {
        numberOfUsers: -1,
        name: ""
    },
    longestHistoryArticles: [],
    admins: [],
    bots: [],
    anon: [],
    revisionInBot: 0,
    revisionInAdmin: 0,
    revisionInRegularUser: 0,
    revisionInAnon: 0,
    numberOfBotInEachYears: [],
    numberOfAdminInEachYears: [],
    numberOfRegularUserInEachYears: [],
    numberOfAnonymousInEachYears: [],
    numberOfYears: [],
    showArray: [[4]],
    TopFiveUser: [],
    BarchartInfoOfSelectedUsers: [],
    seletedArticle: "",
    numRevInSelectedArticle: 0
};

module.exports = individualInfo;