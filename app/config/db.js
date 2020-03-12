const mysql = require('mysql');
const Promise = require("bluebird");

Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);


//DATABASE INFORMATION (TABLE NAMES)
const dbConfig = require('./database.js');
let database = dbConfig.database;
let host = dbConfig.host;
let user = dbConfig.user;
let password = dbConfig.password;
let port = dbConfig.port;

let pool = mysql.createPool({
    host: host,
    port: port,
    user: user,
    password: password,
    database: database
});

function getSqlConnection() {
    return pool.getConnectionAsync().disposer(function (connection) {
        /*console.log("Releasing connection back to pool");*/
        connection.release();
    });
}

function querySql (query, params) {
    return Promise.using(getSqlConnection(), function (connection) {
        /*console.log("Got connection from pool");*/
        if (typeof params !== 'undefined'){
            return connection.queryAsync(query, params);
        } else {
            return connection.queryAsync(query);
        }
    });
};

module.exports = {
    getSqlConnection : getSqlConnection,
    querySql : querySql
};