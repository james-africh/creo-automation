/*const mysql = require('mysql');*/
const queryString = require('query-string');
const url = require('url');

//Excel Connection
const Excel = require('exceljs');

//DATABASE INFORMATION (TABLE NAMES)
const dbConfig = require('../config/database.js');
const database = dbConfig.database;


//*********************************MECHANICAL ENG. PORTAL*************************************//

exports = {};
module.exports = exports;


const DB = require('../config/db.js');
const querySql = DB.querySql;
const Promise = require('bluebird');

exports.MBOM = function(req, res) {
    let mbomData = [];
    let comItemData = [];
    let userID = req.user.id;
    let userPermission, profilePic, message;

    async function f() {
            const mbomSum = await querySql("SELECT * FROM mbomSum");
            const comItems = await querySql("SELECT * FROM mbomComItem");
            const userProfile = await querySql("SELECT * FROM userProfile WHERE FK_id = ?", userID);
            return {mbomSum, comItems, userProfile}
        }

        f().then(({mbomSum, comItems, userProfile}) => {
            for(let row of mbomSum)
                mbomData.push(row);
            for(let row of comItems)
                comItemData.push(row);
            if(userProfile.length != 0) {
                userPermission = userProfile[0].permissions;
                profilePic = '/public/uploads/' + userProfile[0].profilePic;
            }
            return null
        })
        .then(() => {
            res.locals = {title: 'Mechanical BOMs'};
            res.render('MechEng/MBOM', {
                mbomData: mbomData,
                comItemData: comItemData,
                userPermission: userPermission,
                profilePic: profilePic,
                message: message
            });
        })
        .catch(err => {
            return Promise.reject(err);
        });
};

exports.createMBOM = function(req, res) {
    let data = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation,
        numSections: 0
    };
    let mbomID, message, profilePic, userPermission;

    querySql("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id)
        .then(rows => {
            if (rows.length != 0) {
                profilePic = '/public/uploads/' + rows[0].profilePic;
                userPermission = rows[0].permissions;
            }
            return querySql("SELECT * FROM mbomSum");
        })
        .then(
            async function(rows){
                for(let row of rows){
                    if(row.jobNum == data.jobNum && row.releaseNum == data.releaseNum) {
                        message = 'Job and Release Number already exist';
                        res.locals = {title: 'Create MBOM'};
                        res.render('MechEng/MBOM', {
                            mbomData: rows,
                            userPermission: userPermission,
                            profilePic: profilePic,
                            message: message
                        });
                        throw new Error('Job and Release Number already exist');
                    }
                }

                await querySql("INSERT INTO mbomSum SET ?", data);
                return null;
            }
        )
        .then(
            async function() {
                return await querySql("SELECT * FROM mbomSum WHERE jobNum = ? AND releaseNum = ?", [data.jobNum, data.releaseNum]);
            }
        )
        .then(rows => {
            mbomID = rows[0].mbomID;
            res.locals = {title: 'Create MBOM'};
            res.redirect('searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + mbomID);
            return null;
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};



exports.copyMBOM = function(req, res) {
    //COPIED
    let copyMbomID;
    let copyNumSections;
    let copyMbomData = {
        jobNum: req.body.copyJobNum,
        releaseNum: req.body.copyReleaseNum
    };
    let copySections = [];
    let copyMbomResults = [];


    let copyItemIDArray;
    let copyItems = [];

    let copyBrkIDArray;
    let copyBrks = [];
    let copyBrkAcc = [];

    //NEW
    let newMbomID;
    let newMbomData = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation,
        numSections: null
    };
    let newSections = [];

    let itemMap = new Map();
    let newUserItemID;
    let userItemData = [];
    let newItems = [];
    let newItemsForItemTable = [];

    let brkMap = new Map();
    let newBrks = [];

    let newBrkAcc = [];

    querySql("SELECT * FROM mbomSum WHERE jobNum = ? AND releaseNum = ?", [copyMbomData.jobNum, copyMbomData.releaseNum])
        .then(rows => {
            //gets copied data, creates new mbom, and inserts new mbom into table
            copyMbomID = rows[0].mbomID;
            copyNumSections = rows[0].numSections;
            newMbomData.numSections = copyNumSections;

            return null;
        })
        .then(
            async function() {
                await querySql("INSERT INTO mbomSum SET ?", newMbomData);
                return await querySql("SELECT * FROM mbomSum WHERE jobNum = ? AND releaseNum = ?", [newMbomData.jobNum, newMbomData.releaseNum]);
            }
        )
        .then(rows => {
            for(let row of rows)
                newMbomID = row.mbomID;

            return querySql("SELECT * FROM mbomUserItem WHERE mbomID = ?", copyMbomID);
        })
        .then(rows => {
            for(let row of rows){
                copyItems.push(row);

                userItemData.push({
                    mbomID: newMbomID,
                    itemType: row.itemType,
                    itemMfg: row.itemMfg,
                    itemDesc: row.itemDesc,
                    itemPN: row.itemPN,
                    unitOfIssue: row.unitOfIssue,
                    catCode: row.catCode
                });
            }

            return userItemData;
        })
        .then(
            async function(rows){
                for(let row of rows){
                    await querySql("INSERT INTO mbomUserItem SET ?", row);
                }
            }
        )
        .then(
            async function() {
                const getNewItems = await querySql("SELECT * FROM mbomUserItem WHERE mbomID = ?", newMbomID);
                const getItemSum = await querySql("SELECT * FROM mbomItemSum WHERE mbomID = ?", copyMbomID);

                return {getNewItems, getItemSum}
            }
        )
        .then(({getNewItems, getItemSum}) => {
            for(let row of getNewItems)
                newItems.push(row);
            for (let i = 0; i < getItemSum.length; i++) {
                newUserItemID = null;
                if (getItemSum[i].userItemID != null) {
                    let copyUserItemID = getItemSum[i].userItemID;
                    for (let j = 0; j < copyItems.length; j++) {
                        if (copyItems[j].userItemID == copyUserItemID) {
                            for (let k = 0; k < newItems.length; k++) {
                                if (copyItems[j].itemPN == newItems[k].itemPN) {
                                    newUserItemID = newItems[k].userItemID;
                                }
                            }
                        }
                    }
                }
                newItemsForItemTable[i] = {
                    comItemID: getItemSum[i].comItemID,
                    userItemID: newUserItemID,
                    mbomID: newMbomID,
                    itemQty: getItemSum[i].itemQty,
                    shipLoose: getItemSum[i].shipLoose
                };
            }

            return newItemsForItemTable;
        })
        .then(
            async function(rows) {
                for(let row of rows)
                    await querySql("INSERT INTO mbomItemSum SET ?", row);

                return null;
            }
        )
        .then(
            async function() {
                const getCopyItemSum = await querySql("SELECT * FROM mbomItemSum WHERE mbomID = ? ", copyMbomID);
                const getNewItemSum = await querySql("SELECT * FROM mbomItemSum WHERE mbomID = ? ", newMbomID);
                return {getCopyItemSum, getNewItemSum};
            }
        )
        .then(({getCopyItemSum, getNewItemSum}) => {
            for(let row of getCopyItemSum)
                copyMbomResults.push(row);
            for(let i = 0; i < getNewItemSum.length; i++)
                itemMap.set(copyMbomResults[i].itemSumID, getNewItemSum[i].itemSumID);

            return querySql("SELECT * FROM mbomBrkSum WHERE mbomID = ?", copyMbomID);
        })
        .then(rows => {
            for(let row of rows){
                copyBrks.push(row);

                newBrks.push({
                    mbomID: newMbomID,
                    devLayout: newMbomData.boardDesignation,
                    devDesignation: row.devDesignation,
                    brkPN: row.brkPN,
                    cradlePN: row.cradlePN,
                    unitOfIssue: row.unitOfIssue,
                    catCode: row.catCode,
                    devMfg: row.devMfg
                });
            }

            return newBrks;
        })
        .then(
            async function(rows) {
                for(let row of rows)
                    await querySql("INSERT INTO mbomBrkSum SET ?", row);

                return querySql("SELECT * FROM mbomBrkSum WHERE mbomID = ?", newMbomID)
            }
        )
        .then(rows => {
            for(let i = 0; i < rows.length; i++){
                brkMap.set(copyBrks[i].idDev, rows[i].idDev);
            }
            return null
        })
        .then(
            async function() {
                return await querySql("SELECT * FROM mbomBrkAccSum WHERE mbomID = ? ", copyMbomID);
            }
        )
        .then(rows => {
            for (let row of rows) {
                copyBrkAcc.push(row);
                newBrkAcc.push({
                    mbomID: newMbomID,
                    idDev: brkMap.get(row.idDev),
                    brkAccQty: row.brkAccQty,
                    brkAccType: row.brkAccType,
                    brkAccMfg: row.brkAccMfg,
                    brkAccDesc: row.brkAccDesc,
                    brkAccPN: row.brkAccPN
                })
            }
            return newBrkAcc
        })
        .then(
            async function(rows) {
                for(let row of rows)
                    await querySql("INSERT INTO mbomBrkAccSum SET ?", row);

                return querySql("SELECT * FROM mbomSectionSum WHERE mbomID = ?", copyMbomID);
            }
        )
        .then(rows => {
            //gets copied mbom section data and creates/insert new mbom section data into table
            for(let row of rows){
                copySections.push(row);
            }

            for(let el of copySections){

                let newBrkIDArray = [];
                let newItemIDArray = [];

                if(el.idDev != null){
                    copyBrkIDArray = el.idDev.split(',');

                    for(let temp of copyBrkIDArray){
                        newBrkIDArray.push(brkMap.get(parseInt(temp)));
                    }
                }

                if(el.itemSumID != null){
                    copyItemIDArray = el.itemSumID.split(',');
                    for(let temp of copyItemIDArray){
                        newItemIDArray.push(itemMap.get(parseInt(temp)));
                    }
                }

                let newBrkTemp = '';
                for(let brkEl of newBrkIDArray){
                    if(newBrkTemp == '')
                        newBrkTemp = brkEl;
                    else
                        newBrkTemp += ',' + brkEl;
                }

                let newItemTemp = '';
                for(let itemEl of newItemIDArray){
                    if(newItemTemp == '')
                        newItemTemp = itemEl;
                    else
                        newItemTemp += ',' + itemEl;
                }

                newSections.push({
                    sectionNum: el.sectionNum,
                    mbomID: newMbomID,
                    idDev: newBrkTemp,
                    itemSumID: newItemTemp

                });
            }

            return newSections;
        })
        .then(
            async function(rows) {
                for(let row of rows)
                    await querySql("INSERT INTO mbomSectionSum SET ?", row);

                return null;
            }
        )
        .then(() => {
            res.locals = {title: 'Search MBOM'};
            res.redirect('./searchMBOM/?bomID=' + newMbomData.jobNum + newMbomData.releaseNum + "_" + newMbomID);
            return null;
        })
        .catch(err => {
            return Promise.reject(err);
        });
};


exports.editMBOM = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);

    let data = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };

    querySql("UPDATE mbomSum SET jobName = ?, customer = ?, boardDesignation = ? WHERE mbomID = ?", [data.jobName, data.customer, data.boardDesignation, qs.mbomID])
        .then(() => {
            res.locals = {title: 'Search MBOM'};
            res.redirect('../searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + qs.mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.searchMBOMPost = function(req, res) {
    let mbomID;
    let data = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };

    querySql("SELECT * FROM mbomSum WHERE jobNum = ? AND releaseNum = ?", [data.jobNum, data.releaseNum])
        .then(rows => {
            if(rows.length == 0)
                res.redirect('./MBOM');
            else{
                mbomID = rows[0].mbomID;
                res.locals = {title: 'Search MBOM'};
                res.redirect('searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + mbomID);
            }

            return null;
        })
        .catch(err => {
            return Promise.reject(err);
        });
};

let brkDataObj;
let brkAccArr = [];
let currentMbomID = '';

exports.addBreakerAcc = function(req, res) {
    let mbomID = req.body.mbomID;

    let mbomData = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum
    };

    brkDataObj = {
        devDesignation: req.body.devDesignation,
        brkPN: req.body.brkPN,
        cradlePN: req.body.cradlePN,
        devMfg: req.body.devMfg,
        catCode: req.body.catCode
    };

    if (currentMbomID == '') {
        currentMbomID = mbomID;
    }

    if (currentMbomID == mbomID){
        if (req.body.qty != '') {
            let formData = {
                mbomID: mbomID,
                qty: req.body.accQty,
                type: req.body.accType,
                mfg: req.body.accMfg,
                desc: req.body.accDesc,
                pn: req.body.accPN
            };

            brkAccArr.push(formData);
        }
    } else {
        currentMbomID = mbomID;
        brkAccArr = [];

        if (req.body.qty != '') {
            let formData = {
                mbomID: mbomID,
                qty: req.body.accQty,
                type: req.body.accType,
                mfg: req.body.accMfg,
                desc: req.body.accDesc,
                pn: req.body.accPN
            };

            brkAccArr.push(formData);
        }
    }
    res.redirect('searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomID);
};

let editBrkDataObj;

exports.addBrkAccFromEdit = function(req, res) {
    let mbomID = req.body.mbomID;

    let breakerData = [];
    let accData = [];

    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.devLayout
    };


    editBrkDataObj = {
        devDesignation: req.body.editDevDesLimit,
        brkPN: req.body.editBrkPN,
        cradlePN: req.body.editCradlePN,
        devMfg: req.body.editDevMfg,
        catCode: req.body.editDevCatCode
    };

    let profilePic;

    let idDev = req.body.idDev;

    let formData = {
        mbomID: mbomID,
        idDev: idDev,
        brkAccQty: req.body.accQty,
        brkAccType: req.body.accType,
        brkAccDesc: req.body.accDesc,
        brkAccMfg: req.body.editDevMfg,
        brkAccPN: req.body.accPN
    };

    querySql("INSERT INTO " + database + "." + dbConfig.MBOM_brkAcc_table + " SET ?", formData)
        .then(() => {
            return querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE idDev = ?", idDev)
        })
        .then(rows => {
            for(let row of rows){
                breakerData.push(row);
            }
            return querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_brkAcc_table + " WHERE idDev = ?", idDev)
        })
        .then(rows => {
            for(let row of rows){
                accData.push(row);
            }
            return querySql("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            if(rows.length != 0){
                profilePic = '/public/uploads/' + rows[0].profilePic;
            }

            return null
        })
        .then(() => {
            res.locals = {title: 'Edit Breaker'};
            res.render('MechEng/editBreaker', {
                mbomBrkData: breakerData,
                brkAccData: accData,
                mbomData: mbomData,
                brkData: editBrkDataObj,
                profilePic: profilePic
            });
        })
        .catch(err => {
            return Promise.reject(err);
        });
};

exports.editBreakerAcc = function(req, res){
    let jobNum = req.body.jobNum;
    let releaseNum = req.body.releaseNum;
    let mbomID = req.body.mbomID;

    let brkAccID = req.body.brkAccID;

    let updateAcc = {
        qty: req.body.editAccQty,
        type: req.body.editAccType,
        desc: req.body.editAccDescLimit,
        pn: req.body.editAccPN
    };

    function arrayEdit(arr, value, id) {
        for (let i = 0; i < arr.length; i++) {
            if(i == id) {
                arr[i].qty = value.qty;
                arr[i].type = value.type;
                arr[i].desc = value.desc;
                arr[i].pn = value.pn;
            }
        }
        return arr
    }

    brkAccArr = arrayEdit(brkAccArr, updateAcc, brkAccID);
    res.redirect('../searchMBOM/?bomID=' + jobNum + releaseNum + '_' + mbomID);
};

exports.editBrkAccFromEdit = function(req, res) {
    let mbomID = req.body.mbomID;

    let breakerData = [];
    let accData = [];

    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.devLayout
    };


    editBrkDataObj = {
        devDesignation: req.body.editDevDesLimit,
        brkPN: req.body.editBrkPN,
        cradlePN: req.body.editCradlePN,
        devMfg: req.body.editDevMfg,
        catCode: req.body.editDevCatCode
    };

    let profilePic;

    let idDev = req.body.idDev;
    let brkAccID = req.body.brkAccID;

    let updateAcc = {
        qty: req.body.editAccQty,
        type: req.body.editAccType,
        desc: req.body.editAccDescLimit,
        pn: req.body.editAccPN
    };

    querySql("UPDATE " + database + "." + dbConfig.MBOM_brkAcc_table + " SET brkAccQty = ?, brkAccType = ?, brkAccDesc = ?, brkAccPN = ? WHERE brkAccID = ? ", [updateAcc.qty, updateAcc.type, updateAcc.desc, updateAcc.pn, brkAccID])
        .then(() => {
            return querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE idDev = ?", idDev)
        })
        .then(rows => {
            for(let row of rows){
                breakerData.push(row);
            }
            return querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_brkAcc_table + " WHERE idDev = ?", idDev)
        })
        .then(rows => {
            for(let row of rows){
                accData.push(row);
            }
            return querySql("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            if(rows.length != 0){
                profilePic = '/public/uploads/' + rows[0].profilePic;
            }

            return null
        })
        .then(() => {
            res.locals = {title: 'Edit Breaker'};
            res.render('MechEng/editBreaker', {
                mbomBrkData: breakerData,
                brkAccData: accData,
                mbomData: mbomData,
                brkData: editBrkDataObj,
                profilePic: profilePic
            });
        })
        .catch(err => {
            return Promise.reject(err);
        });
};

exports.deleteBreakerAcc = function(req, res){
    let mbomID = req.body.mbomID;
    let mbomData = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum
    };
    brkDataObj = {
        devDesignation: req.body.devDesignation,
        brkPN: req.body.brkPN,
        cradlePN: req.body.cradlePN,
        devMfg: req.body.devMfg,
        catCode: req.body.catCode
    };
    let pn = req.body.pn;

    function arrayRemove(arr, value) {
        return arr.filter(function(el){
            return el.pn != value;
        });
    }

    brkAccArr = arrayRemove(brkAccArr, pn);

    res.redirect('searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomID);
};

exports.deleteBrkAccFromEdit = function(req, res) {
    let idDev = req.body.idDev;
    let pn = req.body.pn;

    let breakerData = [];
    let accData = [];
    editBrkDataObj = {
        devDesignation: req.body.devDesignation,
        brkPN: req.body.brkPN,
        cradlePN: req.body.cradlePN,
        devMfg: req.body.devMfg,
        catCode: req.body.catCode
    };
    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.devLayout
    };
    let profilePic;

    querySql("DELETE FROM "+ database + "." + dbConfig.MBOM_brkAcc_table + " WHERE idDev = ? AND brkAccPN = ?", [idDev, pn])
        .then(() => {
            return querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE idDev = ?", idDev)
        })
        .then(rows => {
            for(let row of rows){
                breakerData.push(row);
            }
            return querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_brkAcc_table + " WHERE idDev = ?", idDev)
        })
        .then(rows => {
            for(let row of rows){
                accData.push(row);
            }
            return querySql("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            if(rows.length != 0){
                profilePic = '/public/uploads/' + rows[0].profilePic;
            }

            return null
        })
        .then(() => {
            res.locals = {title: 'Edit Breaker'};
            res.render('MechEng/editBreaker', {
                mbomBrkData: breakerData,
                brkAccData: accData,
                mbomData: mbomData,
                brkData: editBrkDataObj,
                profilePic: profilePic
            });
        })
        .catch(err => {
            return Promise.reject(err);
        });
}

exports.searchMBOMGet = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let mbomID = qs.bomID.split('_')[1];
    let mbomData = {};
    let mbomBrkData = [];
    let mbomItemData = [];
    let comItemsData = [];
    let userItemsData = [];
    let mbomSecData = [];
    let catCodeData = [];
    let itemTypes = [];
    let currentItem;
    let mfgMap = new Map();
    let descMap = new Map();
    let pnMap = new Map();
    let itemMfgSet = new Set();
    let profilePic;
    let brkAccData = [];
    let brkData ={};
    let mbomBrkAcc = [];

    if(brkAccArr.length != 0){
        if(brkAccArr[0].mbomID == mbomID)
            brkAccData = brkAccArr;
    }
    if(brkDataObj)
        brkData = brkDataObj;

    querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_common_items)
        .then(rows => {
            for(let row of rows){
                if(row.itemType != currentItem)
                    itemTypes.push(row.itemType);
                comItemsData.push(row);
                currentItem = row.itemType;
                itemMfgSet.add(row.itemMfg);
            }
            for (let j = 0; j < itemTypes.length; j++) {
                querySql("SELECT itemType, itemMfg, itemDesc, itemPN FROM " + database + " . " + dbConfig.MBOM_common_items + " WHERE itemType = ?", itemTypes[j])
                    .then(results => {
                        //mfgMap creation
                        for (let x = 0; x < results.length; x++) {
                            if (mfgMap.has(results[x].itemType)) {
                                let temp = mfgMap.get(results[x].itemType);
                                if (!temp.includes(results[x].itemMfg)) {
                                    temp += "|" + results[x].itemMfg;
                                }
                                mfgMap.set(results[x].itemType, temp);
                            } else {
                                mfgMap.set(results[x].itemType, results[x].itemMfg);
                            }
                        }
                        //descMap creation
                        for (let y = 0; y < results.length; y++) {
                            if (descMap.has(results[y].itemType + '|' + results[y].itemMfg)) {
                                let temp = descMap.get(results[y].itemType + '|' + results[y].itemMfg);
                                if (!temp.includes(results[y].itemDesc)) {
                                    temp += "|" + results[y].itemDesc;
                                }
                                descMap.set(results[y].itemType + '|' + results[y].itemMfg, temp);
                            } else {
                                descMap.set(results[y].itemType + '|' + results[y].itemMfg, results[y].itemDesc);
                            }
                        }
                        //pnMap creation
                        for (let z = 0; z < results.length; z++) {
                            if (pnMap.has(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc)) {
                                let temp = pnMap.get(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc);
                                if (!temp.includes(results[z].itemPN)) {
                                    temp += "|" + results[z].itemPN;
                                }
                                pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, temp);
                            } else {
                                pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, results[z].itemPN);

                            }
                        }

                        return null;
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }
            return null;
        })
        .then(
            async function(){
                const mbomSum = await querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE mbomID = ?", mbomID);
                const userItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_user_items);
                const brkSum = await querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_breaker_table + " WHERE mbomID = ?", mbomID);
                //const brkAccSum = await querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_brkAcc_table+ " WHERE mbomID = ?", mbomID);
                const itemSum = await querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_item_table + " WHERE mbomID = ?", mbomID);
                const secSum = await querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_section_sum + " WHERE mbomID = ?", mbomID);
                const catCodeSum = await querySql("SELECT * FROM " + database + "." + dbConfig.jobscope_codes_table);
                const userProfile = await querySql("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id);
                const brkAccessories = await querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_brkAcc_table + " WHERE mbomID = ?", mbomID);

                return {mbomSum, userItems, brkSum, itemSum, secSum, catCodeSum, userProfile, brkAccessories}
            }
        )
        .then(({mbomSum, userItems, brkSum, itemSum, secSum, catCodeSum, userProfile, brkAccessories}) => {
            mbomData = mbomSum[0];

            for(let row of userItems)
                userItemsData.push(row);
            for(let row of brkSum)
                mbomBrkData.push(row);
            /*for(let row of brkAccSum)
                brkAccData.push(row);*/
            for(let row of itemSum)
                mbomItemData.push(row);
            for(let row of secSum)
                mbomSecData.push({
                    sectionNum: row.sectionNum,
                    mbomID: row.mbomID,
                    idDev: row.idDev,
                    itemSumID: row.itemSumID
                });
            for(let row of catCodeSum)
                catCodeData.push(row.catCode);
            if(userProfile.length != 0)
                profilePic = '/public/uploads/' + userProfile[0].profilePic;
            for(let row of brkAccessories)
                mbomBrkAcc.push(row);
            return null;
        })
        .then(() => {
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
                profilePic: profilePic,
                brkAccData: brkAccData,
                brkData: brkData,
                mbomBrkAcc: mbomBrkAcc
            });

            return null;
        })
        .catch(err => {
            return Promise.reject(err);
        });
};

exports.createComItemGET = function(req, res) {
    let catCodeData = [];
    let itemTypes = [];
    let currentItem;
    let mfgMap = new Map();
    let itemMfgSet = new Set();
    let profilePic;

    querySql("SELECT * FROM mbomComItem")
        .then(rows => {
            for(let row of rows){
                if(row.itemType != currentItem){
                    itemTypes.push(row.itemType);
                }
                currentItem = row.itemType;
                itemMfgSet.add(row.itemMfg);
            }
            for (let j = 0; j < itemTypes.length; j++) {
                querySql("SELECT itemType, itemMfg, itemDesc, itemPN FROM mbomComItem WHERE itemType = ?", itemTypes[j])
                    .then(results => {
                        //mfgMap creation
                        for (let x = 0; x < results.length; x++) {
                            if (mfgMap.has(results[x].itemType)) {
                                let temp = mfgMap.get(results[x].itemType);
                                if (!temp.includes(results[x].itemMfg)) {
                                    temp += "|" + results[x].itemMfg;
                                }
                                mfgMap.set(results[x].itemType, temp);
                            } else {
                                mfgMap.set(results[x].itemType, results[x].itemMfg);
                            }
                        }
                    })
                    .catch(err => {
                        console.log('there was an error:' + err);
                    });
            }
            return null;
        })
        .then(() => {
            return querySql("SELECT * FROM jobscopeCatCodes")
        })
        .then(rows => {
            for(let row of rows){
                catCodeData.push(row.catCode);
            }

            return querySql("SELECT * FROM userProfile WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            profilePic = '/public/uploads/' + rows[0].profilePic;
            return null;
        })
        .then(() => {
            res.locals = {title: 'Edit Item'};
            res.render('MechEng/createComItem', {
                itemTypes: itemTypes,
                itemMfgSet: itemMfgSet,
                mfgMap: mfgMap,
                catCodeData: catCodeData,
                profilePic: profilePic
            });
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.createComItemPOST = function(req, res) {
    let exists;
    let comItemID;

    let itemType = req.body.itemSelect2;
    if (itemType == 'OTHER')
        itemType = (req.body.otherItemType).toUpperCase();

    let itemMfg;
    let otherMfgDropdown = req.body.mfgList;
    let mfgSelect = req.body.mfgSelect2;

    if (mfgSelect == 'OTHER' || otherMfgDropdown == 'OTHER')
        itemMfg = req.body.otherMfgType.toUpperCase();
    else if (mfgSelect)
        itemMfg = mfgSelect.split('|')[1];
    else
        itemMfg = otherMfgDropdown;

    let data = {
        itemType: itemType,
        itemMfg: itemMfg,
        itemDesc: (req.body.itemDesc).toUpperCase(),
        itemPN: (req.body.itemPN).toUpperCase(),
        unitOfIssue: req.body.unitOfIssue,
        catCode: req.body.catCode
    };

    querySql("SELECT * FROM mbomComItem WHERE itemType = ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?", [data.itemType, data.itemMfg, data.itemDesc, data.itemPN])
        .then(rows => {
            if(rows.length != 0){
                comItemID = rows[0].comItemID;
                exists = true;
            } else
                exists = false;

            if(!exists){
                querySql("INSERT INTO mbomComItem SET ?", data)
            }

            return null;
        })
        .then(() => {
            return querySql("SELECT * FROM mbomComItem WHERE itemType = ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?", [data.itemType, data.itemMfg, data.itemDesc, data.itemPN])
        })
        .then(rows => {
            comItemID = rows[0].comItemID;

            return null;
        })
        .then(() => {
            res.locals = {title: 'Create Item'};
            res.redirect('./MBOM');
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.createUserItem = function(req, res) {
    let exists;
    let mbomID;
    let userItemID;
    let itemSumID;
    let shipLooseCheck;
    let mbomData = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
    };

    let itemType = req.body.itemSelect2;
    if (itemType == 'OTHER')
        itemType = (req.body.otherItemType).toUpperCase();

    let itemMfg;
    let otherMfgDropdown = req.body.mfgList;
    let mfgSelect = req.body.mfgSelect2;

    if (mfgSelect == 'OTHER' || otherMfgDropdown == 'OTHER')
        itemMfg = req.body.otherMfgType.toUpperCase();
    else if (mfgSelect)
        itemMfg = mfgSelect.split('|')[1];
    else
        itemMfg = otherMfgDropdown;

    let data = {
        mbomID: null,
        itemType: itemType,
        itemMfg: itemMfg,
        itemDesc: (req.body.itemDesc).toUpperCase(),
        itemPN: (req.body.itemPN).toUpperCase(),
        catCode: req.body.catCode,
        unitOfIssue: req.body.unitOfIssue
    };

    if (req.body.userShipLoose)
        shipLooseCheck = 'Y';
    else
        shipLooseCheck = 'N';

    querySql("SELECT mbomID FROM mbomSum WHERE jobNum = ? AND releaseNum = ?", [mbomData.jobNum, mbomData.releaseNum])
        .then(rows => {
            mbomID = rows[0].mbomID;
            data.mbomID = mbomID;

            return querySql("SELECT * FROM mbomUserItem WHERE itemType = ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?", [data.itemType, data.itemMfg, data.itemDesc, data.itemPN])
        })
        .then(rows => {
            if(rows.length != 0 && rows[0].mbomID == data.mbomID){
                userItemID = rows[0].userItemID;
                exists = true;
            } else
                exists = false;

            if (!exists) {
                querySql("INSERT INTO mbomUserItem SET ?", data)
                    .then(() => {
                        return querySql("SELECT * FROM mbomUserItem WHERE itemType = ? AND itemMfg = ? " +
                            "AND itemDesc = ? AND itemPN = ? AND mbomID = ?", [data.itemType, data.itemMfg, data.itemDesc, data.itemPN, data.mbomID])
                    })
                    .then(rows => {
                        userItemID = rows[0].userItemID;

                        let itemSumData = {
                            itemSumID: itemSumID,
                            comItemID: null,
                            userItemID: userItemID,
                            mbomID: mbomID,
                            itemQty: req.body.itemQty,
                            shipLoose: shipLooseCheck
                        };

                        querySql("INSERT INTO mbomItemSum SET ?", itemSumData);

                        return null;
                    })
                    .catch(err => {
                        console.log('there was an error:' + err);
                    });
            } else {
                let itemSumData = {
                    itemSumID: itemSumID,
                    comItemID: null,
                    userItemID: userItemID,
                    mbomID: mbomID,
                    itemQty: req.body.itemQty,
                };

                querySql("INSERT INTO mbomItemSum SET ?", itemSumData);

                return null;
            }
            return null;
        })
        .then(() => {
            res.locals = {title: 'Create Item'};
            res.redirect('searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });

};

exports.addItem = function(req, res) {
    let mbomID;
    let comItemID;
    let itemSumID;
    let itemMfg = req.body.itemMfg.split('|')[1];
    let itemDesc = req.body.itemDesc.split('|')[2];
    let itemPN = req.body.itemPN.split('|')[3];
    let shipLooseCheck;
    let mbomData = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
    };

    let data = {
        itemType: req.body.itemType,
        itemMfg: itemMfg,
        itemDesc: itemDesc,
        itemPN: itemPN,
    };

    if (req.body.shipLoose)
        shipLooseCheck = 'Y';
    else
        shipLooseCheck = 'N';

    querySql("SELECT mbomID FROM mbomSum WHERE jobNum = ? AND releaseNum = ?", [mbomData.jobNum, mbomData.releaseNum])
        .then(rows => {
            mbomID = rows[0].mbomID;

            return querySql("SELECT * FROM mbomComItem WHERE itemType = ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?", [data.itemType, data.itemMfg, data.itemDesc, data.itemPN])
        })
        .then(rows => {
            comItemID = rows[0].comItemID;

            let itemSumData = {
                comItemID: comItemID,
                itemSumID: itemSumID,
                mbomID: mbomID,
                itemQty: req.body.itemQty,
                shipLoose: shipLooseCheck
            };

            querySql("INSERT INTO mbomItemSum SET ?", itemSumData);

            return null;
        })
        .then(() => {
            res.locals = {title: 'Add Item'};
            res.redirect('searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.copyItem = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let itemData = [];
    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum
    };

    querySql("SELECT * FROM mbomItemSum WHERE itemSumID = ?", qs.itemSumID)
        .then(rows => {

            itemData = {
                comItemID: rows[0].comItemID,
                userItemID: rows[0].userItemID,
                mbomID: rows[0].mbomID,
                itemQty: rows[0].itemQty,
                shipLoose: rows[0].shipLoose
            };

            querySql("INSERT INTO mbomItemSum SET ?", itemData);
            return null
        })
        .then(() => {
            res.locals = {title: 'Copy Item'};
            res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.editComItemGET = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let profilePic;

    let comItemsData = [];
    let catCodeData = [];
    let itemTypes = [];
    let currentItem;
    let mfgMap = new Map();
    let itemMfgSet = new Set();

    querySql("SELECT * FROM mbomComItem")
        .then(rows => {
            for(row of rows){
                if(row.itemType != currentItem){
                    itemTypes.push(row.itemType);
                }
                currentItem = row[i].itemType;
                itemMfgSet.add(row[i].itemMfg);
            }

            for (let j = 0; j < itemTypes.length; j++) {
                querySql("SELECT itemType, itemMfg, itemDesc, itemPN FROM mbomComItem WHERE itemType = ?", itemTypes[j])
                    .then(results => {
                        //mfgMap creation
                        for (let x = 0; x < results.length; x++) {
                            if (mfgMap.has(results[x].itemType)) {
                                let temp = mfgMap.get(results[x].itemType);
                                if (!temp.includes(results[x].itemMfg)) {
                                    temp += "|" + results[x].itemMfg;
                                }
                                mfgMap.set(results[x].itemType, temp);
                            } else {
                                mfgMap.set(results[x].itemType, results[x].itemMfg);
                            }
                        }
                    })
                    .catch(err => {
                        console.log('there was an error:' + err);
                    });
            }

            return null;
        })
        .then(() => {
            return querySql("SELECT * FROM mbomComItem WHERE comItemID = ?", qs.comItemID)
        })
        .then(rows => {
            comItemsData = rows[0];

            return querySql("SELECT * FROM jobscopeCatCodes")
        })
        .then(rows => {
            for(row of rows){
                catCodeData.push(row.catCode);
            }

            return querySql("SELECT * FROM userProfile WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            if(rows.length != 0)
                profilePic = '/public/uploads/' + rows[0].profilePic;

            return null;
        })
        .then(() => {
            res.locals = {title: 'Edit Item'};
            res.render('MechEng/editComItem', {
                comItemsData: comItemsData,
                itemTypes: itemTypes,
                itemMfgSet: itemMfgSet,
                mfgMap: mfgMap,
                catCodeData: catCodeData,
                profilePic: profilePic
            });
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.editComItemPOST = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let profilePic;

    let comItemsData = [];
    let itemTypes = [];
    let currentItem;
    let mfgMap = new Map();
    let descMap = new Map();
    let pnMap = new Map();

    let data = [];
    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };

    querySql("SELECT * FROM mbomComItem")
        .then(rows => {
            for(let row of rows){
                if(row.itemType != currentItem){
                    itemTypes.push(row.itemType);
                }
                comItemsData.push(row);
                currentItem = row.itemType;
            }
            //Map Creations
            for (let j = 0; j < itemTypes.length; j++) {
                querySql("SELECT itemType, itemMfg, itemDesc, itemPN FROM mbomComItem WHERE itemType = ?", itemTypes[j])
                    .then(results => {
                        //mfgMap creation
                        for (let x = 0; x < results.length; x++) {
                            if (mfgMap.has(results[x].itemType)) {
                                let temp = mfgMap.get(results[x].itemType);
                                if (!temp.includes(results[x].itemMfg)) {
                                    temp += "|" + results[x].itemMfg;
                                }
                                mfgMap.set(results[x].itemType, temp);
                            } else {
                                mfgMap.set(results[x].itemType, results[x].itemMfg);
                            }
                        }
                        //descMap creation
                        for (let y = 0; y < results.length; y++) {
                            if (descMap.has(results[y].itemType + '|' + results[y].itemMfg)) {
                                let temp = descMap.get(results[y].itemType + '|' + results[y].itemMfg);
                                if (!temp.includes(results[y].itemDesc)) {
                                    temp += "|" + results[y].itemDesc;
                                }
                                descMap.set(results[y].itemType + '|' + results[y].itemMfg, temp);
                            } else {
                                descMap.set(results[y].itemType + '|' + results[y].itemMfg, results[y].itemDesc);
                            }
                        }
                        //pnMap creation
                        for (let z = 0; z < results.length; z++) {
                            if (pnMap.has(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc)) {
                                let temp = pnMap.get(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc);
                                if (!temp.includes(results[z].itemPN)) {
                                    temp += "|" + results[z].itemPN;
                                }
                                pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, temp);
                            } else {
                                pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, results[z].itemPN);

                            }
                        }
                    })
                    .catch(err => {
                        console.log('there was an error:' + err);
                    });
            }

            return null;
        })
        .then(() => {
            return querySql("SELECT * FROM mbomItemSum WHERE itemSumID = ?", qs.itemSumID)
        })
        .then(rows => {
            for(let row of rows){
                data.push(row);
            }

            return querySql("SELECT * FROM userProfile WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            if(rows.length != 0)
                profilePic = '/public/uploads/' + rows[0].profilePic;

            return null;
        })
        .then(() => {
            res.locals = {title: 'Edit Item'};
            res.render('MechEng/MBOMeditComItem', {
                mbomItemData: data,
                mbomData: mbomData,
                comItemsData: comItemsData,
                itemTypes: itemTypes,
                mfgMap: mfgMap,
                descMap: descMap,
                pnMap: pnMap,
                profilePic: profilePic
            });
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.saveComItemChanges = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let itemType = req.body.itemSelect2;
    if (itemType == 'OTHER')
        itemType = (req.body.otherItemType).toUpperCase();
    let itemMfg;
    let otherMfgDropdown = req.body.mfgList;
    let mfgSelect = req.body.mfgSelect2;
    if (mfgSelect == 'OTHER' || otherMfgDropdown == 'OTHER')
        itemMfg = req.body.otherMfgType.toUpperCase();
    else if (mfgSelect)
        itemMfg = mfgSelect.split('|')[1];
    else
        itemMfg = otherMfgDropdown;

    let updateData = {
        itemType: itemType,
        itemMfg: itemMfg,
        itemDesc: (req.body.itemDesc).toUpperCase(),
        itemPN: (req.body.itemPN).toUpperCase(),
        unitOfIssue: req.body.unitOfIssue,
        catCode: req.body.catCode
    };

    querySql("UPDATE mbomComItem SET itemType = ?, itemMfg = ?, itemDesc = ?, itemPN = ?, unitOfIssue = ?, " +
        "catCode = ? WHERE comItemID = ?", [updateData.itemType, updateData.itemMfg, updateData.itemDesc,
        updateData.itemPN, updateData.unitOfIssue, updateData.catCode, qs.comItemID])
        .then(() => {
            res.locals = {title: 'Edit Common Item'};
            res.redirect('../MBOM');
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.MBOMsaveComItemChanges = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let itemSumID = qs.itemSumID;

    let shipLooseCheck;
    if(req.body.editShipLoose)
        shipLooseCheck = 'Y';
    else
        shipLooseCheck = 'N';
    let updateData = {
        itemQty: req.body.itemQty,
        itemType: req.body.itemType,
        itemMfg: req.body.itemMfg.split('|')[1],
        itemDesc: req.body.itemDesc.split('|')[2],
        itemPN: req.body.itemPN.split('|')[3],
        shipLoose: shipLooseCheck
    };
    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum
    };
    let comItemID;

    querySql("SELECT comItemID FROM mbomComItem WHERE itemType= ? AND itemMfg = ? AND itemDesc = ? AND itemPN = ?",
        [updateData.itemType, updateData.itemMfg, updateData.itemDesc, updateData.itemPN])
            .then(rows => {
                comItemID = rows[0].comItemID;

                querySql("UPDATE mbomItemSum SET comItemID = ?, itemQty = ?, shipLoose = ? WHERE itemSumID = ?",
                    [comItemID, updateData.itemQty, updateData.shipLoose, itemSumID]);

                return null
            })
            .then(() => {
                res.locals = {title: 'Edit Common Item'};
                res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
            })
            .catch(err => {
                console.log('there was an error:' + err);
            });
};

exports.editUserItem = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let  profilePic;

    let comItemsData = [];
    let userItemData = [];
    let catCodeData = [];
    let itemTypes = [];
    let currentItem;
    let mfgMap = new Map();
    let descMap = new Map();
    let pnMap = new Map();
    let itemMfgSet = new Set();

    let data = [];
    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };

    querySql("SELECT * FROM mbomComItem")
        .then(rows => {
            for(let row of rows){
                if(row.itemType != currentItem){
                    itemTypes.push(row.itemType);
                }
                comItemsData.push(row);
                currentItem = row.itemType;
                itemMfgSet.add(row.itemMfg);
            }

            for (let j = 0; j < itemTypes.length; j++) {
                querySql("SELECT * FROM mbomComItem WHERE itemType = ?", itemTypes[j])
                    .then(results => {
                        //mfgMap creation
                        for (let x = 0; x < results.length; x++) {
                            if (mfgMap.has(results[x].itemType)) {
                                let temp = mfgMap.get(results[x].itemType);
                                if (!temp.includes(results[x].itemMfg)) {
                                    temp += "|" + results[x].itemMfg;
                                }
                                mfgMap.set(results[x].itemType, temp);
                            } else {
                                mfgMap.set(results[x].itemType, results[x].itemMfg);
                            }
                        }
                        //descMap creation
                        for (let y = 0; y < results.length; y++) {
                            if (descMap.has(results[y].itemType + '|' + results[y].itemMfg)) {
                                let temp = descMap.get(results[y].itemType + '|' + results[y].itemMfg);
                                if (!temp.includes(results[y].itemDesc)) {
                                    temp += "|" + results[y].itemDesc;
                                }
                                descMap.set(results[y].itemType + '|' + results[y].itemMfg, temp);
                            } else {
                                descMap.set(results[y].itemType + '|' + results[y].itemMfg, results[y].itemDesc);
                            }
                        }
                        //pnMap creation
                        for (let z = 0; z < results.length; z++) {
                            if (pnMap.has(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc)) {
                                let temp = pnMap.get(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc);
                                if (!temp.includes(results[z].itemPN)) {
                                    temp += "|" + results[z].itemPN;
                                }
                                pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, temp);
                            } else {
                                pnMap.set(results[z].itemType + '|' + results[z].itemMfg + '|' + results[z].itemDesc, results[z].itemPN);

                            }
                        }
                    })
                    .catch(err => {
                        console.log('there was an error:' + err);
                    });
            }

            return null;
        })
        .then(() => {
            return querySql("SELECT * FROM mbomItemSum WHERE itemSumID = ?", qs.itemSumID)
        })
        .then(rows => {
            for (let i = 0; i < rows.length; i++) {
                data[i] = rows[i];
                if (data[i].userItemID != null) {
                    querySql("SELECT * FROM mbomUserItem WHERE userItemID = ?", data[i].userItemID)
                        .then(results => {
                            userItemData = results[0];
                        })
                        .catch(err => {
                            console.log('there was an error:' + err);
                        });
                }
            }

            return null;
        })
        .then(() => {
            return querySql("SELECT * FROM jobscopeCatCodes")
        })
        .then(rows => {
            for(let row of rows)
                catCodeData.push(row.catCode);

            return querySql("SELECT * FROM userProfile WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            if (rows.length != 0)
                profilePic = '/public/uploads/' + rows[0].profilePic;

            return null;
        })
        .then(() => {
            res.locals = {title: 'Edit User Item'};
            res.render('MechEng/editUserItem', {
                mbomItemData: data,
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
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};


exports.saveUserItemChanges = function(req, res) {
    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum
    };
    let itemSumID = req.body.itemSumID;
    let userItemID;

    //Get new data start
    let shipLooseCheck;
    if(req.body.editUserShipLoose)
        shipLooseCheck = 'Y';
    else
        shipLooseCheck = 'N';
    let itemType = req.body.itemSelect2;
    if (itemType == 'OTHER')
        itemType = (req.body.otherItemType).toUpperCase();
    let itemMfg;
    let otherMfgDropdown = req.body.mfgList;
    let mfgSelect = req.body.mfgSelect2;
    if (mfgSelect == 'OTHER' || otherMfgDropdown == 'OTHER')
        itemMfg = req.body.otherMfgType.toUpperCase();
    else if (mfgSelect)
        itemMfg = mfgSelect.split('|')[1];
    else
        itemMfg = otherMfgDropdown;
    let updateData = {
        mbomID: req.body.mbomID,
        itemQty: req.body.itemQty,
        itemType: itemType,
        itemMfg: itemMfg,
        itemDesc: (req.body.itemDesc).toUpperCase(),
        unitOfIssue: req.body.unitOfIssue,
        catCode: req.body.catCode,
        itemPN: (req.body.itemPN).toUpperCase(),
        shipLoose: shipLooseCheck
    };
    //Get new data end

    querySql("SELECT * FROM mbomUserItem WHERE itemPN = ? AND mbomID = ?", [updateData.itemPN, updateData.mbomID])
        .then(rows => {
           if(rows.length > 0){
               userItemID = rows[0].userItemID;

               querySql("UPDATE mbomUserItem SET itemType = ?, itemMfg = ?, itemDesc = ?, unitOfIssue = ?, " +
                   "catCode = ? WHERE itemPN = ? AND mbomID = ?", [updateData.itemType, updateData.itemMfg,
                   updateData.itemDesc, updateData.unitOfIssue, updateData.catCode, updateData.itemPN, updateData.mbomID])
                   .then(() => {
                       querySql("UPDATE mbomItemSum SET itemQty = ?, shipLoose = ? WHERE itemSumID = ?", [updateData.itemQty, updateData.shipLoose, itemSumID]);

                       return null
                   })
                   .then(() => {
                       querySql("UPDATE mbomItemSum SET userItemID = ? WHERE itemSumID = ? AND mbomID = ? ", [userItemID, itemSumID, updateData.mbomID]);

                       return null
                   })
                   .catch(err => {
                       console.log('there was an error:' + err);
                   });
           } else {
               querySql("INSERT INTO mbomUserItem SET itemType = ?, itemMfg = ?, itemDesc = ?, unitOfIssue = ?," +
                   " catCode = ?, itemPN = ?, mbomID = ?", [updateData.itemType, updateData.itemMfg, updateData.itemDesc,
                   updateData.unitOfIssue, updateData.catCode, updateData.itemPN, updateData.mbomID])
                   .then(() => {
                       return querySql("SELECT * FROM mbomUserItem WHERE itemPN = ? AND mbomID = ?", [updateData.itemPN, updateData.mbomID])
                   })
                   .then(rows => {
                       userItemID = rows[0].userItemID;

                       querySql("UPDATE mbomItemSum SET userItemID = ?, itemQty = ?, shipLoose = ? WHERE itemSumID = ?", [userItemID, updateData.itemQty, updateData.shipLoose, itemSumID]);

                       return null
                   })
                   .catch(err => {
                       console.log('there was an error:' + err);
                   });
           }

           return null
        })
        .then(() => {
            res.locals = {title: 'Edit User Item'};
            res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.deleteItem = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);

    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
    };
    let userItemID;
    let updateData;

    querySql("SELECT userItemID FROM mbomItemSum WHERE itemSumID = ?", qs.itemSumID)
        .then(rows => {
            userItemID = rows[0].userItemID;

            querySql("SELECT * FROM mbomItemSum WHERE userItemID = ? AND mbomID = ?", [userItemID, mbomData.mbomID])
                .then(rows => {
                    if(rows.length == 1){
                        querySql("DELETE FROM mbomUserItem WHERE userItemID = ?", userItemID)
                    }
                    return null;
                })
                .catch(err => {
                    console.log('there was an error:' + err);
                });

            return null;
        })
        .then(() => {
            querySql("DELETE FROM mbomItemSum WHERE itemSumID = ?", qs.itemSumID);

            return null;
        })
        .then(() => {
            return querySql("SELECT * FROM mbomSectionSum WHERE mbomID = ?", mbomData.mbomID)
        })
        .then(rows => {
            if(rows.length != 0){
                let newItems = '';
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].itemSumID != null) {
                        let itemSumIDList = rows[i].itemSumID.split(',');
                        if (itemSumIDList.includes(qs.itemSumID.toString())) {
                            let newItemSumIDList = [];
                            for (let j = 0; j < itemSumIDList.length; j++) {
                                if (itemSumIDList[j] == qs.itemSumID.toString()) {

                                } else {
                                    newItemSumIDList.push(itemSumIDList[j])
                                }
                            }
                            for (let k = 0; k < newItemSumIDList.length; k++) {
                                let itemTemp = newItemSumIDList[k];
                                if (newItems == '') {
                                    newItems = itemTemp;
                                } else {
                                    newItems += ',' + itemTemp;
                                }
                            }

                            if (newItems == '') {
                                updateData = {
                                    secID: rows[i].secID,
                                    itemSumID: null
                                };
                            } else {
                                updateData = {
                                    secID: rows[i].secID,
                                    itemSumID: newItems
                                };
                            }
                        } else {
                            updateData = {
                                secID: rows[i].secID,
                                itemSumID: rows[i].itemSumID
                            }
                        }
                    }
                }

                querySql("SELECT idDev FROM mbomSectionSum WHERE mbomID = ?", mbomData.mbomID)
                    .then(rows => {
                        if(rows.length > 0){
                            querySql("UPDATE mbomSectionSum SET itemSumID = ? WHERE secID = ?", [updateData.itemSumID, updateData.secID])
                        }
                        return null;
                    })
                    .catch(err => {
                        console.log('there was an error:' + err);
                    });
            }
            return null;
        })
        .then(() => {
            res.locals = {title: 'Delete Item'};
            res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.addBrk = function(req, res) {
    let data1 = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        mbomID: req.body.mbomID
    };
    let data = [];
    let brkAccData = [];

    for(let el of brkAccArr){
        brkAccData.push({
            brkAccID: null,
            mbomID: data1.mbomID,
            idDev: null,
            brkAccQty: el.qty,
            brkAccType: el.type,
            brkAccMfg: el.mfg,
            brkAccDesc: el.desc,
            brkAccPN: el.pn
        });
    }

    //Splitting up the device designation
    let designations = req.body.devDesignation;
    let designationArrayInitial = designations.split(',').map(item => item.trim());
    let designationArrayFinal = [];
    for (let i = 0; i < designationArrayInitial.length; i++) {
        if (designationArrayInitial[i].includes("(") == true) {
            let designationInterval = (designationArrayInitial[i].slice(designationArrayInitial[i].indexOf('(') + 1, designationArrayInitial[i].indexOf(')'))).split('-');
            let designationInitialText = designationArrayInitial[i].slice(0, designationArrayInitial[i].indexOf('('));
            let designationFinalText = designationArrayInitial[i].slice(designationArrayInitial[i].indexOf(')') + 1, designationArrayInitial[i].length);
            for (let j = parseInt(designationInterval[0]); j <= parseInt(designationInterval[1]); j++) {
                let newDesignation = designationInitialText + j.toString() + designationFinalText;
                designationArrayFinal.push(newDesignation);
            }
        } else {
            designationArrayFinal.push(designationArrayInitial[i]);
        }
    }

    async function f(){
        for(let row of designationArrayFinal)
            data.push({
                mbomID: req.body.mbomID,
                devDesignation: row,
                devLayout: req.body.devLayout,
                unitOfIssue: req.body.unitOfIssue,
                catCode: req.body.catCode,
                brkPN: req.body.brkPN,
                cradlePN: req.body.cradlePN,
                devMfg: req.body.devMfg
            });
        return data;
    }

    f().then(
            async function (rows) {
                let temp = [];
                for (let row of rows) {
                    await querySql("INSERT INTO mbomBrkSum SET ?", row)
                        .then(rows => {
                                temp.push(rows.insertId);
                        });
                }
                return temp
            }
        )
        .then(
            async function(rows) {
                for(let row of rows){
                    for(let el of brkAccData){
                        await querySql("INSERT INTO mbomBrkAccSum SET mbomID = ?, idDev = ?, brkAccQty = ?, " +
                            "brkAccType = ?, brkAccMfg = ?, brkAccDesc = ?, brkAccPN = ?", [el.mbomID, row,
                            el.brkAccQty, el.brkAccType, el.brkAccMfg, el.brkAccDesc, el.brkAccPN]);
                    }
                }

                brkAccArr = [];
                brkDataObj = {};

                return null;
            }
        )
        .then(() => {
            res.locals = {title: 'New Quote'};
            res.redirect('searchMBOM/?bomID=' + data1.jobNum + data1.releaseNum + "_" + data1.mbomID);
            return null;
        })
        .catch(err => {
            return Promise.reject(err);
        });

};

exports.copyBreaker = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };
    let breakerData;
    let accData = [];
    async function getCopyData() {
        const brk = await querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE idDev = ?", qs.idDev);
        const accList = await querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_brkAcc_table + " WHERE idDev = ?", qs.idDev);

        return {brk, accList}
    }
    async function brkInsert(brk) {
        await querySql("INSERT INTO " + database + " . " + dbConfig.MBOM_breaker_table + " SET ?", brk);
        return querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE mbomID = ?", brk.mbomID);
    }
    getCopyData().then(({brk, accList}) => {
        breakerData = {
            mbomID: brk[0].mbomID,
            devLayout: brk[0].devLayout,
            devDesignation: brk[0].devDesignation,
            unitOfIssue: brk[0].unitOfIssue,
            catCode: brk[0].catCode,
            brkPN: brk[0].brkPN,
            cradlePN: brk[0].cradlePN,
            devMfg: brk[0].devMfg
        };

        for (let row of accList) {
            accData.push({
                mbomID: row.mbomID,
                brkAccQty: row.brkAccQty,
                brkAccType: row.brkAccType,
                brkAccMfg: row.brkAccMfg,
                brkAccDesc: row.brkAccDesc,
                brkAccPN: row.brkAccPN
            });
        }
        return null
    })
    .then(() => {
        brkInsert(breakerData)
        .then(brks => {
            let newDevID = brks[brks.length - 1].idDev;
            for (let i = 0; i < accData.length; i++) {
                accData[i].idDev = newDevID;
                querySql("INSERT INTO " + database + " . " + dbConfig.MBOM_brkAcc_table + " SET ?", accData[i]);
            }
            return null
        })
        .catch(err => {
            return Promise.reject(err);
        });
    })
    .then(() => {

    })
    .then(() => {
        res.locals = {title: 'Copy Breaker'};
        res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
    })
    .catch(err => {
        return Promise.reject(err);
    });
};


exports.editBreaker = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let breakerData = [];
    let accData = [];
    let brkDataObj;
    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        boardDesignation: req.body.boardDesignation
    };
    let profilePic

    querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE idDev = ?", qs.idDev)
        .then(rows => {
            for(let row of rows){
                breakerData.push(row);
            }
            return querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_brkAcc_table + " WHERE idDev = ?", qs.idDev)
        })
        .then(rows => {
            for(let row of rows){
                accData.push(row);
            }
            return querySql("SELECT * FROM "+ database + "."+ dbConfig.user_profile_table +" WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            if(rows.length != 0){
                profilePic = '/public/uploads/' + rows[0].profilePic;
            }

            return null
        })
        .then(() => {
            res.locals = {title: 'Edit Breaker'};
            res.render('MechEng/editBreaker', {
                mbomBrkData: breakerData,
                brkAccData: accData,
                mbomData: mbomData,
                brkData: brkDataObj,
                profilePic: profilePic
            });
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.saveBreakerChanges = function(req, res) {
    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
    };
    let updateData = {
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

    querySql("UPDATE " + database + "." + dbConfig.MBOM_breaker_table + " SET mbomID = ?, " +
        " devLayout = ?, devDesignation = ?, unitOfIssue = ?, catCode = ?, brkPN = ?, cradlePN = ?, devMfg = ? WHERE idDev = ?", [updateData.mbomID,
        updateData.devLayout, updateData.devDesignation, updateData.unitOfIssue, updateData.catCode, updateData.brkPN, updateData.cradlePN,
        updateData.devMfg, updateData.idDev])
        .then(() => {
            res.locals = {title: 'Copy Breaker'};
            res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + updateData.mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.deleteBreaker = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);

    let mbomData = {
        mbomID: req.body.mbomID,
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
    };

    querySql("DELETE FROM " + database + "." + dbConfig.MBOM_breaker_table + " WHERE idDev = ?", qs.idDev)
        .then(() => {
            return querySql("SELECT * FROM " + database + "." + dbConfig.MBOM_section_sum + " WHERE mbomID = ?", mbomData.mbomID)
        })
        .then(rows => {
            let newBkrs = '';
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].idDev != null) {
                    let idDevList = rows[i].idDev.split(',');
                    if (idDevList.includes(qs.idDev.toString())) {
                        let newIdDevList = [];
                        for (let j = 0; j < idDevList.length; j++) {
                            if (idDevList[j] == qs.idDev.toString()) {

                            } else {
                                newIdDevList.push(idDevList[j])
                            }
                        }
                        for (let k = 0; k < newIdDevList.length; k++) {
                            let bkrTemp = newIdDevList[k];
                            if (newBkrs == '') {
                                newBkrs = bkrTemp;
                            } else {
                                newBkrs += ',' + bkrTemp;
                            }
                        }
                        let updateData = {};
                        if (newBkrs == '') {
                            updateData = {
                                secID: rows[i].secID,
                                idDev: null
                            };
                        } else {
                            updateData = {
                                secID: rows[i].secID,
                                idDev: newBkrs
                            };
                        }

                        querySql("UPDATE " + database + "." + dbConfig.MBOM_section_sum + " SET idDev = ? WHERE secID = ?", [updateData.idDev, updateData.secID]);
                    }
                }
            }

            return null;
        })
        .then(() => {
            res.locals = {title: 'Delete Breaker'};
            res.redirect('../searchMBOM/?bomID=' + mbomData.jobNum + mbomData.releaseNum + "_" + mbomData.mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.mbomAddSection = function(req, res) {
    let data = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
    };
    let numSections, mbomID;

    querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [data.jobNum, data.releaseNum])
        .then(rows => {
            numSections = rows[0].numSections + 1;
            mbomID = rows[0].mbomID;

            querySql("UPDATE " + database + "." + dbConfig.MBOM_summary_table + " SET numSections = ? WHERE jobNum = ? AND releaseNum = ?", [numSections, data.jobNum, data.releaseNum]);

            return null;
        })
        .then(() => {
            res.locals = {title: 'Add Section'};
            res.redirect('searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.mbomResetSection = function(req, res) {
    let data = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
    };
    let numSections = 0;
    let mbomID;

    querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE jobNum = ? AND releaseNum = ?", [data.jobNum, data.releaseNum])
        .then(rows => {
            mbomID = rows[0].mbomID;

            querySql("UPDATE " + database + "." + dbConfig.MBOM_summary_table + " SET numSections = ? WHERE jobNum = ? AND releaseNum = ?", [numSections, data.jobNum, data.releaseNum]);

            return null;
        })
        .then(() => {
            res.locals = {title: 'Reset Section'};
            res.redirect('searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.mbomDeleteSection = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let selectedSec = qs.selectedSec;
    let numSections = qs.numSections;
    let data = {
        mbomID: req.body.mbomID[0],
        jobNum: req.body.jobNum[0],
        releaseNum: req.body.releaseNum[0]
    };

    querySql("DELETE FROM " + database + " . " + dbConfig.MBOM_section_sum + " WHERE mbomID = ? AND sectionNum = ?", [data.mbomID[0], selectedSec])
        .then(() => {
            for(let i = parseInt(selectedSec) + 1; i <= numSections; i++){
                querySql("UPDATE " + database + " . " + dbConfig.MBOM_section_sum + " SET sectionNum = ? WHERE mbomID = ? AND sectionNum = ?", [i - 1, data.mbomID[0], i]);
            }

            return null;
        })
        .then(() => {
            querySql("UPDATE " + database + "." + dbConfig.MBOM_summary_table + " SET numSections = ? WHERE mbomID = ?", [(numSections - 1), data.mbomID]);

            return null;
        })
        .then(() => {
            res.locals = {title: 'Delete Section'};
            res.redirect('../searchMBOM/?bomID=' + data.jobNum + data.releaseNum + "_" + data.mbomID);
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.sectionConfigure = function(req, res) {
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
        let jobNum, releaseNum;

        querySql("SELECT jobNum, releaseNum FROM " + database + "." + dbConfig.MBOM_summary_table + " WHERE mbomID = ?", data[0].mbomID)
        .then(rows => {
            jobNum = rows[0].jobNum;
            releaseNum = rows[0].releaseNum;
            return null
        })
        .then(() => {
            if(data[0].sectionNum != 0) {
                for (let j = 0; j < data.length; j++) {
                    let secData = data[j];
                    querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_section_sum + " WHERE sectionNum = ? AND mbomID = ?", [secData.sectionNum, secData.mbomID])
                        .then(rows => {
                            if (rows.length == 0) {
                                if (secData.idDev == '') {
                                    querySql("INSERT INTO " + database + " . " + dbConfig.MBOM_section_sum + " SET sectionNum = ?, idDev = ?, itemSumID = ?, mbomID = ?", [secData.sectionNum, null, secData.itemSumID, secData.mbomID])
                                } else if (secData.itemSumID == '') {
                                    querySql("INSERT INTO " + database + " . " + dbConfig.MBOM_section_sum + " SET sectionNum = ?, idDev = ?, itemSumID = ?, mbomID = ?", [secData.sectionNum, secData.idDev, null, secData.mbomID])
                                } else {
                                    querySql("INSERT INTO " + database + " . " + dbConfig.MBOM_section_sum + " SET ?", secData)
                                }
                            } else {
                                if (secData.idDev == '') {
                                    querySql("UPDATE " + database + " . " + dbConfig.MBOM_section_sum + " SET idDev = ?, itemSumID = ? WHERE secID = ?", [null, secData.itemSumID, rows[0].secID]);
                                } else if (secData.itemSumID == '') {
                                    querySql("UPDATE " + database + " . " + dbConfig.MBOM_section_sum + " SET idDev = ?, itemSumID = ? WHERE secID = ?", [secData.idDev, null, rows[0].secID]);
                                } else {
                                    querySql("UPDATE " + database + "." + dbConfig.MBOM_section_sum + " SET idDev = ?, itemSumID = ? WHERE secID = ?", [secData.idDev, secData.itemSumID, rows[0].secID]);
                                }
                            }
                            return null
                        })
                        .catch(err => {
                            console.log('there was an error:' + err);
                        });
                }
            }
            return null
        })
        .then(() => {
            res.redirect('searchMBOM/?bomID=' + jobNum + releaseNum + "_" + data[0].mbomID)
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};

exports.generateMBOM = function (req, res) {
/*const downloadsFolder = require('downloads-folder');*/
    let mbomID = req.body.mbomID;
    let jobNum = req.body.jobNum;
    let releaseNum = req.body.releaseNum;
    let partNumCount = 1;
    let mbomSumData = [];
    let mbomSecSumData = [];
    let mbomItemData = [];
    let mbomUserItem = [];
    let mbomComItem = [];
    let mbomBrkSum = [];
    let mbomBrkAccSum = [];

    let workbook = new Excel.Workbook();
    let sheet = workbook.addWorksheet(jobNum + releaseNum + ' Jobscope BOM');

    async function f(){
        await sheet.protect('password', {selectLockedCells: true, formatColumns: true, formatRows: true});
        return null;
    }

    f().then();

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
        {header: 'Manufacturer Part Number', key: 'mfgPartNum', width: 50,  style: {font: {name: 'Calibri', size: 11}}},
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

    querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_summary_table + " WHERE mbomID = ?", mbomID)
        .then(rows => {
            for(let row of rows){
                mbomSumData.push(row);
            }

            return querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_section_sum + " WHERE mbomID = ?", mbomID);
        })
        .then(rows => {
            for(let row of rows){
                mbomSecSumData.push(row);
            }

            return querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_item_table + " WHERE mbomID = ?", mbomID);
        })
        .then(rows => {
            for(let row of rows){
                mbomItemData.push(row);
            }

            return querySql("SELECT * FROM "+database+"."+dbConfig.MBOM_user_items+" WHERE mbomID = ?", mbomID);
        })
        .then(rows => {
            for(let row of rows){
                mbomUserItem.push(row);
            }

            return querySql("SELECT * FROM "+database+"."+dbConfig.MBOM_common_items);
        })
        .then(rows => {
            for(let row of rows){
                mbomComItem.push(row);
            }

            return querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_breaker_table + " WHERE mbomID = ?", mbomID);
        })
        .then(rows => {
            for(let row of rows){
                mbomBrkSum.push(row);
            }

            return querySql("SELECT * FROM " + database + " . " + dbConfig.MBOM_brkAcc_table + " WHERE mbomID = ?", mbomID);
        })
        .then(rows => {
            for(let row of rows)
                mbomBrkAccSum.push(row);

            return null;
        })
        .then(() => {
            let mbomAssemNumArr = [];

            //FOR SECTION
            for (let i = 0; i < mbomSecSumData.length; i++) {
                let pre;
                if (i < 9)
                    pre = '10';
                else
                    pre = '1';
                let assemblyNum = jobNum + releaseNum + '-MBOM-' + pre + mbomSecSumData[i].sectionNum;
                mbomAssemNumArr.push(assemblyNum);
                let count = 1;

                sheet.addRow({
                    assemblyNum: assemblyNum,
                    seqNum: null,
                    compPartNum: assemblyNum,
                    mfgPartNum: null,
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
                if (mbomSecSumData[i].itemSumID != null) {
                    let itemIDList = mbomSecSumData[i].itemSumID.split(',');
                    let itemArr = [];
                    for (let j = 0; j < mbomItemData.length; j++) {
                        for (let k = 0; k < itemIDList.length; k++) {
                            if (mbomItemData[j].itemSumID == itemIDList[k]) {
                                if (mbomItemData[j].userItemID != null) {
                                    for (let x = 0; x < mbomUserItem.length; x++) {
                                        if (mbomUserItem[x].userItemID == mbomItemData[j].userItemID) {
                                            itemArr.push({
                                                itemID: mbomUserItem[x].userItemID,
                                                sumID: mbomItemData[j].itemSumID,
                                                itemPN: mbomUserItem[x].itemPN,
                                                qty: mbomItemData[j].itemQty,
                                                itemMfg: mbomUserItem[x].itemMfg,
                                                itemDesc: mbomUserItem[x].itemDesc,
                                                unitOfIssue: mbomUserItem[x].unitOfIssue,
                                                catCode: mbomUserItem[x].catCode
                                            });
                                        }
                                    }
                                } else {
                                    for (let x = 0; x < mbomComItem.length; x++) {
                                        if (mbomComItem[x].comItemID == mbomItemData[j].comItemID) {
                                            itemArr.push({
                                                itemID: mbomComItem[x].comItemID,
                                                sumID: mbomItemData[j].itemSumID,
                                                itemPN: mbomComItem[x].itemPN,
                                                qty: mbomItemData[j].itemQty,
                                                itemMfg: mbomComItem[x].itemMfg,
                                                itemDesc: mbomComItem[x].itemDesc,
                                                unitOfIssue: mbomComItem[x].unitOfIssue,
                                                catCode: mbomComItem[x].catCode
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                    let totalQty = [];
                    let obj = null;
                    for (let f = 0; f < itemArr.length; f++) {
                        obj = itemArr[f];
                        if (!totalQty[obj.itemID]) {
                            totalQty[obj.itemID] = obj;
                        } else {
                            totalQty[obj.itemID].qty += obj.qty;
                            totalQty[obj.itemID].itemDesc = obj.itemDesc;
                        }
                    }
                    let totalQtyResults = [];
                    for (let prop in totalQty)
                        totalQtyResults.push(totalQty[prop]);

                    for (let item2 of totalQtyResults) {
                        let seqNum;
                        if (count < 10)
                            seqNum = '00' + count;
                        else if (count < 100)
                            seqNum = '0' + count;
                        else
                            seqNum = count;

                        let itemPN = item2.itemPN;
                        let qty = item2.qty;
                        let itemDesc = item2.itemDesc;
                        let itemDesc1 = itemDesc.substring(0, 40);
                        let itemDesc2 = itemDesc.substring(40, 80);
                        let itemDesc3 = itemDesc.substring(80, 120);
                        let itemDesc4 = itemDesc.substring(120, 160);
                        let unitOfIssue = item2.unitOfIssue;
                        let catCode = item2.catCode;
                        let itemMfg = item2.itemMfg;
                        let mfgPartNum = null;
                        if(itemPN.length > 20){
                            mfgPartNum = itemPN;
                            itemPN = jobNum + releaseNum + '-' + partNumCount + '-ITEM';
                            partNumCount++;
                        }

                        sheet.addRow({
                            assemblyNum: assemblyNum,
                            seqNum: seqNum.toString(),
                            compPartNum: itemPN,
                            mfgPartNum: mfgPartNum,
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
                if (mbomSecSumData[i].idDev != null) {
                    let devIDList = mbomSecSumData[i].idDev.split(',');
                    let brkArr = [];
                    for (let j = 0; j < mbomBrkSum.length; j++) {
                        for (let k = 0; k < devIDList.length; k++) {
                            if (mbomBrkSum[j].idDev == devIDList[k]) {
                                let temp = null;
                                for(let el of mbomBrkAccSum){
                                    if(el.idDev == devIDList[k]){
                                        if(temp == null)
                                            temp = el.brkAccID;
                                        else
                                            temp += ',' + el.brkAccID;
                                    }
                                }
                                brkArr.push({
                                    idDev: mbomBrkSum[j].idDev,
                                    brkPN: mbomBrkSum[j].brkPN,
                                    cradlePN: mbomBrkSum[j].cradlePN,
                                    devDesignation: mbomBrkSum[j].devDesignation,
                                    qty: 1,
                                    unitOfIssue: mbomBrkSum[j].unitOfIssue,
                                    catCode: mbomBrkSum[j].catCode,
                                    devMfg: mbomBrkSum[j].devMfg,
                                    brkAcc: temp
                                });
                            }
                        }
                    }

                    let totalQty = [];
                    let obj = null;
                    for (let f = 0; f < brkArr.length; f++) {
                        obj = brkArr[f];
                        if (!totalQty[obj.brkPN]) {
                            totalQty[obj.brkPN] = obj;
                        } else {
                            totalQty[obj.brkPN].qty += obj.qty;
                            totalQty[obj.brkPN].devDesignation += ', ' + obj.devDesignation;
                            totalQty[obj.brkPN].brkAcc += ',' + obj.brkAcc;
                        }
                    }

                    let totalQtyResults = [];
                    for (let prop in totalQty)
                        totalQtyResults.push(totalQty[prop]);

                    for (let item2 of totalQtyResults) {
                        let seqNum;
                        if (count < 10)
                            seqNum = '00' + count;
                        else if (count < 100)
                            seqNum = '0' + count;
                        else
                            seqNum = count;

                        let brkPN = item2.brkPN;
                        let crdPN = item2.cradlePN;
                        let devDes = item2.devDesignation;
                        let devDes1 = devDes.substring(0, 24);
                        let devDes2 = devDes.substring(24, 64);
                        let devDes3 = devDes.substring(64, 104);
                        let devDes4 = devDes.substring(104, 144);
                        let qty = item2.qty;
                        let unitOfIssue = item2.unitOfIssue;
                        let catCode = item2.catCode;
                        let devMfg = item2.devMfg;
                        let idDev = item2.idDev;
                        let brkAccList = [];

                        if (item2.brkAcc != null) {
                            if(typeof item2.brkAcc == 'string'){
                                for (let i = 0; i < item2.brkAcc.split(',').length; i++) {
                                    brkAccList.push(item2.brkAcc.split(',')[i])
                                }
                            }else
                                brkAccList.push(item2.brkAcc);

                        }
                        let brkMfgPartNum = null;
                        if(brkPN.length > 20){
                            brkMfgPartNum = brkPN;
                            brkPN = jobNum + releaseNum + '-' + partNumCount + '-BRK';
                            partNumCount++;
                        }
                        let crdMfgPartNum = null;
                        if(crdPN.length > 20){
                            crdMfgPartNum = crdPN;
                            crdPN = jobNum + releaseNum + '-' + partNumCount + '-CRA';
                            partNumCount++;
                        }

                        sheet.addRow({
                            assemblyNum: assemblyNum,
                            seqNum: seqNum.toString(),
                            compPartNum: brkPN,
                            mfgPartNum: brkMfgPartNum,
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
                            let seqNum;
                            if (count < 10)
                                seqNum = '00' + count;
                            else if (count < 100)
                                seqNum = '0' + count;
                            else
                                seqNum = count;
                            sheet.addRow({
                                assemblyNum: assemblyNum,
                                seqNum: seqNum.toString(),
                                compPartNum: crdPN,
                                mfgPartNum: crdMfgPartNum,
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

                        for(let el of brkAccList){
                            for(let row of mbomBrkAccSum) {
                                if(row.brkAccID == el){
                                    let itemDesc = row.brkAccDesc;
                                    let itemDesc1 = itemDesc.substring(0, 40);
                                    let itemDesc2 = itemDesc.substring(40, 80);
                                    let itemDesc3 = itemDesc.substring(80, 120);
                                    let itemDesc4 = itemDesc.substring(120, 160);

                                    let brkAccPN = row.brkAccPN;
                                    let brkAccMfgPartNum = null;
                                    if(brkAccPN.length > 20){
                                        brkAccMfgPartNum = brkAccPN;
                                        brkAccPN = jobNum + releaseNum + '-' + partNumCount +'-BRKACC';
                                        partNumCount++;
                                    }

                                    count++;
                                    let seqNum;
                                    if (count < 10)
                                        seqNum = '00' + count;
                                    else if (count < 100)
                                        seqNum = '0' + count;
                                    else
                                        seqNum = count;

                                    sheet.addRow({
                                        assemblyNum: assemblyNum,
                                        seqNum: seqNum.toString(),
                                        compPartNum: brkAccPN,
                                        mfgPartNum: brkAccMfgPartNum,
                                        desc1: itemDesc1,
                                        desc2: itemDesc2,
                                        desc3: itemDesc3,
                                        desc4: itemDesc4,
                                        qty: row.brkAccQty,
                                        unitOfIssue: unitOfIssue,
                                        unitOfPurchase: unitOfIssue,
                                        categoryCode: catCode,
                                        makePart: 0,
                                        buyPart: 1,
                                        stockPart: 0,
                                        manufacturer: row.brkAccMfg,
                                        deviceDes: devDes
                                    });
                                }
                            }
                        }

                        count++;
                    }
                }
            }

            //FOR SHIP LOOSE ITEMS
            sheet.addRow({
                assemblyNum: jobNum + releaseNum + '-MBOM-SP',
                seqNum: null,
                compPartNum: jobNum + releaseNum + '-MBOM-SP',
                mfgPartNum: null,
                desc1: jobNum + releaseNum + '-MBOM-SP Bill of Material',
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
            let count = 1;
            let shipLooseItems = [];
            for(let i = 0; i < mbomItemData.length; i++){
                if(mbomItemData[i].shipLoose == 'Y'){
                    if (mbomItemData[i].userItemID != null) {
                        for (let x = 0; x < mbomUserItem.length; x++) {
                            if (mbomUserItem[x].userItemID == mbomItemData[i].userItemID) {
                                shipLooseItems.push({
                                    itemID: mbomUserItem[x].userItemID,
                                    sumID: mbomItemData[i].itemSumID,
                                    itemPN: mbomUserItem[x].itemPN,
                                    qty: mbomItemData[i].itemQty,
                                    itemMfg: mbomUserItem[x].itemMfg,
                                    itemDesc: mbomUserItem[x].itemDesc,
                                    unitOfIssue: mbomUserItem[x].unitOfIssue,
                                    catCode: mbomUserItem[x].catCode
                                });
                            }
                        }
                    } else {
                        for (let x = 0; x < mbomComItem.length; x++) {
                            if (mbomComItem[x].comItemID == mbomItemData[i].comItemID) {
                                shipLooseItems.push({
                                    itemID: mbomComItem[x].comItemID,
                                    sumID: mbomItemData[i].itemSumID,
                                    itemPN: mbomComItem[x].itemPN,
                                    qty: mbomItemData[i].itemQty,
                                    itemMfg: mbomComItem[x].itemMfg,
                                    itemDesc: mbomComItem[x].itemDesc,
                                    unitOfIssue: mbomComItem[x].unitOfIssue,
                                    catCode: mbomComItem[x].catCode
                                });
                            }
                        }
                    }
                }
            }
            let totalQty = [];
            let obj = null;
            for (let f = 0; f < shipLooseItems.length; f++) {
                obj = shipLooseItems[f];
                if (!totalQty[obj.itemID]) {
                    totalQty[obj.itemID] = obj;
                } else {
                    totalQty[obj.itemID].qty += obj.qty;
                    totalQty[obj.itemID].itemDesc = obj.itemDesc;
                }
            }
            let totalQtyResults = [];
            for (let prop in totalQty)
                totalQtyResults.push(totalQty[prop]);

            for (let item2 of totalQtyResults) {
                let seqNum;
                if (count < 10)
                    seqNum = '00' + count;
                else if (count < 100)
                    seqNum = '0' + count;
                else
                    seqNum = count;

                let itemPN = (item2.itemPN).toString();
                let qty = item2.qty;
                let itemDesc = item2.itemDesc;
                let itemDesc1 = itemDesc.substring(0, 40);
                let itemDesc2 = itemDesc.substring(40, 80);
                let itemDesc3 = itemDesc.substring(80, 120);
                let itemDesc4 = itemDesc.substring(120, 160);
                let unitOfIssue = item2.unitOfIssue;
                let catCode = item2.catCode;
                let itemMfg = item2.itemMfg;
                let mfgPartNum = null;
                if(itemPN.length > 20){
                    mfgPartNum = itemPN;
                    itemPN = jobNum + releaseNum + '-' + partNumCount + '-ITEM';
                    partNumCount++;
                }

                sheet.addRow({
                    assemblyNum: jobNum + releaseNum + '-MBOM-SP',
                    seqNum: seqNum.toString(),
                    compPartNum: itemPN,
                    mfgPartNum: mfgPartNum,
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

            //mbom summary
            sheet.addRow({
                assemblyNum: jobNum + releaseNum + '-MBOM',
                seqNum: null,
                compPartNum: jobNum + releaseNum + '-MBOM',
                mfgPartNum: null,
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

            for (let i = 0; i < mbomAssemNumArr.length; i++) {
                let seqNum;
                if ((i + 1) < 10)
                    seqNum = '00' + (i + 1);
                else if ((i + 1) < 100)
                    seqNum = '0' + (i + 1);
                else
                    seqNum = (i + 1);

                sheet.addRow({
                    assemblyNum: jobNum + releaseNum + '-MBOM',
                    seqNum: seqNum.toString(),
                    compPartNum: mbomAssemNumArr[i],
                    mfgPartNum: null,
                    desc1: null,
                    desc2: null,
                    desc3: null,
                    desc4: null,
                    qty: 1,
                    /*qty: result[0].qtyBoard,*/
                    unitOfIssue: null,
                    unitOfPurchase: null,
                    categoryCode: null,
                    makePart: null,
                    buyPart: null,
                    stockPart: null,
                    manufacturer: null,
                    deviceDes: null
                });
                if(i+1 == mbomAssemNumArr.length){
                    seqNum = parseInt(seqNum) + 1;
                    if (seqNum < 10)
                        seqNum = '00' + seqNum;
                    else if (seqNum < 100)
                        seqNum = '0' + seqNum;
                    else
                        seqNum = seqNum.toString();
                    sheet.addRow({
                        assemblyNum: jobNum + releaseNum + '-MBOM',
                        seqNum: seqNum,
                        compPartNum: jobNum + releaseNum + '-MBOM-SP',
                        mfgPartNum: null,
                        desc1: null,
                        desc2: null,
                        desc3: null,
                        desc4: null,
                        qty: 1,
                        /*qty: result[0].qtyBoard,*/
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
            }

            /*sheet.getColumn(3).eachCell(function(cell){
                if(cell.value != 'Component Part Number:' && cell.value.length > 20){
                    cell.fill = {type: 'pattern', pattern:'solid', fgColor:{argb:'FFFF9999'}};
                    cell.alignment = {wrapText: true};
                }
            });*/
            sheet.getColumn(3).eachCell(function(cell){
                if(cell.value != 'Component Part Number:' && cell.value.includes(jobNum + releaseNum + '-') &&
                    !cell.value.includes(jobNum + releaseNum + '-MBOM')){
                    cell.fill = {type: 'pattern', pattern:'solid', fgColor:{argb:'FFFF9999'}};
                    cell.alignment = {wrapText: true};
                }
            });
            sheet.getColumn(4).eachCell(function(cell){
                cell.alignment = {wrapText: true};
            });


            workbook.xlsx.writeFile('uploads/' + jobNum + releaseNum + ' MBOM.xlsx').then(function () {
                const remoteFilePath = 'uploads/';
                const remoteFilename = jobNum + releaseNum + ' MBOM.xlsx';
                res.download(remoteFilePath + remoteFilename);
            });

            return null;
        })
        .catch(err => {
            console.log('there was an error:' + err);
        });
};