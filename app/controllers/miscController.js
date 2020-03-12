var app = require('express')();
var mysql = require('mysql');
var connection = require('express-myconnection');
var queryString = require('query-string');
var url = require('url');

//Creoson Connection
const creoson = require('../../creoson/creoson.js');

//Excel Connection
const Excel = require('exceljs');

//DATABASE INFORMATION (TABLE NAMES)
var dbConfig = require('../config/database.js');
var database = dbConfig.database;
var host = dbConfig.host;
var user = dbConfig.user;
var password = dbConfig.password;
var port = dbConfig.port;
app.use(
    connection(mysql, {
        host: host,
        user: user,
        password: password,
        port: port,
        database: database,
        multipleStatements: true
    }, 'pool') //or single
);


exports = {};
module.exports = exports;

exports.calendar = function(req, res) {
    res.locals = {title: 'Calendar'};
    res.render('Calendar/calendar');
};

exports.emailInbox = function(req, res) {
    res.locals = {title: 'Email Inbox'};
    res.render('Email/email_inbox');
};

exports.emailCompose = function(req, res) {
    res.locals = {title: 'Email Compose'};
    res.render('Email/email_compose');
};

exports.emailRead = function(req, res) {
    res.locals = {title: 'Email Read'};
    res.render('Email/email_read');
};


var formidable = require('formidable');
var path = require('path');

exports.userProfile = function(req, res) {
    var userData;
    var userEmail = req.user.email;
    req.getConnection(function(err, connection) {
        connection.query("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id, function(err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            if (result.length == 0) {

            } else {
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
            res.locals = {title: 'User Profile'};
            res.render('UserProfile/userProfile', {
                userData: userData,
                userEmail: userEmail,
                profilePic: profilePic
            });
        });
    });
};

exports.profilePicture = function(req, res) {
    var fileName;
    var idProfile = req.user.id;

    var form = new formidable.IncomingForm();
    form.parse(req);

    form.on('fileBegin', function (name, file){
        fileName = file.name;
        var periodIndex = fileName.indexOf('.');
        fileName = fileName.substring(0, periodIndex) + '_' + idProfile.toString() + fileName.substring(periodIndex);
        file.path =  path.join(__dirname+'../../../public/uploads/', fileName);
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + fileName);
    });

    /*res.sendFile(path.join( __dirname + '../../views/UserProfile/', 'userProfile.ejs'));*/

    req.getConnection(function(err, connection) {
        connection.query("UPDATE " + database + " . " + dbConfig.user_profile_table + " SET profilePic = ? WHERE FK_id = ?", [fileName, idProfile], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
        });
        res.redirect('./userProfile');
    });
};

exports.createUserProfile = function(req, res) {
    var userData = {
        FK_id: req.user.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        department: req.body.department,
        role: req.body.role,
        cell: req.body.cell
    };
    req.getConnection(function(err, connection) {
        connection.query("INSERT INTO " + database + " . " + dbConfig.user_profile_table + " SET ?", [userData], function (err, result) {
            if(err)
                console.log("Error inserting : %s ", err);
            res.redirect('./userProfile');
        });
    });

};


exports.editUserProfile = function(req, res) {
    var editUserData = {
        FK_id: req.user.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        department: req.body.department,
        role: req.body.role,
        cell: req.body.cell
    };
    var idProfile;
    req.getConnection(function(err, connection) {
        connection.query("SELECT * FROM " + database + " . " + dbConfig.user_profile_table + " WHERE FK_id = ?", [editUserData.FK_id], function (err, result) {
            if(err)
                console.log("Error inserting : %s ", err);
            idProfile = result[0].idProfile;
            connection.query("UPDATE " + database + "." + dbConfig.user_profile_table + " SET firstName = ?, " +
                " lastName = ?, email = ?, department = ?, role = ?, cell = ? WHERE idProfile = ?", [editUserData.firstName, editUserData.lastName, editUserData.email, editUserData.department, editUserData.role, editUserData.cell, idProfile], function(err, result) {
                if(err)
                    console.log("Error updating : %s ", err);
                res.redirect('./userProfile');
            });
        });
    });

};


exports.solutionLog = function(req, res) {
    var randomNum;
    var fileName;
    var filePath;

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    req.getConnection(function(err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.solution_log, function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            var stop = result.length;
            randomNum = getRandomInt(1, stop+1);

            connection.query("SELECT * FROM " + database + "." + dbConfig.solution_log + " WHERE solutionLogID = ?", randomNum, function (err, result) {
                if (err)
                    console.log("Error selecting : %s ", err);
                if(result.length > 0) {
                    fileName = result[0].fileName;
                    filePath = '/public/solutionLog/' + fileName;
                }

                connection.query("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id, function (err, result) {
                    if (err)
                        console.log("Error selecting : %s ", err);
                    if (result.length != 0)
                        var profilePic = '/public/uploads/' + result[0].profilePic;

                    res.locals = {title: 'Solution Log'};
                    res.render('Misc/solutionLog', {
                        profilePic: profilePic,
                        filePath: filePath
                    });
                });
            });
        });
    });
};

var solutionLogCount;

exports.submitSolutionLog = function(req, res) {
    if(solutionLogCount == undefined)
        solutionLogCount = 1;
    var fileName;

    var form = new formidable.IncomingForm();
    form.parse(req);

    form.on('fileBegin', function (name, file){
        fileName = file.name;
        var periodIndex = fileName.indexOf('.');
        fileName = solutionLogCount.toString() + fileName.substring(periodIndex);
        file.path =  path.join(__dirname+'../../../public/solutionLog/', fileName);
        solutionLogCount++;
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + fileName);
    });

    req.getConnection(function(err, connection) {
        connection.query("INSERT INTO " + database + "." + dbConfig.solution_log + " SET fileName = ? ", fileName, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
        });
        connection.query("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id, function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            if (result.length != 0)
                var profilePic = '/public/uploads/' + result[0].profilePic;

            res.locals = {title: 'Solution Log'};
            res.render('Misc/solutionLog', {
                profilePic: profilePic,
            });
        });
    });
};
