const miscController = require('../controllers/miscController.js');

module.exports = function(app, passport) {

    //Initial Calendar GET request
    app.get('/calendar', isLoggedIn, miscController.calendar);

    //Email Inbox GET request
    app.get('/email-inbox', isLoggedIn, miscController.emailInbox);

    //Email Compose GET request
    app.get('/email-compose', isLoggedIn, miscController.emailCompose);

    //Email Read GET request
    app.get('/email-read', isLoggedIn, miscController.emailRead);

    //User Profile GET request
    app.get('/userProfile', isLoggedIn, miscController.userProfile);

    //User Profile POST request
    app.post('/createUserProfile', isLoggedIn, miscController.createUserProfile);

    //User Profile POST request
    app.post('/editUserProfile', isLoggedIn, miscController.editUserProfile);

    //User Profile Picture POST request
    app.post('/profilePicture', isLoggedIn, miscController.profilePicture);

    //Solution Log
    app.get('/solutionLog', isLoggedIn, miscController.solutionLog);
    app.post('/submitSolutionLog', isLoggedIn, miscController.submitSolutionLog);

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/login');
        }
    }
};