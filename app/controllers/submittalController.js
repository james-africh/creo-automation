
const path = require('path');
const url = require('url');
const queryString = require('query-string');
const moment = require('moment');


//Excel Connection
const Excel = require('exceljs');


//DATABASE INFORMATION (TABLE NAMES)
const dbConfig = require('../config/database.js');
const database = dbConfig.database;

//Creoson Connection
const reqPromise = require('request-promise');
let creoHttp = 'http://localhost:9056/creoson';
let sessionId;
let connectOptions = {
    method: 'POST',
    uri: creoHttp,
    body: {
        "command": "connection",
        "function": "connect"
    },
    json: true // Automatically stringifies the body to JSON
};

reqPromise(connectOptions)
    .then(reqConnectBody => {
        // get the sessionId
        sessionId = reqConnectBody.sessionId;
    })
    .catch(err => {
        console.log('there was an error:' + err)
    });


function creo(sessionId, functionData) {
    if (functionData.data.length != 0) {
        return reqPromise({
            method: 'POST',
            uri: creoHttp,
            body: {
                "sessionId": sessionId,
                "command": functionData.command,
                "function": functionData.function,
                "data": functionData.data
            },
            json: true
        });
    } else {
        return reqPromise({
            method: 'POST',
            uri: creoHttp,
            body: {
                "sessionId": sessionId,
                "command": functionData.command,
                "function": functionData.function
            },
            json: true
        });
    }
}

const DB = require('../config/db.js');
const querySql = DB.querySql;
const Promise = require('bluebird');


exports = {};
module.exports = exports;

async function submittalLookup(lookupArray) {
    if (lookupArray.length == 0) {
        return await querySql("SELECT * FROM " + database + "." + dbConfig.submittal_summary_table);
    } else {
        if (lookupArray[0] != null && lookupArray[1] != null) {
            return await querySql("SELECT * FROM " + database + "." + dbConfig.submittal_summary_table+" WHERE jobNum = ? AND releaseNum = ?",[lookupArray[0], lookupArray[1]]);
        } else if (lookupArray[2] != null) {
            return await querySql("SELECT * FROM " + database + "." + dbConfig.submittal_summary_table+" WHERE subID = ?", lookupArray[2]);
        }
    }

}

async function revLookup(lookupArray) {
    if (lookupArray.length == 0) {
        return await querySql("SELECT * FROM " + database + "." + dbConfig.submittal_rev_table);
    } else {
        return await querySql("SELECT * FROM " + database + "." + dbConfig.submittal_rev_table + " WHERE subID = ?", lookupArray[0]);
    }
}


exports.submittal = function(req, res) {
    let submittalData = [];
    submittalLookup([])
        .then(async function(submittals) {
            for (let submittal of submittals) {
                let drawnDate = moment(submittal.drawnDate).utc().format("YYYY-MM-DD");
                let checkedDate = moment(submittal.checkedDate).utc().format("YYYY-MM-DD");
                await submittalData.push({
                    subID: submittal.subID,
                    jobNum: submittal.jobNum,
                    releaseNum: submittal.releaseNum,
                    jobName: submittal.jobName,
                    customer: submittal.customer,
                    layoutName: submittal.layoutName,
                    drawnBy: submittal.drawnBy,
                    drawnDate: drawnDate,
                    checkedBy: submittal.checkedBy,
                    checkedDate: checkedDate
                });
            }
            return null
        })
        .then(() => {
            res.locals = {title: 'Submittal'};
            res.render('Submittal/submittal', {
                message: null,
                newSubData: null,
                submittalData: submittalData
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.createSubmittal = function(req, res) {
    let submittalData = [];
    let newSubData = {
        jobNum: req.body.jobNum,
        releaseNum: req.body.releaseNum,
        jobName: req.body.jobName,
        customer: req.body.customer,
        layoutName: req.body.layoutName,
        drawnBy: req.body.drawnBy,
        drawnDate: req.body.drawnDate,
        checkedBy: req.body.checkedBy,
        checkedDate: req.body.checkedDate
    };

    async function createSubmittal(subData) {
        return await querySql("INSERT INTO " + database + "." + dbConfig.submittal_summary_table + " SET ?", subData);
    }
    async function createRev(revData) {
        return await querySql("INSERT INTO " + database + "." + dbConfig.submittal_rev_table + " SET ?", revData);
    }

    submittalLookup([])
        .then(async function(submittals) {
            let existingSubID = null;
            for (let submittal of submittals) {
                submittalData.push({
                    subID: submittal.subID,
                    jobNum: submittal.jobNum,
                    releaseNum: submittal.releaseNum,
                    jobName: submittal.jobName,
                    customer: submittal.customer,
                    layoutName: submittal.layoutName,
                    drawnBy: submittal.drawnBy,
                    drawnDate: submittal.drawnDate,
                    checkedBy: submittal.checkedBy,
                    checkedDate: submittal.checkedDate
                });
                if (submittal.jobNum == newSubData.jobNum && submittal.releaseNum == newSubData.releaseNum) {
                    existingSubID = submittal.subID;
                }
            }
            if (existingSubID != null) {
                res.locals = {title: 'Submittal'};
                res.render('Submittal/submittal', {
                    message: "Submittal already exists for "+newSubData.jobNum+newSubData.releaseNum,
                    newSubData: newSubData,
                    submittalData: submittalData
                });
            } else {
                await createSubmittal(newSubData);
                const submittals =  await submittalLookup([newSubData.jobNum, newSubData.releaseNum, null]);
                let subID = submittals[0].subID;
                let newRevData = {
                    subID: subID,
                    revNum: 'S00',
                    revNote: req.body.revNote
                };
                await createRev(newRevData);
                res.locals = {title: 'Submittal'};
                res.redirect('../searchSubmittal/?subID='+newSubData.jobNum+newSubData.releaseNum+"_"+subID);
            }
        })
        .catch(err => {
            console.log(err);
        })
};

exports.searchSubmittal = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let subID = qs.subID.split('_')[1];
    let subData = [];
    let revData = [];
    let creoData = [];
    let layoutData = [];
    let dropdownData = [];

    submittalLookup([null, null, subID])
        .then(async function(submittals) {
            for (let submittal of submittals) {
                let drawnDate = moment(submittal.drawnDate).utc().format("YYYY-MM-DD");
                let checkedDate = moment(submittal.checkedDate).utc().format("YYYY-MM-DD");
                await subData.push({
                    subID: submittal.subID,
                    jobNum: submittal.jobNum,
                    releaseNum: submittal.releaseNum,
                    jobName: submittal.jobName,
                    customer: submittal.customer,
                    layoutName: submittal.layoutName,
                    drawnBy: submittal.drawnBy,
                    drawnDate: drawnDate,
                    checkedBy: submittal.checkedBy,
                    checkedDate: checkedDate
                });
            }
            return null
        })
        .then(async function() {
            return await revLookup([subData[0].subID])
        })
        .then(async function(revs) {
            for (let rev of revs) {
                await revData.push({
                    revID: rev.revID,
                    subID: rev.subID,
                    revNum: rev.revNum,
                    revNote: rev.revNote
                })
            }
            return null
        })
        .then(async function() {
            let jobNum = subData[0].jobNum;
            let releaseNum = subData[0].releaseNum;
            let layoutName = subData[0].layoutName;
            let latestRevNum = revData[revData.length - 1].revNum;

            let layoutNum = releaseNum.toLowerCase().charCodeAt(0) - 96;
            let creoWorkingDir = null;
            let creoLayoutAsm;
            let creoLayoutDrw;
            let creoOneLineAsm;
            let creoStartDir = 'C:\\PTC CREO\\SAI-START\\SAI-PARTS\\';
            let creoOutputDir = null;
            let creoOutputPDF;
            if (layoutNum < 10) {
                creoLayoutAsm = jobNum+'-'+'0000'+'-'+'00'+layoutNum+'.asm';
                creoOneLineAsm = jobNum+'-'+'0001'+'-'+'00'+layoutNum+'.asm';
            } else if (layoutNum < 100) {
                creoLayoutAsm = jobNum+'-'+'0000'+'-'+'0'+layoutNum+'.asm';
                creoOneLineAsm = jobNum+'-'+'0001'+'-'+'0'+layoutNum+'.asm';
            }
            creoLayoutDrw = creoLayoutAsm.slice(0,15)+'-S.drw';
            creoOutputPDF = creoLayoutAsm.slice(0,15)+'-'+latestRevNum+'_'+layoutName+'.pdf';
            creoData.push({
                workingDir: creoWorkingDir,
                layoutAsm: creoLayoutAsm,
                layoutDrw: creoLayoutDrw,
                oneLineAsm: creoOneLineAsm,
                startDir: creoStartDir,
                outputDir: creoOutputDir,
                outputPDF: creoOutputPDF
            });
            return null
        })
        .then(async function () {
            return await querySql("SELECT * FROM " + database + "." + dbConfig.submittal_layout_table + " WHERE subID = ?", subData[0].subID);
        })
        .then(async function(layouts) {
            if (layouts.length != 0) {
                for (let layout of layouts) {
                    layoutData.push({
                        subID: layout.subID,
                        layoutName: layout.layoutName,
                        ulListing: layout.ulListing,
                        systemType: layout.systemType,
                        systemAmp: layout.systemAmp,
                        mainBusAmp: layout.mainBusAmp,
                        enclosure: layout.enclosure,
                        accessibility: layout.accessibility,
                        cableAccess: layout.cableAccess,
                        paint: layout.paint,
                        interruptRating: layout.interruptRating,
                        busBracing: layout.busBracing,
                        busType: layout.busType,
                        insulatedBus: layout.insulatedBus,
                        boots: layout.boots,
                        iccbPlatform: layout.iccbPlatform,
                        mccbPlatform: layout.mccbPlatform,
                        keyInterlocks: layout.keyInterlocks,
                        seismic: layout.seismic,
                        mimic: layout.mimic,
                        ir: layout.ir,
                        wireway: layout.wireway,
                        trolley: layout.trolley,
                        numSections: layout.numSections
                    });
                }
            }
            return null
        })
        .then(async function() {
            return await querySql("SELECT * FROM " + database + "." + dbConfig.submittal_layout_dropdowns);
        })
        .then(async function(dropdowns) {
            for (let dropdown of dropdowns) {
                dropdownData.push({
                    type: dropdown.dropdownType,
                    value: dropdown.dropdownValue
                });
            }
            return null
        })
        .then(() => {
            console.log(layoutData);
            res.locals = {title: 'Submittal'};
            res.render('Submittal/searchSubmittal', {
                message: null,
                subData: subData,
                revData: revData,
                creoData: creoData,
                layoutData: layoutData,
                sectionData: [],
                dropdownData: dropdownData,
                layoutItemData: [],
                userItemData: [],
                comItemData: [],
                layoutControlData: [],
                controlAsmData: [],
                panelboardData: [],
                deviceData: [],
                brkAccSum: [],
                brkAccDropdown: [],
                currentSlide: 1
            })
        })
        .catch(err => {
            console.log(err);
        })
};



exports.quoteDetail = function (req, res) {
// the following code is executed *before* the query is executed
    let currentSlide = slideSelect;
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let quoteID, profilePic;

    let quoteData = [];
    let layoutData  = [];
    let sectionData = [];
    let breakerData = [];
    let fieldServiceData = [];
    let freightData = [];
    let partsLaborData = [];
    let warrantyData = [];
    let comItemData = [];
    let quoteItemData = [];
    let userItemData = [];
    let quoteControlData = [];
    let controlAsmData = [];
    let controlItemData = [];

    let dropdownOptions = [];
    let catCodeData = [];
    let sectionTypeData = [];
    let layoutTypes = [];
    let ulListings  = [];
    let systemTypes = [];
    let enclosureTypes = [];
    let accessTypes = [];
    let cableEntryTypes = [];
    let paintTypes = [];
    let systemAmpTypes = [];
    let mainBusAmpTypes = [];
    let busBracingTypes = [];
    let kaicTypes = [];
    let bussingTypes = [];
    let brkAccDropdown = [];
    let brkAccSum = [];

    let sysTypeData = {};
    let panelboardData = [];
    let mountingSpaceData = {};
    let panelboardAmpType = [];
    let basePanelCopper3W = [];
    let basePanelCopper4W = [];
    let tieCopper3W = [];
    let tieCopper4W = [];

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            for (let row of rows) {
                quoteData.push(row);
            }
            return quoteID
        })
        .then(
            async function(quoteID) {
                const userProfiles = await querySql("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id);
                const layouts =  await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_layout_table + " WHERE quoteID = ?", quoteID);
                const sections = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_section_table + " WHERE quoteID = ?", quoteID);
                const breakers = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_breaker_table + " WHERE quoteID = ?", quoteID);
                const fieldServiceItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_field_service_table + " WHERE quoteID = ?", quoteID);
                const freightItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_freight_table + " WHERE quoteID = ?", quoteID);
                const partsLaborItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_parts_labor_table + " WHERE quoteID = ?", quoteID);
                const warrantyItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_warranty_table + " WHERE quoteID = ?", quoteID);
                const catCodes =  await querySql("SELECT catCode FROM " + database + " . " + dbConfig.jobscope_codes_table);
                const sectionTypes = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_section_type);
                const comItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_common_items);
                const itemSum = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_item_table + " WHERE quoteID = ?", quoteID);
                const userItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_user_items + " WHERE quoteID = ?", quoteID);
                const controlSum = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_control_sum + " WHERE quoteID = ?", quoteID);
                const controlAsm = await querySql("SELECT * FROM " + database + "." + dbConfig.control_assemblies_table);
                const controlItem = await querySql("SELECT * FROM " + database + "." + dbConfig.control_items_table);
                const accDropdown = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_brkAcc_dropdown);
                const accSum = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_brkAcc_table + " WHERE quoteID = ?", quoteID);
                const sysTypes = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_system_type);
                const panelboardSum = await querySql("SELECT * FROM " + database + "." + dbConfig.panelboard_sum + " WHERE quoteID = ?", quoteID);
                const pbAmpType = await querySql("SELECT * FROM " + database + "." + dbConfig.panelboard_amp_type);
                const basePanCop3W = await querySql("SELECT * FROM " + database + "." + dbConfig.base_panel_copper_3W);
                const basePanCop4W = await querySql("SELECT * FROM " + database + "." + dbConfig.base_panel_copper_4W);
                const tieCop3W = await querySql("SELECT * FROM " + database + "." + dbConfig.add_Copper_Per_Panel_3WType);
                const tieCop4W = await querySql("SELECT * FROM " + database + "." + dbConfig.add_Copper_Per_Panel_4WType);

                return {userProfiles, layouts, sections, breakers, fieldServiceItems, freightItems, partsLaborItems,
                    warrantyItems, catCodes, sectionTypes, comItems, itemSum, userItems, controlSum, controlAsm,
                    controlItem, accDropdown, accSum, sysTypes, panelboardSum, pbAmpType, basePanCop3W, basePanCop4W,
                    tieCop3W, tieCop4W}
            }
        )
        .then(({userProfiles, layouts, sections, breakers, fieldServiceItems, freightItems, partsLaborItems, warrantyItems,
                   catCodes, sectionTypes, comItems, itemSum, userItems, controlSum, controlAsm, controlItem, accDropdown,
                   accSum, sysTypes, panelboardSum, pbAmpType, basePanCop3W, basePanCop4W, tieCop3W, tieCop4W}) => {
            if (userProfiles.length != 0)
                profilePic = '/public/uploads/' + userProfiles[0].profilePic;

            for (let row of layouts) {
                layoutData.push(row);
                mountingSpaceData[row.layoutNum] = {};
            }
            for (let row of sections) {
                sectionData.push(row);
                mountingSpaceData[row.layoutNum][row.sectionNum] = {
                    HJ: 0,
                    PL3: 0,
                    PL4: 0,
                    PP3: 0,
                    PP4: 0,
                    intSize: 0,
                    tie: []
                };
            }
            for (let row of breakers) {
                breakerData.push(row);
            }
            for (let row of fieldServiceItems) {
                fieldServiceData.push(row);
            }
            for (let row of freightItems) {
                freightData.push(row);
            }
            for (let row of partsLaborItems) {
                partsLaborData.push(row);
            }
            for (let row of warrantyItems) {
                warrantyData.push(row);
            }
            for (let row of catCodes) {
                //querySql("INSERT INTO " + database2 + "." + dbConfig.quotePricing_test + " SET catCode = ?", row.catCode);
                catCodeData.push(row);
            }
            for (let row of sectionTypes) {
                sectionTypeData.push(row);
            }
            for(let row of comItems){
                comItemData.push(row);
            }
            for(let row of itemSum){
                quoteItemData.push(row);
            }
            for(let row of userItems){
                userItemData.push(row);
            }
            for(let row of controlSum){
                quoteControlData.push(row);
            }
            for(let row of controlAsm){
                controlAsmData.push(row);
            }
            for(let row of controlItem){
                controlItemData.push(row);
            }
            for(let row of accDropdown){
                let accOpts = JSON.parse(row.brkAccOpt);

                brkAccDropdown.push({
                    brkAccDropdownID: row.brkAccDropdownID,
                    mfg: row.mfg,
                    prodLine: row.productLine,
                    options: accOpts
                });
            }
            for(let row of accSum){
                let accOpts = JSON.parse(row.brkAccOpt);
                brkAccSum.push({
                    brkAccID: row.brkAccID,
                    quoteID: row.quoteID,
                    layoutNum: row.layoutNum,
                    devID: row.devID,
                    productLine: row.productLine,
                    options: accOpts
                });
            }
            for(let row of sysTypes){
                let sysTypes = JSON.parse(row.systemType);
                sysTypeData = sysTypes;
            }
            for(let row of panelboardSum){
                panelboardData.push(row);
            }
            for(let row of pbAmpType){
                panelboardAmpType.push(row);
            }
            for(let row of basePanCop3W){
                basePanelCopper3W.push(row);
            }
            for(let row of basePanCop4W){
                basePanelCopper4W.push(row);
            }
            for(let row of tieCop3W){
                tieCopper3W.push(row);
            }
            for(let row of tieCop4W){
                tieCopper4W.push(row);
            }

            for(let row of sections) {
                let tieArr = [];
                let tempLayout = row.layoutNum.toString();
                let tempSec = row.sectionNum.toString();
                for (let el of breakers) {
                    if(el.secID == row.secID){
                        if(el.devProdLine.includes(' Square D/Powerpact')){
                            if((el.brkPN).charAt(0) == 'H' || (el.brkPN).charAt(0) == 'h' || (el.brkPN).charAt(0) == 'J' || (el.brkPN).charAt(0) == 'j'){
                                mountingSpaceData[tempLayout][tempSec].HJ += 1;
                                mountingSpaceData[tempLayout][tempSec].intSize += 1;
                                if(el.tie == 'Y'){
                                    tieArr.push('4X 3W');
                                }
                            }
                            if(((el.brkPN).charAt(0) == 'L' || (el.brkPN).charAt(0) == 'l') && el.devPoles == 3){
                                mountingSpaceData[tempLayout][tempSec].PL3 += 1;
                                mountingSpaceData[tempLayout][tempSec].intSize += 1;
                                if(el.tie == 'Y'){
                                    tieArr.push('5X 3W');
                                }
                            }
                            if(((el.brkPN).charAt(0) == 'L' || (el.brkPN).charAt(0) == 'l') && el.devPoles == 4){
                                mountingSpaceData[tempLayout][tempSec].PL4 += 1;
                                mountingSpaceData[tempLayout][tempSec].intSize += 1;
                                if(el.tie == 'Y'){
                                    tieArr.push('6X 4W');
                                }
                            }
                            if(((el.brkPN).charAt(0) == 'P' || (el.brkPN).charAt(0) == 'p') && el.devPoles == 3){
                                mountingSpaceData[tempLayout][tempSec].PP3 += 1;
                                mountingSpaceData[tempLayout][tempSec].intSize += 1;
                                if(el.tie == 'Y'){
                                    tieArr.push('7X 3W');
                                }
                            }
                            if(((el.brkPN).charAt(0) == 'P' || (el.brkPN).charAt(0) == 'p') && el.devPoles == 4){
                                mountingSpaceData[tempLayout][tempSec].PP4 += 1;
                                mountingSpaceData[tempLayout][tempSec].intSize += 1;
                                if(el.tie == 'Y'){
                                    tieArr.push('9X 4W');
                                }
                            }
                        }
                    }
                }
                mountingSpaceData[tempLayout][tempSec].tie = tieArr;
            }
            return null
        })
        .then(() => {
            return querySql("SELECT dropdownRestrictions -> \"$.SystemAmp\" systemAmp, dropdownRestrictions -> \"$.ULListing\" ulListing, " +
                "dropdownRestrictions -> \"$.SystemType\" systemType, dropdownRestrictions -> \"$.MainBusAmp\" mainBusAmp, " +
                "dropdownRestrictions -> \"$.BusBracing\" busBracing, dropdownRestrictions -> \"$.kAICRating\" kAICRating FROM " + database + "." + dbConfig.quote_layout_dropdown +
                " WHERE dropdownValue = 'LV Panelboard'")
        })
        .then(rows => {
            dropdownOptions.push({
                layoutType: 'LV Panelboard',
                systemAmp: JSON.parse(rows[0].systemAmp),
                ulListing: [JSON.parse(rows[0].ulListing)],
                systemType: JSON.parse(rows[0].systemType),
                mainBusAmp: JSON.parse(rows[0].mainBusAmp),
                busBracing: JSON.parse(rows[0].busBracing),
                kAICRating: JSON.parse(rows[0].kAICRating)
            });
            return querySql("SELECT dropdownRestrictions -> \"$.SystemAmp\" systemAmp, dropdownRestrictions -> \"$.ULListing\" ulListing, " +
                "dropdownRestrictions -> \"$.SystemType\" systemType, dropdownRestrictions -> \"$.MainBusAmp\" mainBusAmp, " +
                "dropdownRestrictions -> \"$.BusBracing\" busBracing, dropdownRestrictions -> \"$.kAICRating\" kAICRating FROM " + database + "." + dbConfig.quote_layout_dropdown +
                " WHERE dropdownValue = 'LV Switchboard'")
        })
        .then(rows => {
            dropdownOptions.push({
                layoutType: 'LV Switchboard',
                systemAmp: JSON.parse(rows[0].systemAmp),
                ulListing: [JSON.parse(rows[0].ulListing)],
                systemType: JSON.parse(rows[0].systemType),
                mainBusAmp: JSON.parse(rows[0].mainBusAmp),
                busBracing: JSON.parse(rows[0].busBracing),
                kAICRating: JSON.parse(rows[0].kAICRating)
            });
            //temp section until rest of layout dropdown is filled out
            dropdownOptions.push({
                layoutType: 'MV Switchgear - SAI',
                systemAmp: ['800A', '1000A', '1200A', '1600A', '2000A', '2500A', '3000A', '3200A', '4000A', '5000A', '6000A'],
                ulListing: ['UL 891', 'UL1558', 'SAI MV UL'],
                systemType: ['480Y/277V -3PH 4W', '480V -3PH 3W', '5kV -3PH 3W', '15kV -3PH 3W', '31.5kV -3PH 3W'],
                mainBusAmp: ['800A', '1000A', '1200A', '1600A', '2000A', '2500A', '3000A', '3200A', '4000A', '5000A', '6000A'],
                busBracing: ['65kA', '85kA', '100kA', '150kA', '200kA'],
                kAICRating: ['65kAIC', '85kAIC', '100kAIC', '150kAIC', '200kAIC']
            });
            dropdownOptions.push({
                layoutType: 'MV Switchgear - Buyout',
                systemAmp: ['800A', '1000A', '1200A', '1600A', '2000A', '2500A', '3000A', '3200A', '4000A', '5000A', '6000A'],
                ulListing: ['UL 891', 'UL1558', 'SAI MV UL'],
                systemType: ['480Y/277V -3PH 4W', '480V -3PH 3W', '5kV -3PH 3W', '15kV -3PH 3W', '31.5kV -3PH 3W'],
                mainBusAmp: ['800A', '1000A', '1200A', '1600A', '2000A', '2500A', '3000A', '3200A', '4000A', '5000A', '6000A'],
                busBracing: ['65kA', '85kA', '100kA', '150kA', '200kA'],
                kAICRating: ['65kAIC', '85kAIC', '100kAIC', '150kAIC', '200kAIC']
            });
            dropdownOptions.push({
                layoutType: 'Retrofit',
                systemAmp: ['800A', '1000A', '1200A', '1600A', '2000A', '2500A', '3000A', '3200A', '4000A', '5000A', '6000A'],
                ulListing: ['UL 891', 'UL1558', 'SAI MV UL'],
                systemType: ['480Y/277V -3PH 4W', '480V -3PH 3W', '5kV -3PH 3W', '15kV -3PH 3W', '31.5kV -3PH 3W'],
                mainBusAmp: ['800A', '1000A', '1200A', '1600A', '2000A', '2500A', '3000A', '3200A', '4000A', '5000A', '6000A'],
                busBracing: ['65kA', '85kA', '100kA', '150kA', '200kA'],
                kAICRating: ['65kAIC', '85kAIC', '100kAIC', '150kAIC', '200kAIC']
            });
            dropdownOptions.push({
                layoutType: 'Control Box',
                systemAmp: ['800A', '1000A', '1200A', '1600A', '2000A', '2500A', '3000A', '3200A', '4000A', '5000A', '6000A'],
                ulListing: ['UL 891', 'UL1558', 'SAI MV UL'],
                systemType: ['480Y/277V -3PH 4W', '480V -3PH 3W', '5kV -3PH 3W', '15kV -3PH 3W', '31.5kV -3PH 3W'],
                mainBusAmp: ['800A', '1000A', '1200A', '1600A', '2000A', '2500A', '3000A', '3200A', '4000A', '5000A', '6000A'],
                busBracing: ['65kA', '85kA', '100kA', '150kA', '200kA'],
                kAICRating: ['65kAIC', '85kAIC', '100kAIC', '150kAIC', '200kAIC']
            });

            return querySql("SELECT * FROM " + database + "." + dbConfig.quote_layout_dropdown)
        })
        .then(rows => {
            for (let row of rows) {
                switch (row.dropdownType) {
                    case "Layout Type":
                        layoutTypes.push(row.dropdownValue);
                        break;
                    case "UL Listing":
                        ulListings.push(row.dropdownValue);
                        break;
                    case "System Type":
                        systemTypes.push(row.dropdownValue);
                        break;
                    case "Enclosure":
                        enclosureTypes.push(row.dropdownValue);
                        break;
                    case "Access":
                        accessTypes.push(row.dropdownValue);
                        break;
                    case "Cable Entry":
                        cableEntryTypes.push(row.dropdownValue);
                        break;
                    case "Paint":
                        paintTypes.push(row.dropdownValue);
                        break;
                    case "System Amp":
                        systemAmpTypes.push(row.dropdownValue);
                        break;
                    case "Main Bus Amp":
                        mainBusAmpTypes.push(row.dropdownValue);
                        break;
                    case "Bus Bracing":
                        busBracingTypes.push(row.dropdownValue);
                        break;
                    case "kAIC Rating":
                        kaicTypes.push(row.dropdownValue);
                        break;
                    case "Bussing Type":
                        bussingTypes.push(row.dropdownValue);
                        break;
                }
            }
            return null;
        })
        .then(() => {
            res.locals = {title: 'New Quote'};
            res.render('AppsEng/quoteDetail', {
                quoteData: quoteData,
                catCodeData: catCodeData,
                layoutData: layoutData,
                sectionData: sectionData,
                deviceData: breakerData,
                fieldServiceData: fieldServiceData,
                freightData: freightData,
                sectionType: sectionTypeData,
                partsLaborData: partsLaborData,
                warrantyData: warrantyData,
                profilePic: profilePic,
                currentSlide: currentSlide,
                layoutTypes: layoutTypes,
                ulListings: ulListings,
                systemTypes: systemTypes,
                enclosureTypes: enclosureTypes,
                accessTypes: accessTypes,
                cableEntryTypes: cableEntryTypes,
                paintTypes: paintTypes,
                systemAmpTypes: systemAmpTypes,
                mainBusAmpTypes: mainBusAmpTypes,
                busBracingTypes: busBracingTypes,
                kaicTypes: kaicTypes,
                bussingTypes: bussingTypes,
                dropdownOptions: dropdownOptions,
                comItemData: comItemData,
                userItemData: userItemData,
                quoteItemData: quoteItemData,
                quoteControlData: quoteControlData,
                controlItemData: controlItemData,
                controlAsmData: controlAsmData,
                brkAccDropdown: brkAccDropdown,
                brkAccSum: brkAccSum,
                sysTypeData: sysTypeData,
                panelboardData: panelboardData,
                mountingSpaceData: mountingSpaceData,
                panelboardAmpType: panelboardAmpType,
                basePanelCopper3W: basePanelCopper3W,
                basePanelCopper4W: basePanelCopper4W,
                tieCopper3W: tieCopper3W,
                tieCopper4W: tieCopper4W
            });
        })
        .catch((err) => {
            return Promise.reject(err);
        })
};










exports.addLayout = function(req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let jobNumReleaseNum = qs.subID.split('_')[0];
    let subID = qs.subID.split('_')[1];
    let checkArray = [];
    let reqChecks = [req.body.insulatedBus, req.body.boots, req.body.seismic, req.body.mimic, req.body.IR, req.body.wireway, req.body.trolley];
    for (let i = 0; i < reqChecks.length; i++) {
        if(reqChecks[i]) {
            checkArray.push("Y");
        } else {
            checkArray.push("N");
        }
    }
    let newLayoutData = {
        subID: subID,
        layoutName: req.body.layoutName,
        ulListing: req.body.ulListing,
        systemType: req.body.systemType,
        systemAmp: req.body.systemAmp,
        mainBusAmp: req.body.mainBusAmp,
        enclosure: req.body.enclosure,
        accessibility: req.body.accessibility,
        cableAccess: req.body.cableAccess,
        paint: req.body.paint,
        interruptRating: req.body.interruptRating,
        busBracing: req.body.busBracing,
        busType: req.body.busType,
        insulatedBus: checkArray[0],
        boots: checkArray[1],
        iccbPlatform: req.body.iccbPlatform,
        mccbPlatform: req.body.mccbPlatform,
        keyInterlocks: req.body.keyInterlocks,
        seismic: checkArray[2],
        mimic: checkArray[3],
        ir: checkArray[4],
        wireway: checkArray[5],
        trolley: checkArray[6],
        numSections: 0
    };

    async function createLayout(layoutData) {
        return await querySql("INSERT INTO " + database + "." + dbConfig.submittal_layout_table + " SET ?", layoutData);
    }

    createLayout(newLayoutData)
        .then(() => {
            res.redirect('../searchSubmittal/?subID='+jobNumReleaseNum+"_"+subID);
        })
        .catch(err => {
            console.log(err);
        });
};