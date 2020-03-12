const express = require('express');
const app = express();
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const flash = require('req-flash');

//For BodyParser
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '100mb',
    parameterLimit: 20000
}));
app.use(bodyParser.json({
    extended: true,
    limit: '10mb'
}));
app.use(cookieParser());

// For Passport
app.use(session({ secret: 'saiapsportal',resave: true, saveUninitialized:true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//Database dependencies
let mysql = require('mysql');
let myConnection = require('express-myconnection');
let dbConfig = require('./app/config/database.js');
let database = dbConfig.database;
let host = dbConfig.host;
let user = dbConfig.user;
let password = dbConfig.password;
let port = dbConfig.port;
let dbOptions = {
    host: host,
    user: user,
    password: password,
    port: port,
    database: database
};

//Connection to DB
app.use(myConnection(mysql, dbOptions, 'pool'));


// Setting up the views
app.set('views', './app/views');
app.set('view engine', 'ejs');


// Access public folder from root
app.use(express.static(path.join(__dirname, '/public')));
app.use('/public', express.static('public'));

app.get('/', function(req, res) {
    res.redirect('/login');
});

app.use(flash());

//Routes
require('./app/routes/auth.js')(app, passport); //Auth Router
require('./app/routes/applicationEng.js')(app, passport); //Applications Eng Router
require('./app/routes/mechanicalEng.js')(app, passport); //Mechanical Engineering Router
require('./app/routes/creoson.js')(app, passport); //creoSON Router
require('./app/routes/misc.js')(app, passport); //Miscellaneous Router

//Models
let models = require("./app/models");

//load passport strategies
require('./app/config/passport/passport.js')(passport, models.user);

//Sync Database
models.sequelize.sync()
    .then(function() {
        console.log('Nice! Database looks fine')
    })
    .catch(function(err) {
        console.log(err, "Something went wrong with the Database Update!")
    });

//Start app
app.listen(3001, function(err) {
    if (!err)
        console.log("Site is live on *:3001");
    else console.log(err)
});

