var app = require('express')();
var mysql = require('mysql');
var connection = require('express-myconnection');
var queryString = require('query-string');
var url = require('url');

//Creoson Connection
var creoConnect = require('../../creoson/creoConnect.js');

//Excel Connection
const Excel = require('exceljs');

//DATABASE INFORMATION (TABLE NAMES)
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
);

//*********************************MECHANICAL ENG. PORTAL*************************************//

var exports = module.exports = {}

//Submittal GET request
exports.submittal = function(req, res) {
    req.getConnection(function(err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            if (result.length != 0)
                var profilePic = '/public/uploads/' + result[0].profilePic;
            res.locals = {title: 'Mechanical Submittals'};
            res.render('MechEng/SubmittalME',{
                profilePic: profilePic
            });
        });
    });
};

//Set Working Directory POST request
exports.setWD = function(req, res) {
    var workingDir = req.body.workingDir;
    creoConnect.creoConnect('setWD', workingDir);
    res.redirect('MechEng/submittal')
};

exports.MBOM = function(req, res, user) {
    var mbomData = [];
    var lookupData = [];
    var userID = req.user.id;
    var userPermission;
    var comItemData = [];
    req.getConnection(function(err, connection) {
        connection.query("SELECT * FROM "+ database + "."+ dbConfig.MBOM_summary_table, function(err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            else if (result.length != 0) {
                for (var i = 0; i < result.length; i++) {
                    mbomData[i] = {
                        mbomID: result[i].mbomID,
                        jobNum: result[i].jobNum,
                        releaseNum: result[i].releaseNum,
                        jobName: result[i].jobName,
                        customer: result[i].customer,
                        boardDesignation: result[i].boardDesignation,
                        qtyBoard: parseInt(result[i].qtyBoard),
                        numSections: result[i].numSections,
                    };
                }
            } else {
            }
            connection.query("SELECT * FROM "+database+"."+dbConfig.MBOM_common_items, function(err, result) {
                if (err)
                    console.log("Error selecting : %s ", err);
                else if (result.length != 0) {
                    for (var i = 0; i < result.length; i++) {
                        comItemData[i] = {
                            comItemID: result[i].comItemID,
                            itemType: result[i].itemType,
                            itemMfg: result[i].itemMfg,
                            itemDesc: result[i].itemDesc,
                            itemPN: result[i].itemPN,
                            unitOfIssue: result[i].unitOfIssue,
                            catCode: result[i].catCode,
                            status: result[i].status
                        };
                    }
                } else {
                }
                connection.query("SELECT permissions FROM "+database+"."+dbConfig.user_profile_table+" WHERE FK_id = ?", userID, function(err, result) {
                    if (err)
                        console.log("Error selecting : %s ", err);
                    else if (result.length != 0) {
                        userPermission = result[0].permissions;
                    } else {
                    }

                    connection.query("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id, function(err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        if (result.length != 0)
                            var profilePic = '/public/uploads/' + result[0].profilePic;

                        res.locals = {title: 'Mechanical BOMs'};
                        res.render('MechEng/MBOM', {
                            mbomData: mbomData,
                            comItemData: comItemData,
                            userPermission: userPermission,
                            profilePic: profilePic
                        });
                    });
                });
            });
        });
    });
};

exports.createMBOM = function(req, res) {
    req.getConnection(function (err, connection) {
        var data1 = {
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
            jobName: req.body.jobName,
            customer: req.body.customer,
            boardDesignation: req.body.boardDesignation,
            qtyBoard: parseInt(req.body.qtyBoard),
            numSections: 0,
        };
        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [data1.jobNum, data1.releaseNum], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            if(result.length == 0) {
                connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_summary_table + " SET ?", data1, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);


                    connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [data1.jobNum, data1.releaseNum], function (err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        var mbomID = result[0].mbomID;
                        res.locals = {title: 'Create MBOM'};
                        res.redirect('searchMBOM/?bomID=' + data1.jobNum + data1.releaseNum + "_" + mbomID);
                    });
                });
            }
            else {
                var mbomID = result[0].mbomID;
                res.locals = {title: 'Create MBOM'};
                res.redirect('searchMBOM/?bomID=' + data1.jobNum + data1.releaseNum + "_" + mbomID);
            }
        });
    });
};


exports.copyMBOM = function(req, res) {
    req.getConnection(function (err, connection) {
        var copyItems = [];
        var newItems = [];
        var newItemsForItemTable = [];
        var newItemsForUserTable = [];
        var itemMap = new Map();
        var copyBrks = [];
        var newBrks = [];
        var brkMap = new Map();
        var copySections = [];
        var newSections = [];

        var copyMbomData = {
            jobNum: req.body.copyJobNum,
            releaseNum: req.body.copyReleaseNum
        };
        var copyMbomID;
        var copyNumSections;
        var copyQtyBoard;
        var newMbomID;

        //FOR MBOM DATA
        connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [copyMbomData.jobNum, copyMbomData.releaseNum], function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);

            copyMbomID = result[0].mbomID;
            copyNumSections = result[0].numSections;

            var newMbomData = {
                jobNum: req.body.jobNum,
                releaseNum: req.body.releaseNum,
                jobName: req.body.jobName,
                customer: req.body.customer,
                boardDesignation: req.body.boardDesignation,
                qtyBoard: parseInt(req.body.qtyBoard),
                numSections: copyNumSections
            };

            connection.query("INSERT INTO " + database + "." + dbConfig.MBOM_summary_table + " SET ?", newMbomData, function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
            });

            connection.query("SELECT * FROM "+database+"."+dbConfig.MBOM_summary_table+" WHERE jobNum = ? AND releaseNum = ?", [newMbomData.jobNum, newMbomData.releaseNum], function(err, result) {
                if (err)
                    console.log("Error selecting : %s ", err);
                newMbomID = result[0].mbomID;

















                //FOR ITEMS
                connection.query("SELECT * FROM "+database+"."+dbConfig.MBOM_user_items+" WHERE mbomID = ?", [copyMbomID], function(err, result) {
                    if (err)
                        console.log("Error selecting : %s ", err);
                    if (result.length != 0) {
                        for (var i = 0; i < result.length; i++) {
                            var userItemData = {
                                mbomID: newMbomID,
                                itemType: result[i].itemType,
                                itemMfg: result[i].itemMfg,
                                itemDesc: result[i].itemDesc,
                                itemPN: result[i].itemPN,
                                unitOfIssue: result[i].unitOfIssue,
                                catCode: result[i].catCode
                            };
                            connection.query("INSERT INTO " + database + "." + dbConfig.MBOM_user_items + " SET ?", userItemData, function (err, result) {
                                if (err)
                                    console.log("Error inserting : %s ", err);
                            });
                        }
                    }

                    connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_user_items + " WHERE mbomID = ?", copyMbomID, function (err, result) {
                        if (err)
                            console.log("Error selecting : %s ", err);
                        for (var i = 0; i < result.length; i++) {
                            copyItems[i] = result[i];
                        }
                        connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_user_items + " WHERE mbomID = ?", newMbomID, function (err, result) {
                            if (err)
                                console.log("Error selecting : %s ", err);
                            for (var i = 0; i < result.length; i++) {
                                newItems[i] = result[i];
                            }
                            connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_item_table + " WHERE mbomID = ?", copyMbomID, function (err, result) {
                                if (err)
                                    console.log("Error selecting : %s ", err);
                                for (var i = 0; i < result.length; i++) {
                                    var newUserItemID = null;
                                    if (result[i].userItemID != null) {
                                        var copyUserItemID = result[i].userItemID;
                                        for (var j = 0; j < copyItems.length; j++) {
                                            if (copyItems[j].userItemID == copyUserItemID) {
                                                for (var k = 0; k < newItems.length; k++) {
                                                    if (copyItems[j].itemPN == newItems[k].itemPN) {
                                                        newUserItemID = newItems[k].userItemID;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    newItemsForItemTable[i] = {
                                        comItemID: result[i].comItemID,
                                        userItemID: newUserItemID,
                                        mbomID: newMbomID,
                                        itemQty: result[i].itemQty,
                                    };
                                }
                                for (var j = 0; j < newItemsForItemTable.length; j++) {
                                    connection.query("INSERT INTO " + database + "." + dbConfig.MBOM_item_table + " SET ?", newItemsForItemTable[j], function (err, result) {
                                        if (err)
                                            console.log("Error inserting : %s ", err);
                                    });
                                }
                                connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_item_table + " WHERE mbomID = ?", copyMbomID, function (err, copyMbomResult) {
                                    if (err)
                                        console.log("Error selecting : %s ", err);
                                    connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_item_table + " WHERE mbomID = ?", newMbomID, function (err, newMbomResult) {
                                        if (err)
                                            console.log("Error selecting : %s ", err);
                                        for (var k = 0; k < newMbomResult.length; k++) {
                                            itemMap.set(copyMbomResult[k].itemSumID, newMbomResult[k].itemSumID);
                                        }

                                        //FOR BREAKERS
                                        connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE mbomID = ?", copyMbomID, function (err, result) {
                                            if (err)
                                                console.log("Error selecting : %s ", err);

                                            for (var i = 0; i < result.length; i++) {
                                                copyBrks[i] = result[i];

                                                newBrks[i] = {
                                                    mbomID: newMbomID,
                                                    devLayout: newMbomData.boardDesignation,
                                                    devDesignation: result[i].devDesignation,
                                                    brkPN: result[i].brkPN,
                                                    cradlePN: result[i].cradlePN,
                                                    unitOfIssue: result[i].unitOfIssue,
                                                    catCode: result[i].catCode,
                                                    devMfg: result[i].devMfg
                                                };
                                            }

                                            for (var j = 0; j < newBrks.length; j++) {
                                                connection.query("INSERT INTO " + database + "." + dbConfig.MBOM_breaker_table + " SET ?", newBrks[j], function (err, result) {
                                                    if (err)
                                                        console.log("Error inserting : %s ", err)
                                                });
                                            }

                                            connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE mbomID = ?", newMbomID, function (err, result) {
                                                if (err)
                                                    console.log("Error selecting : %s ", err);
                                                for (var k = 0; k < result.length; k++) {
                                                    brkMap.set(copyBrks[k].idDev, result[k].idDev);
                                                }


                                                //FOR SECTIONS
                                                connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_section_sum + " WHERE mbomID = ?", copyMbomID, function (err, result) {
                                                    if (err)
                                                        console.log("Error selecting : %s ", err);
                                                    for (var i = 0; i < result.length; i++) {
                                                        copySections[i] = result[i];
                                                    }

                                                    for (var j = 0; j < copySections.length; j++) {
                                                        var newBrkIDArray = [];
                                                        var newItemIDArray = [];
                                                        if (copySections[j].idDev != null) {
                                                            var copyBrkIDArray = copySections[j].idDev.split(',');
                                                            for (var k = 0; k < copyBrkIDArray.length; k++) {
                                                                newBrkIDArray[k] = brkMap.get(parseInt(copyBrkIDArray[k]));
                                                            }
                                                        }
                                                        if (copySections[j].itemSumID != null) {
                                                            var copyItemIDArray = copySections[j].itemSumID.split(',');
                                                            for (var k = 0; k < copyItemIDArray.length; k++) {
                                                                newItemIDArray[k] = itemMap.get(parseInt(copyItemIDArray[k]));
                                                            }
                                                        }

                                                        var newBrkTemp = '';
                                                        for (var m = 0; m < newBrkIDArray.length; m++) {
                                                            if (newBrkTemp == '') {
                                                                newBrkTemp = newBrkIDArray[m];
                                                            } else {
                                                                newBrkTemp += ',' + newBrkIDArray[m];
                                                            }
                                                        }

                                                        var newItemTemp = '';
                                                        for (var n = 0; n < newItemIDArray.length; n++) {
                                                            if (newItemTemp == '') {
                                                                newItemTemp = newItemIDArray[n];
                                                            } else {
                                                                newItemTemp += ',' + newItemIDArray[n];
                                                            }
                                                        }

                                                        newSections[j] = {
                                                            sectionNum: copySections[j].sectionNum,
                                                            mbomID: newMbomID,
                                                            idDev: newBrkTemp,
                                                            itemSumID: newItemTemp
                                                        };
                                                    }

                                                    for (var x = 0; x < newSections.length; x++) {
                                                        connection.query("INSERT INTO " + database + "." + dbConfig.MBOM_section_sum + " SET ?", newSections[x], function (err, result) {
                                                            if (err)
                                                                console.log("Error inserting : %s ", err);
                                                        });
                                                    }
                                                    res.locals = {title: 'Search MBOM'};
                                                    res.redirect('./searchMBOM/?bomID=' + newMbomData.jobNum + newMbomData.releaseNum + "_" + newMbomID);
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};


exports.editMBOM = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    req.getConnection(function (err, connection) {
        var data = {
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
            jobName: req.body.jobName,
            customer: req.body.customer,
            boardDesignation: req.body.boardDesignation,
            qtyBoard: parseInt(req.body.qtyBoard)
        };
        connection.query("UPDATE " + database + "." + dbConfig.MBOM_summary_table + " SET jobName = ?, customer = ?, boardDesignation = ?, qtyBoard = ? WHERE mbomID = ?", [data.jobName, data.customer, data.boardDesignation, data.qtyBoard, qs.mbomID], function(err, result) {
            if (err)
                console.log("Error updating : %s ", err);
            res.locals = {title: 'Search MBOM'};
            res.redirect('../searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + qs.mbomID);
        });
    });
};

exports.searchMBOMPost = function(req, res) {
    req.getConnection(function (err, connection) {
        var data1 = {
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
            jobName: req.body.jobName,
            customer: req.body.customer,
            boardDesignation: req.body.boardDesignation
        };
        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [data1.jobNum, data1.releaseNum], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            if (result.length == 0) {
                res.redirect('./MBOM');
            } else {
                var mbomID = result[0].mbomID;
                res.locals = {title: 'Search MBOM'};
                res.redirect('searchMBOM/?bomID=' + data1.jobNum + data1.releaseNum + "_" + mbomID);
            }

        });
    });
};

exports.searchMBOMGet = function(req, res) {
    req.getConnection(function (err, connection) {
        var urlObj = url.parse(req.originalUrl);
        urlObj.protocol = req.protocol;
        urlObj.host = req.get('host');
        var qs = queryString.parse(urlObj.search);
        var mbomID = qs.bomID.split('_')[1];
        var mbomBrkData = [];
        var mbomItemData = [];
        var comItemsData = [];
        var userItemsData = [];
        var mbomSecData = [];
        var catCodeData = [];
        var itemTypes = [];
        var currentItem;
        var mfgMap = new Map();
        var descMap = new Map();
        var pnMap = new Map();
        var itemMfgSet = new Set();

        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_user_items, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            for (var i = 0; i < result.length; i++) {
                userItemsData[i] = result[i];
            }
            connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_common_items, function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                for (var i = 0; i < result.length; i++) {
                    if (result[i].itemType == currentItem) {

                    } else {
                        itemTypes.push(result[i].itemType);
                    }
                    comItemsData[i] = result[i];
                    currentItem = result[i].itemType;
                    itemMfgSet.add(result[i].itemMfg);
                }
                for (var j = 0; j < itemTypes.length; j++) {
                    connection.query("SELECT itemType, itemMfg, itemDesc, itemPN FROM " + database + " . " + dbConfig.MBOM_common_items + " WHERE itemType = ?", itemTypes[j], function (err, results) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        //mfgMap creation
                        for (var x = 0; x < results.length; x++) {
                            if (mfgMap.has(results[x].itemType)) {
                                var temp = mfgMap.get(results[x].itemType);
                                if (!temp.includes(results[x].itemMfg)) {
                                    temp += "|" + results[x].itemMfg;
                                }
                                mfgMap.set(results[x].itemType, temp);
                            } else {
                                mfgMap.set(results[x].itemType, results[x].itemMfg);
                            }
                        }
                        //descMap creation
                        for (var y = 0; y < results.length; y++) {
                            if (descMap.has(results[y].itemType + '|' + results[y].itemMfg)) {
                                var temp = descMap.get(results[y].itemType + '|' + results[y].itemMfg);
                                if (!temp.includes(results[y].itemDesc)) {
                                    temp += "|" + results[y].itemDesc;
                                }
                                descMap.set(results[y].itemType + '|' + results[y].itemMfg, temp);
                            } else {
                                descMap.set(results[y].itemType + '|' + results[y].itemMfg, results[y].itemDesc);
                            }
                        }
                        //pnMap creation
                        for (var z = 0; z < results.length; z++) {
                            if (pnMap.has(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc)) {
                                var temp = pnMap.get(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc);
                                if (!temp.includes(results[z].itemPN)) {
                                    temp += "|" + results[z].itemPN;
                                }
                                pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, temp);
                            } else {
                                pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, results[z].itemPN);

                            }
                        }
                    });
                }
                connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE mbomID = ?", mbomID, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    var mbomData = {
                        mbomID: result[0].mbomID,
                        jobNum: result[0].jobNum,
                        releaseNum: result[0].releaseNum,
                        jobName: result[0].jobName,
                        customer: result[0].customer,
                        boardDesignation: result[0].boardDesignation,
                        qtyBoard: parseInt(result[0].qtyBoard),
                        numSections: result[0].numSections
                    };
                    connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_breaker_table + " WHERE mbomID = ?", mbomID, function (err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        for (var i = 0; i < result.length; i++) {
                            mbomBrkData[i] = result[i];
                        }
                        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_item_table + " WHERE mbomID = ?", mbomID, function (err, result) {
                            if (err)
                                console.log("Error inserting : %s ", err);
                            if (!result) {
                            } else {
                                for (var i = 0; i < result.length; i++) {
                                    mbomItemData[i] = result[i];
                                }
                            }
                            connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_section_sum + " WHERE mbomID = ?", mbomID, function (err, result) {
                                if (err)
                                    console.log("Error inserting : %s ", err);
                                if (!result) {
                                } else {
                                    for (var i = 0; i < result.length; i++) {
                                        mbomSecData[i] = {
                                            sectionNum: result[i].sectionNum,
                                            mbomID: result[i].mbomID,
                                            idDev: result[i].idDev,
                                            itemSumID: result[i].itemSumID
                                        };
                                    }
                                }
                                connection.query("SELECT * FROM " + database + "." + dbConfig.jobscope_codes_table, function (err, result) {
                                    if (err)
                                        console.log("Error inserting : %s ", err);
                                    for (var i = 0; i < result.length; i++) {
                                        catCodeData[i] = result[i].catCode;
                                    }

                                    connection.query("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id, function (err, result) {
                                        if (err)
                                            console.log("Error inserting : %s ", err);
                                        if (result.length != 0)
                                            var profilePic = '/public/uploads/' + result[0].profilePic;

                                        res.locals = {title: 'Search MBOM'};
                                        res.render('MechEng/searchMBOM', {
                                            mbomID: mbomID,
                                            mbomData: mbomData,
                                            mbomBrkData: mbomBrkData,
                                            mbomSecData: mbomSecData,
                                            mbomItemData: mbomItemData,
                                            comItemsData: comItemsData,
                                            userItemsData: userItemsData,
                                            catCodeData: catCodeData,
                                            itemTypes: itemTypes,
                                            mfgMap: mfgMap,
                                            descMap: descMap,
                                            pnMap: pnMap,
                                            itemMfgSet: itemMfgSet,
                                            profilePic: profilePic
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

exports.createComItemGET = function(req, res) {
    var catCodeData = [];
    var itemTypes = [];
    var currentItem;
    var mfgMap = new Map();
    var itemMfgSet = new Set();

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_common_items, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            for (var i = 0; i < result.length; i++) {
                if (result[i].itemType == currentItem) {

                } else {
                    itemTypes.push(result[i].itemType);
                }
                currentItem = result[i].itemType;
                itemMfgSet.add(result[i].itemMfg);
            }
            for (var j = 0; j < itemTypes.length; j++) {
                connection.query("SELECT itemType, itemMfg, itemDesc, itemPN FROM " + database + " . " + dbConfig.MBOM_common_items + " WHERE itemType = ?", itemTypes[j], function (err, results) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    //mfgMap creation
                    for (var x = 0; x < results.length; x++) {
                        if (mfgMap.has(results[x].itemType)) {
                            var temp = mfgMap.get(results[x].itemType);
                            if (!temp.includes(results[x].itemMfg)) {
                                temp += "|" + results[x].itemMfg;
                            }
                            mfgMap.set(results[x].itemType, temp);
                        } else {
                            mfgMap.set(results[x].itemType, results[x].itemMfg);
                        }
                    }
                });
            }
            connection.query("SELECT * FROM "+ database +"."+dbConfig.jobscope_codes_table, function(err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                for (var i = 0; i < result.length; i++) {
                    catCodeData[i] = result[i].catCode;
                }
                connection.query("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id, function(err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    if (result.length != 0)
                        var profilePic = '/public/uploads/' + result[0].profilePic;

                    res.locals = {title: 'Edit Item'};
                    res.render('MechEng/createComItem', {
                        itemTypes: itemTypes,
                        itemMfgSet: itemMfgSet,
                        mfgMap: mfgMap,
                        catCodeData: catCodeData,
                        profilePic: profilePic
                    });
                });
            });
        });
    });
};

exports.createComItemPOST = function(req, res) {
    req.getConnection(function (err, connection) {
        var exists;
        var comItemID;

        var itemType = req.body.itemSelect2;
        if (itemType == 'OTHER')
            itemType = (req.body.otherItemType).toUpperCase();

        var itemMfg;
        var otherMfgDropdown = req.body.mfgList;
        var mfgSelect = req.body.mfgSelect2;

        if (mfgSelect == 'OTHER' || otherMfgDropdown == 'OTHER')
            itemMfg = req.body.otherMfgType.toUpperCase();
        else if (mfgSelect)
            itemMfg = mfgSelect.split('|')[1];
        else
            itemMfg = otherMfgDropdown;

        var data2 = {
            itemType: itemType,
            itemMfg: itemMfg,
            itemDesc: (req.body.itemDesc).toUpperCase(),
            itemPN: (req.body.itemPN).toUpperCase(),
            unitOfIssue: req.body.unitOfIssue,
            catCode: req.body.catCode
        };

        connection.query("SELECT * FROM " + dbConfig.MBOM_common_items + " WHERE itemType = ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?", [data2.itemType, data2.itemMfg, data2.itemDesc, data2.itemPN], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);

            if (result.length > 0) {
                comItemID = result[0].comItemID;
                exists = true;
            } else
                exists = false;

            if (!exists) {
                connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_common_items + " SET ?", data2, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);

                    connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_common_items + " WHERE itemType = ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?", [data2.itemType, data2.itemMfg, data2.itemDesc, data2.itemPN], function (err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        comItemID = result[0].comItemID;

                        res.locals = {title: 'Create Item'};
                        res.redirect('./MBOM');
                    });
                });
            } else {
                res.locals = {title: 'Create Item'};
                res.redirect('./MBOM');
            }
        });
    });
};

exports.createUserItem = function(req, res) {
    req.getConnection(function (err, connection) {
        var exists;
        var mbomID;
        var userItemID;
        var itemSumID;
        var data1 = {
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
        };

        var itemType = req.body.itemSelect2;
        if (itemType == 'OTHER')
            itemType = (req.body.otherItemType).toUpperCase();

        var itemMfg;
        var otherMfgDropdown = req.body.mfgList;
        var mfgSelect = req.body.mfgSelect2;

        if (mfgSelect == 'OTHER' || otherMfgDropdown == 'OTHER')
            itemMfg = req.body.otherMfgType.toUpperCase();
        else if (mfgSelect)
            itemMfg = mfgSelect.split('|')[1];
        else
            itemMfg = otherMfgDropdown;

        var data2 = {
            mbomID: null,
            itemType: itemType,
            itemMfg: itemMfg,
            itemDesc: (req.body.itemDesc).toUpperCase(),
            itemPN: (req.body.itemPN).toUpperCase(),
            catCode: req.body.catCode,
            unitOfIssue: req.body.unitOfIssue
        };
        connection.query("SELECT mbomID FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [data1.jobNum, data1.releaseNum], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            mbomID = result[0].mbomID;
            data2.mbomID = mbomID;
        });
        connection.query("SELECT * FROM " + dbConfig.MBOM_user_items + " WHERE itemType = ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?", [data2.itemType, data2.itemMfg, data2.itemDesc, data2.itemPN], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);

            if (result.length > 0 && result[0].mbomID == data2.mbomID) {
                userItemID = result[0].userItemID;
                exists = true;
            } else
                exists = false;

            if (!exists) {
                connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_user_items + " SET ?", data2, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);

                    connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_user_items + " WHERE itemType = ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ? AND mbomID = ?", [data2.itemType, data2.itemMfg, data2.itemDesc, data2.itemPN, data2.mbomID], function (err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        userItemID = result[0].userItemID;

                        var data3 = {
                            itemSumID: itemSumID,
                            comItemID: null,
                            userItemID: userItemID,
                            mbomID: mbomID,
                            itemQty: req.body.itemQty,
                        };
                        connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_item_table + " SET ?", data3, function (err, result) {
                            if (err)
                                console.log("Error inserting : %s ", err);
                            res.locals = {title: 'Create Item'};
                            res.redirect('searchMBOM/?bomID=' + data1.jobNum + data1.releaseNum + "_" + mbomID);
                        });
                    });
                });
            }else {
                var data3 = {
                    itemSumID: itemSumID,
                    comItemID: null,
                    userItemID: userItemID,
                    mbomID: mbomID,
                    itemQty: req.body.itemQty,
                };
                connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_item_table + " SET ?", data3, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    res.locals = {title: 'Create Item'};
                    res.redirect('searchMBOM/?bomID=' + data1.jobNum + data1.releaseNum + "_" + mbomID);
                });
            }
        });
    });
};

exports.addItem = function(req, res) {
    req.getConnection(function (err, connection) {
        var mbomID;
        var comItemID;
        var itemSumID;
        var itemMfg = req.body.itemMfg.split('|')[1];
        var itemDesc = req.body.itemDesc.split('|')[2];
        var itemPN = req.body.itemPN.split('|')[3];
        var data1 = {
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
        };
        var data2 = {
            itemType: req.body.itemType,
            itemMfg: itemMfg,
            itemDesc: itemDesc,
            itemPN: itemPN,
        };

        connection.query("SELECT mbomID FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [data1.jobNum, data1.releaseNum], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            mbomID = result[0].mbomID;
            connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_common_items + " WHERE itemType = ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?", [data2.itemType, data2.itemMfg, data2.itemDesc, data2.itemPN], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                comItemID = result[0].comItemID;

                var data3 = {
                    comItemID: comItemID,
                    itemSumID: itemSumID,
                    mbomID: mbomID,
                    itemQty: req.body.itemQty
                };
                connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_item_table + " SET ?", data3, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    res.locals = {title: 'Add Item'};
                    res.redirect('searchMBOM/?bomID=' + data1.jobNum + data1.releaseNum + "_" + mbomID);
                });
            });
        });
    });
};

exports.copyItem = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var itemData = [];
    var mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum
    };

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_item_table + " WHERE itemSumID = ?", [qs.itemSumID], function (err, results) {
            if (err)
                console.log("Error inserting : %s ", err);
            for (var i = 0; i < results.length; i++) {
                itemData = {
                    comItemID: results[i].comItemID,
                    userItemID: results[i].userItemID,
                    mbomID: results[i].mbomID,
                    itemQty: results[i].itemQty,
                    /*itemType: results[i].itemType,
                    itemMfg: results[i].itemMfg,
                    itemDesc: results[i].itemDesc,
                    itemPN: results[i].itemPN*/
                }
            }
            connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_item_table + " SET ?", itemData, function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);


                res.locals = {title: 'Copy Item'};
                res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
            });
        });
    });
};

exports.editComItemGET = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);

    var comItemsData = [];
    var catCodeData = [];
    var itemTypes = [];
    var currentItem;
    var mfgMap = new Map();
    var itemMfgSet = new Set();

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_common_items, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            for (var i = 0; i < result.length; i++) {
                if (result[i].itemType == currentItem) {

                } else {
                    itemTypes.push(result[i].itemType);
                }
                currentItem = result[i].itemType;
                itemMfgSet.add(result[i].itemMfg);
            }
            for (var j = 0; j < itemTypes.length; j++) {
                connection.query("SELECT itemType, itemMfg, itemDesc, itemPN FROM " + database + " . " + dbConfig.MBOM_common_items + " WHERE itemType = ?", itemTypes[j], function (err, results) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    //mfgMap creation
                    for (var x = 0; x < results.length; x++) {
                        if (mfgMap.has(results[x].itemType)) {
                            var temp = mfgMap.get(results[x].itemType);
                            if (!temp.includes(results[x].itemMfg)) {
                                temp += "|" + results[x].itemMfg;
                            }
                            mfgMap.set(results[x].itemType, temp);
                        } else {
                            mfgMap.set(results[x].itemType, results[x].itemMfg);
                        }
                    }
                });
            }
            connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_common_items+" WHERE comItemID = ?", qs.comItemID, function (err, result) {
                if (err)
                    console.log("Error selecting : %s ", err);
                comItemsData = result[0];

                connection.query("SELECT * FROM "+ database +"."+dbConfig.jobscope_codes_table, function(err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    for (var i = 0; i < result.length; i++) {
                        catCodeData[i] = result[i].catCode;
                    }
                    connection.query("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id, function(err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        if (result.length != 0)
                            var profilePic = '/public/uploads/' + result[0].profilePic;

                        res.locals = {title: 'Edit Item'};
                        res.render('MechEng/editComItem', {
                            comItemsData: comItemsData,
                            itemTypes: itemTypes,
                            itemMfgSet: itemMfgSet,
                            mfgMap: mfgMap,
                            catCodeData: catCodeData,
                            profilePic: profilePic
                        });
                    });
                });
            });
        });
    });
};

exports.editComItemPOST = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);

    var comItemsData = [];
    var itemTypes = [];
    var currentItem;
    var mfgMap = new Map();
    var descMap = new Map();
    var pnMap = new Map();

    var data1 = [];
    var mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_common_items, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            for (var i = 0; i < result.length; i++) {
                if (result[i].itemType == currentItem) {

                } else {
                    itemTypes.push(result[i].itemType);
                }
                comItemsData[i] = result[i];
                currentItem = result[i].itemType;
            }
            for (var j = 0; j < itemTypes.length; j++) {
                connection.query("SELECT itemType, itemMfg, itemDesc, itemPN FROM " + database + " . " + dbConfig.MBOM_common_items + " WHERE itemType = ?", itemTypes[j], function (err, results) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    //mfgMap creation
                    for (var x = 0; x < results.length; x++) {
                        if (mfgMap.has(results[x].itemType)) {
                            var temp = mfgMap.get(results[x].itemType);
                            if (!temp.includes(results[x].itemMfg)) {
                                temp += "|" + results[x].itemMfg;
                            }
                            mfgMap.set(results[x].itemType, temp);
                        } else {
                            mfgMap.set(results[x].itemType, results[x].itemMfg);
                        }
                    }
                    //descMap creation
                    for (var y = 0; y < results.length; y++) {
                        if (descMap.has(results[y].itemType + '|' + results[y].itemMfg)) {
                            var temp = descMap.get(results[y].itemType + '|' + results[y].itemMfg);
                            if (!temp.includes(results[y].itemDesc)) {
                                temp += "|" + results[y].itemDesc;
                            }
                            descMap.set(results[y].itemType + '|' + results[y].itemMfg, temp);
                        } else {
                            descMap.set(results[y].itemType + '|' + results[y].itemMfg, results[y].itemDesc);
                        }
                    }
                    //pnMap creation
                    for (var z = 0; z < results.length; z++) {
                        if (pnMap.has(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc)) {
                            var temp = pnMap.get(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc);
                            if (!temp.includes(results[z].itemPN)) {
                                temp += "|" + results[z].itemPN;
                            }
                            pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, temp);
                        } else {
                            pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, results[z].itemPN);

                        }
                    }
                });
            }
            connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_item_table + " WHERE itemSumID = ?", [qs.itemSumID], function (err, results) {
                if (err)
                    console.log("Error inserting : %s ", err);
                for (var i = 0; i < results.length; i++) {
                    data1[i] = results[i];
                }
                connection.query("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id, function(err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    if (result.length != 0)
                        var profilePic = '/public/uploads/' + result[0].profilePic;

                    res.locals = {title: 'Edit Item'};
                    res.render('MechEng/MBOMeditComItem', {
                        mbomItemData: data1,
                        mbomData: mbomData,
                        comItemsData: comItemsData,
                        itemTypes: itemTypes,
                        mfgMap: mfgMap,
                        descMap: descMap,
                        pnMap: pnMap,
                        profilePic: profilePic
                    });
                });
            });
        });
    });
};

exports.saveComItemChanges = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var itemType = req.body.itemSelect2;
    if (itemType == 'OTHER')
        itemType = (req.body.otherItemType).toUpperCase();
    var itemMfg;
    var otherMfgDropdown = req.body.mfgList;
    var mfgSelect = req.body.mfgSelect2;
    if (mfgSelect == 'OTHER' || otherMfgDropdown == 'OTHER')
        itemMfg = req.body.otherMfgType.toUpperCase();
    else if (mfgSelect)
        itemMfg = mfgSelect.split('|')[1];
    else
        itemMfg = otherMfgDropdown;

    var updateData = {
        itemType: itemType,
        itemMfg: itemMfg,
        itemDesc: (req.body.itemDesc).toUpperCase(),
        itemPN: (req.body.itemPN).toUpperCase(),
        unitOfIssue: req.body.unitOfIssue,
        catCode: req.body.catCode
    };

    req.getConnection(function (err, connection) {
        connection.query("UPDATE "+database+"."+dbConfig.MBOM_common_items+" SET itemType = ?, itemMfg = ?, itemDesc = ?, itemPN = ?, unitOfIssue = ?, catCode = ? WHERE comItemID = ?",[updateData.itemType, updateData.itemMfg, updateData.itemDesc, updateData.itemPN, updateData.unitOfIssue, updateData.catCode, qs.comItemID] ,function(err, result) {
            if (err)
                console.log("Error updating : %s ", err);
            res.locals = {title: 'Edit Common Item'};
            res.redirect('../MBOM');

        });
    });
};

exports.MBOMsaveComItemChanges = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var itemSumID = qs.itemSumID;
    var updateData = {
        itemQty: req.body.itemQty,
        itemType: req.body.itemType,
        itemMfg: req.body.itemMfg.split('|')[1],
        itemDesc: req.body.itemDesc.split('|')[2],
        itemPN: req.body.itemPN.split('|')[3]
    };
    var mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum
    };
    req.getConnection(function (err, connection) {
        connection.query("SELECT comItemID FROM " + database + " . " + dbConfig.MBOM_common_items + " WHERE itemType= ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?", [updateData.itemType, updateData.itemMfg, updateData.itemDesc, updateData.itemPN], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            var comItemID = result[0].comItemID;

            connection.query("UPDATE " + database + "." + dbConfig.MBOM_item_table + " SET comItemID = ?, itemQty = ? WHERE itemSumID = ?", [comItemID, updateData.itemQty, itemSumID], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                res.locals = {title: 'Edit Common Item'};
                res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
            });
        });
    });
};

exports.editUserItem = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);

    var comItemsData = [];
    var userItemData = [];
    var catCodeData = [];
    var itemTypes = [];
    var currentItem;
    var mfgMap = new Map();
    var descMap = new Map();
    var pnMap = new Map();
    var itemMfgSet = new Set();

    var data1 = [];
    var mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_common_items, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            for (var i = 0; i < result.length; i++) {
                if (result[i].itemType == currentItem) {

                } else {
                    itemTypes.push(result[i].itemType);
                }
                comItemsData[i] = result[i];
                currentItem = result[i].itemType;
                itemMfgSet.add(result[i].itemMfg);
            }
            for (var j = 0; j < itemTypes.length; j++) {
                connection.query("SELECT itemType, itemMfg, itemDesc, itemPN FROM " + database + " . " + dbConfig.MBOM_common_items + " WHERE itemType = ?", itemTypes[j], function (err, results) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    //mfgMap creation
                    for (var x = 0; x < results.length; x++) {
                        if (mfgMap.has(results[x].itemType)) {
                            var temp = mfgMap.get(results[x].itemType);
                            if (!temp.includes(results[x].itemMfg)) {
                                temp += "|" + results[x].itemMfg;
                            }
                            mfgMap.set(results[x].itemType, temp);
                        } else {
                            mfgMap.set(results[x].itemType, results[x].itemMfg);
                        }
                    }
                    //descMap creation
                    for (var y = 0; y < results.length; y++) {
                        if (descMap.has(results[y].itemType + '|' + results[y].itemMfg)) {
                            var temp = descMap.get(results[y].itemType + '|' + results[y].itemMfg);
                            if (!temp.includes(results[y].itemDesc)) {
                                temp += "|" + results[y].itemDesc;
                            }
                            descMap.set(results[y].itemType + '|' + results[y].itemMfg, temp);
                        } else {
                            descMap.set(results[y].itemType + '|' + results[y].itemMfg, results[y].itemDesc);
                        }
                    }
                    //pnMap creation
                    for (var z = 0; z < results.length; z++) {
                        if (pnMap.has(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc)) {
                            var temp = pnMap.get(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc);
                            if (!temp.includes(results[z].itemPN)) {
                                temp += "|" + results[z].itemPN;
                            }
                            pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, temp);
                        } else {
                            pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, results[z].itemPN);

                        }
                    }
                });
            }
            connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_item_table + " WHERE itemSumID = ?", [qs.itemSumID], function (err, results) {
                if (err)
                    console.log("Error inserting : %s ", err);
                for (var i = 0; i < results.length; i++) {
                    data1[i] = results[i];
                    if (data1[i].userItemID != null) {
                        connection.query("SELECT * FROM "+database+"."+dbConfig.MBOM_user_items+ " WHERE userItemID = ?", data1[i].userItemID, function(err, results) {
                            userItemData = results[0];
                        });
                    }
                }
                connection.query("SELECT * FROM "+ database +"."+dbConfig.jobscope_codes_table, function(err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    for (var i = 0; i < result.length; i++) {
                        catCodeData[i] = result[i].catCode;
                    }
                    connection.query("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id, function(err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        if (result.length != 0)
                            var profilePic = '/public/uploads/' + result[0].profilePic;

                        res.locals = {title: 'Edit User Item'};
                        res.render('MechEng/editUserItem', {
                            mbomItemData: data1,
                            mbomData: mbomData,
                            comItemsData: comItemsData,
                            userItemData: userItemData,
                            catCodeData: catCodeData,
                            itemTypes: itemTypes,
                            mfgMap: mfgMap,
                            descMap: descMap,
                            pnMap: pnMap,
                            itemMfgSet: itemMfgSet,
                            profilePic: profilePic
                        });
                    });
                });
            });
        });
    });
};


exports.saveUserItemChanges = function(req, res) {
    var mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum
    };
    var itemSumID = req.body.itemSumID;
//Get new data start
    var itemType = req.body.itemSelect2;
    if (itemType == 'OTHER')
        itemType = (req.body.otherItemType).toUpperCase();
    var itemMfg;
    var otherMfgDropdown = req.body.mfgList;
    var mfgSelect = req.body.mfgSelect2;
    if (mfgSelect == 'OTHER' || otherMfgDropdown == 'OTHER')
        itemMfg = req.body.otherMfgType.toUpperCase();
    else if (mfgSelect)
        itemMfg = mfgSelect.split('|')[1];
    else
        itemMfg = otherMfgDropdown;
    var updateData = {
        mbomID: req.body.mbomID,
        itemQty: req.body.itemQty,
        itemType: itemType,
        itemMfg: itemMfg,
        itemDesc: (req.body.itemDesc).toUpperCase(),
        unitOfIssue: req.body.unitOfIssue,
        catCode: req.body.catCode,
        itemPN: (req.body.itemPN).toUpperCase()
    };
//Get new data end
    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + dbConfig.MBOM_user_items + " WHERE itemPN = ? AND mbomID = ? ", [updateData.itemPN, updateData.mbomID], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            if (result.length > 0) {
                connection.query("UPDATE " + database + "." + dbConfig.MBOM_user_items + " SET itemType = ?, itemMfg = ?, " +
                    "itemDesc = ?, unitOfIssue = ?, catCode = ? WHERE itemPN = ? AND mbomID = ?", [updateData.itemType, updateData.itemMfg,
                    updateData.itemDesc, updateData.unitOfIssue, updateData.catCode, updateData.itemPN, updateData.mbomID], function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                });
                var userItemID = result[0].userItemID;
                //update item sum
                connection.query("UPDATE " + database + "." + dbConfig.MBOM_item_table + " SET itemQty = ? WHERE itemSumID = ?", [updateData.itemQty, itemSumID], function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                });
                connection.query("UPDATE " + database + "." + dbConfig.MBOM_item_table + " SET userItemID = ? WHERE itemSumID = ? AND mbomID = ? ", [userItemID, itemSumID, updateData.mbomID], function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                });
            } else {
                connection.query("INSERT INTO " + database + "." + dbConfig.MBOM_user_items + " SET itemType = ?, itemMfg = ?, " +
                    "itemDesc = ?, unitOfIssue = ?, catCode = ?, itemPN = ?, mbomID = ?", [updateData.itemType, updateData.itemMfg, updateData.itemDesc, updateData.unitOfIssue, updateData.catCode, updateData.itemPN, updateData.mbomID], function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    connection.query("SELECT * FROM " + dbConfig.MBOM_user_items + " WHERE itemPN = ? AND mbomID = ?", [updateData.itemPN, updateData.mbomID], function (err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        var userItemID = result[0].userItemID;
                        //update item sum
                        connection.query("UPDATE " + database + "." + dbConfig.MBOM_item_table + " SET userItemID = ?, itemQty = ? WHERE itemSumID = ?", [userItemID, updateData.itemQty, itemSumID], function (err, result) {
                            if (err)
                                console.log("Error inserting : %s ", err);
                        });
                    });
                });
            }
        });
        res.locals = {title: 'Edit User Item'};
        res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
    });
};

exports.deleteItem = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
    };

    req.getConnection(function (err, connection) {
        connection.query("SELECT userItemID FROM " + database + "." + dbConfig.MBOM_item_table + " WHERE itemSumID = ?", [qs.itemSumID], function (err, result) {
            if (err)
                throw err;
            var userItemID = result[0].userItemID;
            connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_item_table + " WHERE userItemID = ? AND mbomID = ?", [userItemID, mbomData.mbomID], function(err, result) {
                if (result.length < 1) {
                    connection.query("DELETE FROM " + database + "." + dbConfig.MBOM_user_items + " WHERE userItemID = ?", [userItemID], function (err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                    });
                }
            });
        });

        connection.query("DELETE FROM " + database + "." + dbConfig.MBOM_item_table + " WHERE itemSumID = ?", [qs.itemSumID], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);

            connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_section_sum + " WHERE mbomID = ?", [mbomData.mbomID], function (err, result) {
                if (result.length != 0) {
                    var updateData;
                    var newItems = '';
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].itemSumID != null) {
                            var itemSumIDList = result[i].itemSumID.split(',');
                            if (itemSumIDList.includes(qs.itemSumID.toString())) {
                                var newItemSumIDList = [];
                                for (var j = 0; j < itemSumIDList.length; j++) {
                                    if (itemSumIDList[j] == qs.itemSumID.toString()) {

                                    } else {
                                        newItemSumIDList.push(itemSumIDList[j])
                                    }
                                }
                                for (var k = 0; k < newItemSumIDList.length; k++) {
                                    var itemTemp = newItemSumIDList[k];
                                    if (newItems == '') {
                                        newItems = itemTemp;
                                    } else {
                                        newItems += ',' + itemTemp;
                                    }
                                }

                                if (newItems == '') {
                                    updateData = {
                                        secID: result[i].secID,
                                        itemSumID: null
                                    };
                                } else {
                                    updateData = {
                                        secID: result[i].secID,
                                        itemSumID: newItems
                                    };
                                }
                            } else {
                                updateData = {
                                    secID: result[i].secID,
                                    itemSumID: result[i].itemSumID
                                }
                            }
                        }
                    }
                    connection.query("SELECT idDev FROM " + database + "." + dbConfig.MBOM_section_sum + " WHERE mbomID = ? ", [mbomData.mbomID], function (err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        if (result.length > 0) {
                            connection.query("UPDATE " + database + "." + dbConfig.MBOM_section_sum + " SET itemSumID = ? WHERE secID = ?", [updateData.itemSumID, updateData.secID], function (err, result) {
                                if (err)
                                    throw err;
                                res.locals = {title: 'Delete Item'};
                                res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
                            });
                        }
                    });

                } else {
                    res.locals = {title: 'Delete Item'};
                    res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
                }
            });
        });
    });
};

exports.addBrk = function(req, res) {
    req.getConnection(function (err, connection) {
        var data1 = {
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
            mbomID: req.body.mbomID
        };
//Splitting up the device designation
        var designations = req.body.devDesignation;
        var designationArrayInitial = designations.split(',').map(item => item.trim());
        var designationArrayFinal = [];
        for (var i = 0; i < designationArrayInitial.length; i++) {
            if (designationArrayInitial[i].includes("(") == true) {
                var designationInterval = (designationArrayInitial[i].slice(designationArrayInitial[i].indexOf('(') + 1, designationArrayInitial[i].indexOf(')'))).split('-');
                var designationInitialText = designationArrayInitial[i].slice(0, designationArrayInitial[i].indexOf('('));
                var designationFinalText = designationArrayInitial[i].slice(designationArrayInitial[i].indexOf(')') + 1, designationArrayInitial[i].length);
                for (var j = parseInt(designationInterval[0]); j <= parseInt(designationInterval[1]); j++) {
                    var newDesignation = designationInitialText + j.toString() + designationFinalText;
                    designationArrayFinal.push(newDesignation);
                }
            } else {
                designationArrayFinal.push(designationArrayInitial[i]);
            }
        }
        for (var i = 0; i < designationArrayFinal.length; i++) {
            var data = {
                mbomID: req.body.mbomID,
                devDesignation: designationArrayFinal[i],
                devLayout: req.body.devLayout,
                unitOfIssue: req.body.unitOfIssue,
                catCode: req.body.catCode,
                brkPN: req.body.brkPN,
                cradlePN: req.body.cradlePN,
                devMfg: req.body.devMfg

            };
            connection.query("INSERT INTO " + database + "." + dbConfig.MBOM_breaker_table + " set ?", data, function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
            });
        }
        res.locals = {title: 'New Quote'};
        res.redirect('searchMBOM/?bomID=' + data1.jobNum + data1.releaseNum + "_" + data1.mbomID);
    });
};

exports.copyBreaker = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE idDev = ?", [qs.idDev], function (err, results) {
            if (err)
                console.log("Error selecting : %s ", err);
            for (var i = 0; i < results.length; i++) {
                var breakerData = results[i];
                var breakerData = {
                    mbomID: results[i].mbomID,
                    devLayout: results[i].devLayout,
                    devDesignation: results[i].devDesignation,
                    unitOfIssue: results[i].unitOfIssue,
                    catCode: results[i].catCode,
                    brkPN: results[i].brkPN,
                    cradlePN: results[i].cradlePN,
                    devMfg: results[i].devMfg
                }
            }
            connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_breaker_table + " SET ?", breakerData, function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);

                res.locals = {title: 'Copy Breaker'};
                res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
            });
        });
    });
};

exports.editBreaker = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var data1 = [];
    var mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE idDev = ?", [qs.idDev], function (err, results) {
            if (err)
                console.log("Error inserting : %s ", err);
            for (var i = 0; i < results.length; i++) {
                data1[i] = results[i];
            }
            connection.query("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id, function(err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                if (result.length != 0)
                    var profilePic = '/public/uploads/' + result[0].profilePic;

                res.locals = {title: 'Edit Breaker'};
                res.render('MechEng/editBreaker', {
                    mbomBrkData: data1,
                    mbomData: mbomData,
                    profilePic: profilePic
                });
            });
        });
    });
};

exports.saveBreakerChanges = function(req, res) {
    req.getConnection(function (err, connection) {
        var mbomData = {
            mbomID: req.body.mbomID,
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
        };
        var updateData = {
            idDev: req.body.idDev,
            mbomID: req.body.mbomID,
            devLayout: req.body.devLayout,
            devDesignation: req.body.devDesignation,
            unitOfIssue: req.body.unitOfIssue,
            catCode: req.body.catCode,
            brkPN: req.body.brkPN,
            cradlePN: req.body.cradlePN,
            devMfg: req.body.devMfg
        };
        connection.query("UPDATE " + database + "." + dbConfig.MBOM_breaker_table + " SET mbomID = ?, " +
            " devLayout = ?, devDesignation = ?, unitOfIssue = ?, catCode = ?, brkPN = ?, cradlePN = ? WHERE idDev = ?", [updateData.mbomID,
            updateData.devLayout, updateData.devDesignation, updateData.unitOfIssue, updateData.catCode, updateData.brkPN, updateData.cradlePN, updateData.idDev], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);

            res.locals = {title: 'Copy Breaker'};
            res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
        });
    });
};

exports.deleteBreaker = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);

    req.getConnection(function (err, connection) {
        var mbomData = {
            mbomID: req.body.mbomID,
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
        };
        connection.query("DELETE FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE idDev = ?", [qs.idDev], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);

            connection.query("SELECT * FROM " + database + "." + dbConfig.MBOM_section_sum + " WHERE mbomID = ?", [mbomData.mbomID], function (err, result) {
                var newBkrs = '';
                for (var i = 0; i < result.length; i++) {
                    if (result[i].idDev != null) {
                        var idDevList = result[i].idDev.split(',');
                        if (idDevList.includes(qs.idDev.toString())) {
                            var newIdDevList = [];
                            for (var j = 0; j < idDevList.length; j++) {
                                if (idDevList[j] == qs.idDev.toString()) {

                                } else {
                                    newIdDevList.push(idDevList[j])
                                }
                            }
                            for (var k = 0; k < newIdDevList.length; k++) {
                                var bkrTemp = newIdDevList[k];
                                if (newBkrs == '') {
                                    newBkrs = bkrTemp;
                                } else {
                                    newBkrs += ',' + bkrTemp;
                                }
                            }
                            var updateData = {};
                            if (newBkrs == '') {
                                updateData = {
                                    secID: result[i].secID,
                                    idDev: null
                                };
                            } else {
                                updateData = {
                                    secID: result[i].secID,
                                    idDev: newBkrs
                                };
                            }
                            connection.query("UPDATE " + database + "." + dbConfig.MBOM_section_sum + " SET idDev = ? WHERE secID = ?", [updateData.idDev, updateData.secID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                        }
                    }
                }
            });
        });
        res.locals = {title: 'Delete Breaker'};
        res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
    });
};

exports.mbomAddSection = function(req, res) {
    req.getConnection(function (err, connection) {
        var data = {
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
        };
        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [data.jobNum, data.releaseNum], function (err, result) {
            var numSections = result[0].numSections + 1;
            var mbomID = result[0].mbomID;
            connection.query("UPDATE " + database + "." + dbConfig.MBOM_summary_table + " SET numSections = ? WHERE jobNum = ? AND releaseNum = ?", [numSections, data.jobNum, data.releaseNum], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                res.locals = {title: 'New Quote'};
                res.redirect('searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + mbomID);
            });
        });
    });
};

exports.mbomResetSection = function(req, res) {
    req.getConnection(function (err, connection) {
        var data = {
            jobNum: req.body.jobNum,
            releaseNum: req.body.releaseNum,
        };
        var numSections = 0;
        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [data.jobNum, data.releaseNum], function (err, result) {
            let mbomID = result[0].mbomID;
            connection.query("UPDATE " + database + "." + dbConfig.MBOM_summary_table + " SET numSections = ? WHERE jobNum = ? AND releaseNum = ?", [numSections, data.jobNum, data.releaseNum], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                connection.query("DELETE FROM " + database + " . " + dbConfig.MBOM_section_sum + " WHERE mbomID = ?", [mbomID], function (err, result) {
                    res.locals = {title: 'New Quote'};
                    res.redirect('searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + mbomID);
                });
            });
        });
    });
};

exports.mbomDeleteSection = function(req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var selectedSec = qs.selectedSec;
    var numSections = qs.numSections;

    req.getConnection(function (err, connection) {
        var data = {
            mbomID: req.body.mbomID[0],
            jobNum: req.body.jobNum[0],
            releaseNum: req.body.releaseNum[0]
        };

        connection.query("DELETE FROM " + database + " . " + dbConfig.MBOM_section_sum + " WHERE mbomID = ? AND sectionNum = ?", [data.mbomID[0], selectedSec], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
        });

        for(var i = parseInt(selectedSec) + 1; i <= numSections; i++){
            connection.query("UPDATE " + database + " . " + dbConfig.MBOM_section_sum + " SET sectionNum = ? WHERE mbomID = ? AND sectionNum = ?", [i - 1, data.mbomID[0], i], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
            });
        }
        connection.query("UPDATE " + database + "." + dbConfig.MBOM_summary_table + " SET numSections = ? WHERE mbomID = ?", [(numSections - 1), data.mbomID], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
        });

        res.locals = {title: 'New Quote'};
        res.redirect('../searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + data.mbomID);
    });
};

exports.sectionConfigure = function(req, res) {
    req.getConnection(function (err, connection) {
        var data = [];
        if(req.body.sectionNum == 0){
            data[0] = {
                sectionNum: req.body.sectionNum,
                mbomID: req.body.mbomID
            }
        } else if (req.body.sectionNum.length == 1) {
            data[0] = {
                sectionNum: req.body.sectionNum,
                idDev: req.body.idDev,
                itemSumID: req.body.itemSumID,
                mbomID: req.body.mbomID
            }
        } else {
            for (var i = 0; i < req.body.totalSection; i++) {
                data[i] = {
                    sectionNum: (req.body.sectionNum)[i],
                    idDev: (req.body.idDev)[i],
                    itemSumID: (req.body.itemSumID)[i],
                    mbomID: (req.body.mbomID)[i]
                };
            }
        }

        if(data[0].sectionNum != 0){
            for (var j = 0; j < data.length; j++) {
                let secData = data[j];
                connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_section_sum + " WHERE sectionNum = ? AND mbomID = ?", [secData.sectionNum, secData.mbomID], function (err, result) {
                    if (!result.length) {
                        if (secData.idDev == '') {
                            connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_section_sum + " SET sectionNum = ?, idDev = ?, itemSumID = ?, mbomID = ?", [secData.sectionNum, null, secData.itemSumID, secData.mbomID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                        } else if (secData.itemSumID == '') {
                            connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_section_sum + " SET sectionNum = ?, idDev = ?, itemSumID = ?, mbomID = ?", [secData.sectionNum, secData.idDev, null, secData.mbomID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                        } else {
                            connection.query("INSERT INTO " + database + " . " + dbConfig.MBOM_section_sum + " SET ?", secData, function (err, result) {
                                if (err)
                                    throw err;
                            });
                        }
                    } else {
                        if (secData.idDev == '') {
                            connection.query("UPDATE " + database + " . " + dbConfig.MBOM_section_sum + " SET idDev = ?, itemSumID = ? WHERE secID = ?", [null, secData.itemSumID, result[0].secID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                        } else if (secData.itemSumID == '') {
                            connection.query("UPDATE " + database + " . " + dbConfig.MBOM_section_sum + " SET idDev = ?, itemSumID = ? WHERE secID = ?", [secData.idDev, null, result[0].secID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                        } else {
                            connection.query("UPDATE " + database + "." + dbConfig.MBOM_section_sum + " SET idDev = ?, itemSumID = ? WHERE secID = ?", [secData.idDev, secData.itemSumID, result[0].secID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                        }
                    }
                });
            }
        }
        connection.query("SELECT jobNum, releaseNum FROM " + database + "." + dbConfig.MBOM_summary_table + " WHERE mbomID = ?", data[0].mbomID, function (err, result) {
            var jobNum = result[0].jobNum;
            var releaseNum = result[0].releaseNum;

            res.redirect('searchMBOM/?bomID=' + jobNum + releaseNum + "_" + data[0].mbomID)
        });
    });
};


exports.generateMBOM = function (req, res) {
    const downloadsFolder = require('downloads-folder');
    var mbomID = req.body.mbomID;
    var jobNum = req.body.jobNum;
    var releaseNum = req.body.releaseNum;

    req.getConnection(function (err, connection) {
        var workbook = new Excel.Workbook();
        var sheet = workbook.addWorksheet(jobNum + releaseNum + ' Jobscope BOM');

        sheet.columns = [
            {header: 'Assembly Number:', key: 'assemblyNum', width: 20, style: {font: {name: 'Calibri', size: 11}}},
            {
                header: 'Item & BOM Sequence Number:',
                key: 'seqNum',
                width: 30,
                style: {font: {name: 'Calibri', size: 11}}
            },
            {
                header: 'Component Part Number:',
                key: 'compPartNum',
                width: 30,
                style: {font: {name: 'Calibri', size: 11}}
            },
            {header: 'Description 1:', key: 'desc1', width: 50, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Description 2:', key: 'desc2', width: 50, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Description 3:', key: 'desc3', width: 50, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Description 4:', key: 'desc4', width: 50, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Quantity Per:', key: 'qty', width: 20, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Unit Of Issue:', key: 'unitOfIssue', width: 20, style: {font: {name: 'Calibri', size: 11}}},
            {
                header: 'Unit Of Purchase:',
                key: 'unitOfPurchase',
                width: 20,
                style: {font: {name: 'Calibri', size: 11}}
            },
            {header: 'Category Code:', key: 'categoryCode', width: 20, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Make Part:', key: 'makePart', width: 20, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Buy Part', key: 'buyPart', width: 20, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Stock Part', key: 'stockPart', width: 20, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Manufacturer:', key: 'manufacturer', width: 20, style: {font: {name: 'Calibri', size: 11}}},
            {header: 'Device Designation:', key: 'deviceDes', width: 50, style: {font: {name: 'Calibri', size: 11}}}
        ];
        sheet.getRow('1').font = {name: 'Calibri', size: 11, bold: true};

        connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE mbomID = ?", mbomID, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_section_sum + " WHERE mbomID = ?", mbomID, function (err, result1) {
                if (err)
                    console.log("Error inserting : %s ", err);
                connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_item_table + " WHERE mbomID = ?", mbomID, function (err, result2) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    connection.query("SELECT * FROM "+database+"."+dbConfig.MBOM_user_items+" WHERE mbomID = ?", mbomID, function(err, userItemResult) {
                        if (err)
                            console.log("Error selecting : %s ", err);
                        connection.query("SELECT * FROM "+database+"."+dbConfig.MBOM_common_items, function(err, comItemResult) {
                            if (err)
                                console.log("Error selecting : %s ", err);
                            connection.query("SELECT * FROM " + database + " . " + dbConfig.MBOM_breaker_table + " WHERE mbomID = ?", mbomID, function (err, result3) {
                                if (err)
                                    console.log("Error inserting : %s ", err);

                                var mbomAssemNumArr = [];

                                //FOR SECTION
                                for (var i = 0; i < result1.length; i++) {
                                    if (i < 9)
                                        var pre = '10';
                                    else
                                        var pre = '1';
                                    var assemblyNum = jobNum + releaseNum + '-MBOM-' + pre + result1[i].sectionNum;
                                    mbomAssemNumArr.push(assemblyNum);
                                    var count = 1;

                                    sheet.addRow({
                                        assemblyNum: assemblyNum,
                                        seqNum: null,
                                        compPartNum: assemblyNum,
                                        desc1: assemblyNum + ' Bill of Material',
                                        desc2: null,
                                        desc3: null,
                                        desc4: null,
                                        qty: 1,
                                        unitOfIssue: 'EA',
                                        unitOfPurchase: 'EA',
                                        categoryCode: '82-BOM',
                                        makePart: 1,
                                        buyPart: 0,
                                        stockPart: 0,
                                        manufacturer: 'SAI',
                                        deviceDes: null
                                    });

                                    //FOR ITEMS
                                    if (result1[i].itemSumID != null) {
                                        var itemIDList = result1[i].itemSumID.split(',');
                                        var itemArr = [];
                                        for (var j = 0; j < result2.length; j++) {
                                            for (var k = 0; k < itemIDList.length; k++) {
                                                if (result2[j].itemSumID == itemIDList[k]) {
                                                    if (result2[j].userItemID != null) {
                                                        for (var x = 0; x < userItemResult.length; x++) {
                                                            if (userItemResult[x].userItemID == result2[j].userItemID) {
                                                                itemArr.push({
                                                                    itemID: userItemResult[x].userItemID,
                                                                    sumID: result2[j].itemSumID,
                                                                    itemPN: userItemResult[x].itemPN,
                                                                    qty: result2[j].itemQty,
                                                                    itemMfg: userItemResult[x].itemMfg,
                                                                    itemDesc: userItemResult[x].itemDesc,
                                                                    unitOfIssue: userItemResult[x].unitOfIssue,
                                                                    catCode: userItemResult[x].catCode
                                                                });
                                                            }
                                                        }
                                                    } else {
                                                        for (var x = 0; x < comItemResult.length; x++) {
                                                            if (comItemResult[x].comItemID == result2[j].comItemID) {
                                                                itemArr.push({
                                                                    itemID: comItemResult[x].comItemID,
                                                                    sumID: result2[j].itemSumID,
                                                                    itemPN: comItemResult[x].itemPN,
                                                                    qty: result2[j].itemQty,
                                                                    itemMfg: comItemResult[x].itemMfg,
                                                                    itemDesc: comItemResult[x].itemDesc,
                                                                    unitOfIssue: comItemResult[x].unitOfIssue,
                                                                    catCode: comItemResult[x].catCode
                                                                });
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        var totalQty = [];
                                        var obj = null;
                                        for (var f = 0; f < itemArr.length; f++) {
                                            obj = itemArr[f];
                                            if (!totalQty[obj.itemID]) {
                                                totalQty[obj.itemID] = obj;
                                            } else {
                                                totalQty[obj.itemID].qty += obj.qty;
                                                totalQty[obj.itemID].itemDesc = obj.itemDesc;
                                            }
                                        }
                                        var totalQtyResults = [];
                                        for (let prop in totalQty)
                                            totalQtyResults.push(totalQty[prop]);

                                        for (let item2 of totalQtyResults) {
                                            if (count < 10)
                                                var seqNum = '00' + count;
                                            else if (count < 100)
                                                var seqNum = '0' + count;
                                            else
                                                var seqNum = count;

                                            var itemPN = item2.itemPN;
                                            var qty = item2.qty;
                                            var itemDesc = item2.itemDesc;
                                            var itemDesc1 = itemDesc.substring(0, 40);
                                            var itemDesc2 = itemDesc.substring(40, 80);
                                            var itemDesc3 = itemDesc.substring(80, 120);
                                            var itemDesc4 = itemDesc.substring(120, 160);
                                            var unitOfIssue = item2.unitOfIssue;
                                            var catCode = item2.catCode;
                                            var itemMfg = item2.itemMfg;

                                            sheet.addRow({
                                                assemblyNum: assemblyNum,
                                                seqNum: seqNum.toString(),
                                                compPartNum: itemPN,
                                                desc1: itemDesc1,
                                                desc2: itemDesc2,
                                                desc3: itemDesc3,
                                                desc4: itemDesc4,
                                                qty: qty,
                                                unitOfIssue: unitOfIssue,
                                                unitOfPurchase: unitOfIssue,
                                                categoryCode: catCode,
                                                makePart: 0,
                                                buyPart: 1,
                                                stockPart: 0,
                                                manufacturer: itemMfg,
                                                deviceDes: null
                                            });
                                            count++;
                                        }
                                    }
                                    //FOR BRKS
                                    if (result1[i].idDev != null) {
                                        var devIDList = result1[i].idDev.split(',');
                                        var brkArr = [];
                                        for (var j = 0; j < result3.length; j++) {
                                            for (var k = 0; k < devIDList.length; k++) {
                                                if (result3[j].idDev == devIDList[k]) {
                                                    brkArr.push({
                                                        brkPN: result3[j].brkPN,
                                                        cradlePN: result3[j].cradlePN,
                                                        devDesignation: result3[j].devDesignation,
                                                        qty: 1,
                                                        unitOfIssue: result3[j].unitOfIssue,
                                                        catCode: result3[j].catCode,
                                                        devMfg: result3[j].devMfg
                                                    });
                                                }
                                            }
                                        }

                                        var totalQty = [];
                                        var obj = null;
                                        for (var f = 0; f < brkArr.length; f++) {
                                            obj = brkArr[f];
                                            if (!totalQty[obj.brkPN]) {
                                                totalQty[obj.brkPN] = obj;
                                            } else {
                                                totalQty[obj.brkPN].qty += obj.qty;
                                                totalQty[obj.brkPN].devDesignation = totalQty[obj.brkPN].devDesignation + ', ' + obj.devDesignation;
                                            }
                                        }

                                        var totalQtyResults = [];
                                        for (let prop in totalQty)
                                            totalQtyResults.push(totalQty[prop]);

                                        for (let item2 of totalQtyResults) {
                                            if (count < 10)
                                                var seqNum = '00' + count;
                                            else if (count < 100)
                                                var seqNum = '0' + count;
                                            else
                                                var seqNum = count;

                                            var brkPN = item2.brkPN;
                                            var crdPN = item2.cradlePN;
                                            var devDes = item2.devDesignation;
                                            var devDes1 = devDes.substring(0, 24);
                                            var devDes2 = devDes.substring(24, 64);
                                            var devDes3 = devDes.substring(64, 104);
                                            var devDes4 = devDes.substring(104, 144);
                                            var qty = item2.qty;
                                            var unitOfIssue = item2.unitOfIssue;
                                            var catCode = item2.catCode;
                                            var devMfg = item2.devMfg;

                                            sheet.addRow({
                                                assemblyNum: assemblyNum,
                                                seqNum: seqNum.toString(),
                                                compPartNum: brkPN,
                                                desc1: 'BREAKER',
                                                desc2: null,
                                                desc3: null,
                                                desc4: null,
                                                qty: qty,
                                                unitOfIssue: unitOfIssue,
                                                unitOfPurchase: unitOfIssue,
                                                categoryCode: catCode,
                                                makePart: 0,
                                                buyPart: 1,
                                                stockPart: 0,
                                                manufacturer: devMfg,
                                                deviceDes: devDes,
                                            });
                                            if (crdPN != '') {
                                                count++;
                                                if (count < 10)
                                                    var seqNum = '00' + count;
                                                else if (count < 100)
                                                    var seqNum = '0' + count;
                                                else
                                                    var seqNum = count;
                                                sheet.addRow({
                                                    assemblyNum: assemblyNum,
                                                    seqNum: seqNum.toString(),
                                                    compPartNum: crdPN,
                                                    desc1: 'CRADLE',
                                                    desc2: null,
                                                    desc3: null,
                                                    desc4: null,
                                                    qty: qty,
                                                    unitOfIssue: unitOfIssue,
                                                    unitOfPurchase: unitOfIssue,
                                                    categoryCode: catCode,
                                                    makePart: 0,
                                                    buyPart: 1,
                                                    stockPart: 0,
                                                    manufacturer: devMfg,
                                                    deviceDes: devDes
                                                });
                                            }
                                            count++;
                                        }
                                    }
                                }
                                //mbom summary
                                sheet.addRow({
                                    assemblyNum: jobNum + releaseNum + '-MBOM',
                                    seqNum: null,
                                    compPartNum: jobNum + releaseNum + '-MBOM',
                                    desc1: jobNum + releaseNum + '-MBOM Bill of Material',
                                    desc2: null,
                                    desc3: null,
                                    desc4: null,
                                    qty: 1,
                                    unitOfIssue: 'EA',
                                    unitOfPurchase: 'EA',
                                    categoryCode: '82-BOM',
                                    makePart: 1,
                                    buyPart: 0,
                                    stockPart: 0,
                                    manufacturer: 'SAI',
                                    deviceDes: null
                                });
                                for (var i = 0; i < mbomAssemNumArr.length; i++) {
                                    if ((i + 1) < 10)
                                        var seqNum = '00' + (i + 1);
                                    else if ((i + 1) < 100)
                                        var seqNum = '0' + (i + 1);
                                    else
                                        var seqNum = (i + 1);

                                    sheet.addRow({
                                        assemblyNum: jobNum + releaseNum + '-MBOM',
                                        seqNum: seqNum.toString(),
                                        compPartNum: mbomAssemNumArr[i],
                                        desc1: null,
                                        desc2: null,
                                        desc3: null,
                                        desc4: null,
                                        qty: result[0].qtyBoard,
                                        unitOfIssue: null,
                                        unitOfPurchase: null,
                                        categoryCode: null,
                                        makePart: null,
                                        buyPart: null,
                                        stockPart: null,
                                        manufacturer: null,
                                        deviceDes: null
                                    });
                                }

                                workbook.xlsx.writeFile('uploads/' + jobNum + releaseNum + ' MBOM.xlsx').then(function () {
                                    const remoteFilePath = 'uploads/';
                                    const remoteFilename = jobNum + releaseNum + ' MBOM.xlsx';
                                    res.download(remoteFilePath + remoteFilename);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};