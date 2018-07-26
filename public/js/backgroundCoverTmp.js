window.onload = () => {
    //blind click event to overallAnalytics
    $('#overallAnalytics').click(event => {
        $('.backgroupCover').css('top', window.pageYOffset + "px");
        $('.backgroupCover').show();
    });

    $('#IndividualAnalytics').click(event => {
        $('.backgroupCover').css('top', window.pageYOffset + "px");
        $('.backgroupCover').show();
    });
}

