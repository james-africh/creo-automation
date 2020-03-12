/*var app = require('express')();
var mysql = require('mysql');
var connection = require('express-myconnection');*/

//email verification
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

//DATABASE INFORMATION (TABLE NAMES)
const dbConfig = require('../config/database.js');
const database = dbConfig.database;

/*//DATABASE INFORMATION (TABLE NAMES)
var dbConfig = require('../config/database.js');
var database = dbConfig.database;
var host = dbConfig.connection.host;
var user = dbConfig.connection.user;
var password = dbConfig.connection.password;
var port = dbConfig.connection.port;
app.use(
    connection(mysql, {
        host: host,
        user: user,
        password: password,
        port: port,
        database: database,
        multipleStatements: true
    }, 'pool') //or single
);*/

exports = {};
module.exports = exports;



const DB = require('../config/db.js');
const querySql = DB.querySql;
const Promise = require('bluebird');



exports.signup = function(req, res) {
    let message = "";
    if (req.flash('message')) {
        message = req.flash('message');
    }
    res.render('Auth/signup', {
        message: message
    });
};

exports.login = function(req, res) {
    let message = "";
    if (req.flash('message')) {
        message = req.flash('message');
    }
    res.render('Auth/login', {
        message: message
    });
};

exports.emailVerification = function(req, res){
    let message = "";
    let enteredEmail = req.body.email;
    let enteredToken = req.body.userToken;
    let userToken = '';
    let isVerified = false;
    if(enteredEmail) {
        querySql("SELECT token FROM " + database + "." + dbConfig.users_table + " WHERE email = ?", enteredEmail)
            .then(rows => {
                userToken = rows[0].token;
                return userToken
            })
            .then(userToken => {
                if (enteredToken == userToken) {
                    isVerified = true;
                    message = "Thank you! Your email has been verified!";
                } else {
                    message = "Yo get outta here dude 😡";
                }
                return null
            })
            .then(() => {
                if(isVerified){
                    querySql("UPDATE " + database + "." + dbConfig.users_table + " SET isVerified = ? WHERE email = ?", [true, enteredEmail])
                }
                return null
            })
            .then(() => {
                res.locals = {title: 'Login'};
                res.render('Auth/login', {message: message});
                return null
            })
            .catch(err => {
                return Promise.reject(err);
            });
    }
    if(enteredEmail == undefined) {
        res.locals = {title: 'Email Verification'};
        res.render('Auth/emailVerification', {});
    }

   /* req.getConnection(function(err, connection) {
        if(enteredEmail) {
            connection.query("SELECT token FROM " + database + "." + dbConfig.users_table + " WHERE email = ?", enteredEmail, function (err, result) {
                if (err)
                    console.log("Error selecting : %s ", err);
                if (result.length != 0)
                    userToken = result[0].token;

                if(enteredToken == userToken){
                    isVerified = true;
                    message = "Thank you! Your email has been verified!";
                }else {
                    message = "Yo get outta here dude 😡";
                }

                if(isVerified){
                    connection.query("UPDATE " + database + "." + dbConfig.users_table + " SET isVerified = ? WHERE email = ?", [true, enteredEmail], function (err, result) {
                        if (err)
                            console.log("Error selecting : %s ", err);
                    });
                }

                res.locals = {title: 'Login'};
                res.render('Auth/login', {message: message});
            });
        }

        if(enteredEmail == undefined) {
            res.locals = {title: 'Email Verification'};
            res.render('Auth/emailVerification', {});
        }
    });*/
};

exports.resendCode = function(req, res){
    let enteredEmail = req.body.resendEmail;
    if(enteredEmail.split('@')[1] == 'sai-aps.com') {
        querySql("SELECT token FROM " + database + "." + dbConfig.users_table + " WHERE email = ?", enteredEmail)
            .then(rows => {
                let token = rows[0].token;

                //SEND EMAIL
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
                        to: enteredEmail, // list of receivers
                        subject: "Please verify your email", // Subject line
                        html: '<div>' +
                            '<p>Hi there,</p>\n' +
                            '<p>To complete your sign up, please use this code to verify your email</p>\n' +
                            '<div class="row justify-content-center">' +
                            '<h5>' + token + '</h5>' +
                            '</div>' +
                            '</div>'
                    });



                    await transporter.sendMail(info, function (err, info) {
                        if (err)
                            console.log(err);
                        else
                            console.log(info);
                    });

                    console.log("Message sent: %s", info.messageId);

                    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                }
                mail().catch(console.error);

                return null
            })
            .then(() => {
                res.locals = {title: 'Email Verification'};
                res.render('Auth/emailVerification', {});
            })
            .catch(err => {
                return Promise.reject(err);
            });

    }




    /*req.getConnection(function(err, connection) {
        if(enteredEmail.split('@')[1] == 'sai-aps.com'){
            connection.query("SELECT token FROM " + database + "." + dbConfig.users_table + " WHERE email = ?", enteredEmail, function (err, result) {
                if (err)
                    console.log("Error selecting : %s ", err);
                if (result.length != 0)
                    var token = result[0].token;

                //SEND EMAIL
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
                        to: enteredEmail, // list of receivers
                        subject: "Please verify your email", // Subject line
                        html: '<div>' +
                            '<p>Hi there,</p>\n' +
                            '<p>To complete your sign up, please use this code to verify your email</p>\n' +
                            '<div class="row justify-content-center">' +
                            '<h5>' + token + '</h5>' +
                            '</div>' +
                            '</div>'
                    });



                    await transporter.sendMail(info, function (err, info) {
                        if (err)
                            console.log(err);
                        else
                            console.log(info);
                    });

                    console.log("Message sent: %s", info.messageId);

                    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                }
                mail().catch(console.error);
            });
        }

        res.locals = {title: 'Email Verification'};
        res.render('Auth/emailVerification', {});
    });*/
};

exports.dashboard = function(req, res) {

    let userData;
    let profilePic;
    querySql("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id)
        .then(rows => {
            if (rows.length != 0) {
                profilePic = '/public/uploads/' + rows[0].profilePic;
                userData = {
                    idProfile: rows[0].idProfile,
                    FK_id: rows[0].FK_id,
                    firstName: rows[0].firstName,
                    lastName: rows[0].lastName,
                    profilePic: profilePic,
                    email: rows[0].email,
                    department: rows[0].department,
                    role: rows[0].role,
                    cell: rows[0].cell,
                    permissions: rows[0].permissions
                };
            }
            return null
        })
        .then(() => {
            res.render('Dashboard/dashboard', {
                userID: req.user.id,
                profilePic: profilePic,
                userData: userData
            });
            return null
        })
        .catch(err => {
            return Promise.reject(err);
        });



   /* req.getConnection(function(err, connection) {
        var userData;


        connection.query("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id, function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            if (result.length != 0) {

                var profilePic = '/public/uploads/' + result[0].profilePic;

                userData = {
                    idProfile: result[0].idProfile,
                    FK_id: result[0].FK_id,
                    firstName: result[0].firstName,
                    lastName: result[0].lastName,
                    profilePic: profilePic,
                    email: result[0].email,
                    department: result[0].department,
                    role: result[0].role,
                    cell: result[0].cell,
                    permissions: result[0].permissions
                };
            }

            res.render('Dashboard/dashboard', {
                userID: req.user.id,
                profilePic: profilePic,
                userData: userData
            });
        });
    });*/
};

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
};