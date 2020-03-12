/******************************************************************************
 * Name: Lars Knutson II                                                      *
 * Date: November 19, 2019                                                    *
 * Filename: createIssueLogSchema.js                                          *
 * Description: This creates the tables for the Issue Log                     *
 ******************************************************************************/

var mysql = require('mysql');
var dbConfig = require('../app/config/database.js');

var connection = mysql.createConnection(dbConfig.connection);

connection.query('DROP SCHEMA IF EXISTS ' + dbConfig.database, function(err,rows) { if(err) throw err;});

connection.query('CREATE DATABASE ' + dbConfig.database, function(err,rows) { if(err) throw err; });

connection.query('USE ' + dbConfig.database, function(err,rows) { if(err) throw err;});

//Creating Issue Log Tables
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.department_table +
    ' (id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
       name VARCHAR(50) NOT NULL, \
       active BOOL NOT NULL, \
       CONSTRAINT department_PK PRIMARY KEY (id), \
       CONSTRAINT department_name UNIQUE (name)) \
       ENGINE=InnoDB;', function(err,rows) { if(err) throw err;});

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.cell_table +
    ' (id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
       name VARCHAR(50) NOT NULL, \
       active BOOL NOT NULL, \
       CONSTRAINT cell_PK PRIMARY KEY (id), \
       CONSTRAINT cell_name UNIQUE (name)) \
       ENGINE=InnoDB;', function(err,rows) { if(err) throw err;});

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.role_table +
    ' (id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
       name VARCHAR(50) NOT NULL, \
       CONSTRAINT role_PK PRIMARY KEY (id), \
       CONSTRAINT role_name UNIQUE (name)) \
       ENGINE=InnoDB;', function(err,rows) { if(err) throw err;});

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.person_table +
    ' (id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
       fname VARCHAR(50) NOT NULL, \
       lname VARCHAR(50) NOT NULL, \
       username VARCHAR(50), \
       email VARCHAR(50) NOT NULL, \
       departmentID INT UNSIGNED, \
       cellID INT UNSIGNED, \
       roleID INT UNSIGNED, \
       active BOOL NOT NULL, \
       CONSTRAINT person_PK PRIMARY KEY (id), \
       CONSTRAINT email_address UNIQUE (email), \
       CONSTRAINT person_departmentID_FK FOREIGN KEY (departmentID) REFERENCES department (id), \
       CONSTRAINT person_cellID_FK FOREIGN KEY (cellID) REFERENCES cell (id), \
       CONSTRAINT person_roleID_FK FOREIGN KEY (roleID) REFERENCES role (id)) \
       ENGINE=InnoDB;', function(err,rows) { if(err) throw err;});

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.codes_table +
    ' (id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
       name VARCHAR(50) NOT NULL,\
       type VARCHAR(50) NOT NULL, \
       CONSTRAINT codes_PK PRIMARY KEY (id)) \
       ENGINE=InnoDB;', function(err,rows) { if(err) throw err;});

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.issue_table +
    ' (id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
       jobNumber INT UNSIGNED NOT NULL, \
       lineItem CHAR(1) NOT NULL, \
       section VARCHAR(50), \
       jobCustomer VARCHAR(50), \
       resolved BOOL NOT NULL, \
       CONSTRAINT issues_PK PRIMARY KEY (id)) \
       ENGINE=InnoDB;', function(err,rows) { if(err) throw err;});

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.codeToDepartment_table +
    ' (id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
       codesID INT UNSIGNED, \
       departmentID INT UNSIGNED, \
       CONSTRAINT codeToDepartment_PK PRIMARY KEY (id), \
       CONSTRAINT codeToDepartment_codesID_FK FOREIGN KEY (codesID) REFERENCES codes (id), \
       CONSTRAINT codeToDepartment_departmentID_FK FOREIGN KEY (departmentID) REFERENCES department (id)) \
       ENGINE=InnoDB;', function(err,rows) { if(err) throw err;});

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.comment_table +
    ' (id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
       issueID INT UNSIGNED, \
       personID INT UNSIGNED, \
       codesID INT UNSIGNED, \
       postTime TIMESTAMP, \
       reference VARCHAR(100), \
       message VARCHAR(300), \
       CONSTRAINT comment_PK PRIMARY KEY (id)) \
       ENGINE=InnoDB;', function(err,rows) { if(err) throw err;});

console.log('Success: Schema Created!');

connection.end();

