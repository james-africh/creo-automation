const bCrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cryptoRandomString = require('crypto-random-string');

module.exports = function(passport, user) {
    var User = user;

    var LocalStrategy = require('passport-local').Strategy;

    passport.use('local-signup', new LocalStrategy(

        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true, // allows us to pass back the entire request to the callback
            failureFlash: true

        }, function(req, email, password, done) {
            var generateHash = function(password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };

            User.findOne({

                where: {
                    email: email
                }

            }).then(function(user) {

                if (user) {
                    return done(null, false, req.flash('message', 'That email is already taken'));
                } else {

                    var userPassword = generateHash(password);



                    var data = {
                        email: email,
                        password: userPassword,
                        token: cryptoRandomString({length: 20})
                    };


                    User.create(data).then(function(newUser, created) {

                        if (!newUser) {
                            return done(null, false);
                        }

                        if (newUser) {
                            //email test

                            if((data.email).split('@')[1] == 'sai-aps.com') {
                                async function mail() {
                                    let transporter = nodemailer.createTransport( {

                                        host: 'secure.emailsrvr.com', // hostname
                                        secureConnection: false, // TLS requires secureConnection to be false
                                        port: 465, // port for secure SMTP
                                        auth: {
                                            user: 'softwareautomation@sai-aps.com',
                                            pass: 'Software2020!'
                                        }
                                    });

                                    let info = await transporter.sendMail({
                                        from: 'softwareautomation@sai-aps.com', // sender address
                                        to: data.email, // list of receivers
                                        subject: "Please verify your email", // Subject line
                                        html: '<div>' +
                                                '<p>Hi there,</p>\n' +
                                                '<p>To complete your sign up, please use this code to verify your email</p>\n' +
                                                '<div class="row justify-content-center">' +
                                                    '<h5>' + data.token + '</h5>' +
                                                '</div>' +
                                              '</div>'
                                    });



                                    await transporter.sendMail(info, function (err, info) {
                                        if (err)
                                            console.log(err)
                                        else
                                            console.log(info);
                                    });

                                    console.log("Message sent: %s", info.messageId);

                                    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                                }
                                mail().catch(console.error);
                            }

                            return done(null, newUser);
                        }
                    });
                }
            });
        }
    ));

    //LOCAL SIGNIN
    passport.use('local-signin', new LocalStrategy(

        {
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true, // allows us to pass back the entire request to the callback
            failureFlash: true
        },

        function(req, email, password, done) {

            var User = user;

            var isValidPassword = function(userpass, password) {
                return bCrypt.compareSync(password, userpass);
            };

            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user) {
                if (!user) {
                    return done(null, false, req.flash('message', 'User does not exist'));

                }

                if (!isValidPassword(user.password, password)) {
                    return done(null, false, req.flash('message', 'Incorrect login or password.'));
                }

                var userinfo = user.get();

                if(userinfo.isVerified == false){
                    return done(null, false, req.flash('message', 'Please verify your email'));
                }

                return done(null, userinfo);

            }).catch(function(err) {

                console.log("Error:", err);
                return done(null, false, req.flash('message', 'Something went wrong with your Signin'));

            });
        }
    ));

    //serialize user
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialize user
    passport.deserializeUser(function(id, done) {

        User.findByPk(id).then(function(user) {

            if (user) {
                var data = {
                    last_login: new Date()
                };
                user.update(data);
                done(null, user.get());
            } else {
                done(user.errors, null);
            }

        });

    });

};