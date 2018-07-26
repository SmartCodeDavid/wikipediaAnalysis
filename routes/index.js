var express = require('express');
var router = express.Router();
var loginController = require('../controllers/LoginController');
var signUpController = require('../controllers/SignUpController');
var overallController = require('../controllers/OverallController');
var individualController = require('../controllers/IndividualController');
var authorController = require('../controllers/AuthorController');

//index page
router.get('/', (req, res) => {
    if(req.session.login) {
        res.render('index', { login: req.session.login, username: req.session.username, page: "home", signupPage: true});
    }else{
        res.render('index', { login: req.session.login, username: req.session.username, page: "home", signupPage: false});
    }
    
    console.log("123");
});

//login
router.post('/', (req, res) => {
    //check username and password 
    loginController.checkLoginWithUser(req, res);
});

//logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(!err) {
            console.log('destroy session');
            res.clearCookie("key");
             res.redirect('/');
        }else{
            console.log(err);
        }
    });
});

//sign up index page
router.get('/signup', (req, res) => {
    res.render('signup', { login: req.session.login, username: req.session.username, signupPage: true, alert: false});
});


//sign up form submission
router.post('/signup', (req, res) => {
    signUpController.signUp(req, res);
});

//overall page
router.get('/overall', (req, res) => {
    if(!req.session.login) {
        res.redirect('/');
   }else{
       overallController.getOverallInfo(req,res);
   }
});

router.post('/overall', (req,res) => {
    ////overall controller to generate data.
    overallController.grabInfoBasedOnNumber(req, res);
});

//individual page 
router.get('/individual', (req, res) => {
    if(!req.session.login) {
         res.redirect('/');
    }else{
        console.log(req.url);
        individualController.getIndividualInfo(req,res);
    }
});

//individual page -- ajax article selection. 
router.post('/individual', (req, res)=>{
    //get info of selected article 
    individualController.processAjaxAndReturnData(req,res);
});

//individual page -- ajax users selection
router.post('/individual/showBarChart', (req, res) => {
    individualController.getBarChartWithProvidedUsers(req,res);
    console.log(req.body);
})

//author page
router.get('/author', (req, res) => {
    if (!req.session.login) {
        res.redirect('/');
    } else {
        console.log(req.url);
        res.render('authoranalytics', {
            login: req.session.login,
            username: req.session.username,
            page: "author",
            signupPage: false
        });
    }
});

//ajax in author page
router.post('/author', (req, res) => {
    console.log(req.body.authorName);
    authorController.getArticlesWithAuthor(req,res);
    //res.send('success');
});

//ajax -- get specific article in author page
router.post('/author/article', (req, res)=>{
    authorController.getSpecificArticle(req,res);
    console.log(req.body.article);
    console.log(req.body.authorName);
});

module.exports = router;

