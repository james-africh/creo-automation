const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const flash = require('req-flash');

//For BodyParser
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '200mb',
    parameterLimit: 50000
}));
app.use(bodyParser.json({
    extended: true,
    limit: '200mb'
}));
app.use(cookieParser());

// For Passport
app.use(session({ secret: 'saiapsportal',resave: true, saveUninitialized:true})); // session secret



// Setting up the views
app.set('views', './app/views');
app.set('view engine', 'ejs');


// Access public folder from root
app.use(express.static(path.join(__dirname, '/public')));
app.use('/public', express.static('public'));



app.get('/', function(req, res) {
    res.redirect('/home');
});


app.use(flash());

//Routes
require('./app/routes/main.js')(app); //Main Router
require('./app/routes/creoson.js')(app); //creoSON Router


//Start app
app.listen(3000, function(err) {
    if (!err)
        console.log("App is live at localhost:3000/");
    else console.log(err)
});

