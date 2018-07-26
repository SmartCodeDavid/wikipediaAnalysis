
var getNumberOfRegularUserWithYear = (year, OverallInfo) => {
    for (index in OverallInfo.numberOfRegularUserInEachYears) {
        if (OverallInfo.numberOfRegularUserInEachYears[index]._id == year) {
            return OverallInfo.numberOfRegularUserInEachYears[index].regularUser;
        }
    }
    return 0;
}

var getNumberOfBotWithYear = (year, OverallInfo) => {
    for (index in OverallInfo.numberOfBotInEachYears) {
        if (OverallInfo.numberOfBotInEachYears[index]._id == year) {
            return OverallInfo.numberOfBotInEachYears[index].bots;
        }
    }
    return 0;
}

var getNumberOfAnonymousWithYear = (year, OverallInfo) => {
    for (index in OverallInfo.numberOfAnonymousInEachYears) {
        if (OverallInfo.numberOfAnonymousInEachYears[index]._id == year) {
            return OverallInfo.numberOfAnonymousInEachYears[index].anonymous;
        }
    }
    return 0;
}

var getNumberOfAdminWithYear = (year, OverallInfo) => {
    for (index in OverallInfo.numberOfAdminInEachYears) {
        if (OverallInfo.numberOfAdminInEachYears[index]._id == year) {
            return OverallInfo.numberOfAdminInEachYears[index].admins;
        }
    }
    return 0;
}

var Util = {
    buildArrayForShowingBarChart: (OverallInfo) => {
        var tmp = [];
        for (let index in OverallInfo.numberOfYears) {
            //looking for admin first
            let numAd = getNumberOfAdminWithYear(OverallInfo.numberOfYears[index]._id, OverallInfo);
            //looking for Anonymous
            let numAnonymous = getNumberOfAnonymousWithYear(OverallInfo.numberOfYears[index]._id, OverallInfo);
            //looking for Bot
            let numBot = getNumberOfBotWithYear(OverallInfo.numberOfYears[index]._id, OverallInfo);
            //looking for Regular user
            let numRegularUser = getNumberOfRegularUserWithYear(OverallInfo.numberOfYears[index]._id, OverallInfo);

            tmp.push([OverallInfo.numberOfYears[index]._id.toString(), numAd, numAnonymous, numBot, numRegularUser]);
        }
        return tmp;
    }
}

module.exports = Util;