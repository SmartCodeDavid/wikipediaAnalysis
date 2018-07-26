var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var app = express();
var indexRouter = require('./routes/index');

//set basedir
app.locals.basedir = __dirname;
console.log(app.locals.basedir);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//session setting
app.use(session({
    name: "key",
    secret: 'sdavid',  
    store: new FileStore(),  
    saveUninitialized: false,  
    resave: false,  
    rolling: true,
    cookie: { maxAge: 600000 }
}));

//initialise articile database -- run at the very beginning
// require('./db/initialdb').initialDatabase();

//--------------------------
//route redirection
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('404');
});

app.listen(3000, () => {
    console.log("application listen on 3000");
});

module.exports = app;
