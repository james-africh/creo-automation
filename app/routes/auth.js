const authController = require('../controllers/authcontroller.js');

module.exports = function(app, passport) {

    app.get('/signup', authController.signup);

    app.get('/login', authController.login);

    app.get('/emailVerification', authController.emailVerification);

    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/emailVerification',
            failureRedirect: '/signup'
        }));

    app.post('/login', passport.authenticate('local-signin', {
            successRedirect: '/dashboard',
            failureRedirect: '/login'
        }));

    app.post('/emailVerification', authController.emailVerification);

    app.post('/resendCode', authController.resendCode);

    app.get('/logout',authController.logout);

    app.get('/dashboard', isLoggedIn, authController.dashboard);

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/login');
    }
};