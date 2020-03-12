
//*********************************APPLICATION ENG. PORTAL*************************************//
exports = {};
module.exports = exports;

let queryString = require('query-string');
let url = require('url');

//DATABASE INFORMATION (TABLE NAMES)
let dbConfig = require('../config/database.js');
let database = dbConfig.database;

//DATABASE INFORMATION (CONNECTION POOL)
let DB = require('../config/db.js');
let querySql = DB.querySql;
let Promise = require('bluebird');


//New Quote GET request
exports.newQuote = function(req, res) {
    let quoteData = [];
    let profilePic;
    let message;
    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table)
        .then(rows => {
            for (let row of rows) {
                quoteData.push(row);
            }
            return querySql("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            if (rows.length != 0)
                profilePic = '/public/uploads/' + rows[0].profilePic;
            return null
        })
        .then(() => {
            res.locals = {title: 'New Quote'};
            res.render('AppsEng/newQuote', {
                quoteData: quoteData,
                profilePic: profilePic,
                message: message
            });
        })
        .catch((err) => {
            return Promise.reject(err);
        })
};

//Add Quote POST request
exports.addQuote = function (req, res) {
    //Getting Users Name
    let email = req.user.email;
    let firstName = email.split('.')[0];
    let lastName = email.substring(email.indexOf('.') + 1, email.indexOf("@"));
    let usersFullName = firstName + ' ' + lastName;
    let data = {
        quoteNum: req.body.quoteNum[0],
        revNum: '00',
        projName: (req.body.projName).toUpperCase(),
        customer: (req.body.customer).toUpperCase(),
        rep: (req.body.rep).toUpperCase(),
        quoteNotes: req.body.quoteNotes,
        createdBy: usersFullName.toUpperCase()
    };

    let message;
    let profilePic;

    querySql("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id)
        .then(rows => {
            if (rows.length != 0)
                profilePic = '/public/uploads/' + rows[0].profilePic;

            return querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table)
        })
        .then(rows => {
            for (let row of rows) {
                if (row.quoteNum == data.quoteNum && row.revNum == data.revNum) {

                    message = 'Quote and Rev Number already exist';
                    res.locals = {title: 'Quote Detail'};
                    res.render('AppsEng/newQuote', {
                        quoteData: rows,
                        profilePic: profilePic,
                        message: message
                    });
                    throw new Error('QuoteNum and RevNum already exist');
                }
            }
            querySql("INSERT INTO " + database + "." + dbConfig.quote_summary_table + " set ?", data);
            return null
        })
        .then(() => {
            res.locals = {title: 'Quote Detail'};
            res.redirect('quoteDetail/?quoteID='+data.quoteNum+'_'+data.revNum);
            return null

        })
        .catch((err) => {
            return Promise.reject(err);
        });
};


//Edit Quote POST request
exports.editQuote = function (req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let data = {
        projName: (req.body.projName).toUpperCase(),
        customer: (req.body.customer).toUpperCase(),
        rep: (req.body.rep).toUpperCase()
    };
    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            let quoteID = rows[0].quoteID;
            return querySql("UPDATE " + database + "." + dbConfig.quote_summary_table + " SET projName = ?, customer = ?, rep = ? WHERE quoteID = ?", [data.projName, data.customer, data.rep, quoteID])
        })
        .then(() => {
            res.locals = {title: 'Quote Detail'};
            res.redirect('../quoteDetail/?quoteID='+quoteNum+'_'+revNum);
        })
        .catch((err) => {
            return Promise.reject(err);
        })
};


let slideSelect = 1;

//Selected Slide POST request
exports.selectedSlide = function(req, res) {
    slideSelect = parseInt(req.body.slideSelect) + 1;
    let quoteNum = req.body.quoteNum;
    let revNum = req.body.revNum;
    res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
};

//Quote Detail GET request
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
                return {userProfiles, layouts, sections, breakers, fieldServiceItems, freightItems, partsLaborItems, warrantyItems, catCodes, sectionTypes}
            }
        )
        .then(({userProfiles, layouts, sections, breakers, fieldServiceItems, freightItems, partsLaborItems, warrantyItems, catCodes, sectionTypes}) => {

            if (userProfiles.length != 0)
                profilePic = '/public/uploads/' + userProfiles.profilePic;

            for (let row of layouts) {
                layoutData.push(row);
            }
            for (let row of sections) {
                sectionData.push(row);
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
                catCodeData.push(row);
            }
            for (let row of sectionTypes) {
                sectionTypeData.push(row);
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
                dropdownOptions: dropdownOptions
            });
        })
        .catch((err) => {
            return Promise.reject(err);
        })
};


//Add Layout POST request
exports.quoteAddLayout = function (req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let checkArray = [];
    let reqChecks = [req.body.seismic, req.body.mimic, req.body.IR, req.body.wireway, req.body.trolley];
    for (let i = 0; i < reqChecks.length; i++) {
        if(reqChecks[i]) {
            checkArray.push("Y");
        } else {
            checkArray.push("N");
        }
    }
    let quoteID, layoutNum, data, newNum;

    data = {
        layoutName: (req.body.layoutName).toUpperCase(),
        layoutType: req.body.layoutType,
        numSections: 0,
        layoutUL: req.body.layoutUL,
        layoutEnclosure: req.body.layoutEnclosure,
        layoutAccess: req.body.layoutAccess,
        layoutPaint: req.body.layoutPaint,
        layoutBusType: req.body.layoutBusType,
        layoutCabEntry: req.body.layoutCabEntry,
        layoutSystem: req.body.layoutSystem,
        systemAmp: req.body.layoutSystemAmp,
        mainBusAmp: req.body.layoutMainBusAmp,
        busBracing: req.body.layoutBusBracing,
        interuptRating: req.body.layoutkAICRating,
        seismicCheck: checkArray[0],
        mimicCheck: checkArray[1],
        IRCheck: checkArray[2],
        wirewayCheck: checkArray[3],
        trolleyCheck: checkArray[4]
    };

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteNum = ? AND revNum = ?", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            data.quoteID = quoteID;
            return quoteID
        })
        .then(
            async function(quoteID) {
                const layouts =  await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_layout_table + " WHERE quoteID = ?", quoteID);
                const partsLaborItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_parts_labor_table + " WHERE quoteID = ?", quoteID);
                const fieldServiceItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_field_service_table + " WHERE quoteID = ?", quoteID);
                const freightItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_freight_table + " WHERE quoteID = ?", quoteID);
                const warrantyItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_warranty_table + " WHERE quoteID = ?", quoteID);
                return {layouts, partsLaborItems, fieldServiceItems, freightItems,  warrantyItems}
            }
        )
        .then(({layouts, partsLaborItems, fieldServiceItems, freightItems, warrantyItems}) => {
            layoutNum = layouts.length + 1;

            data.layoutNum = layoutNum;

            for (let row of partsLaborItems) {
                newNum = parseInt(row.partsLaborNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_parts_labor_table + " SET partsLaborNum = ? WHERE quoteID = ? AND partsLaborID = ?", [newNum, quoteID, row.partsLaborID]);
            }

            for (let row of fieldServiceItems) {
                newNum = parseInt(row.fieldServiceNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_field_service_table + " SET fieldServiceNum = ? WHERE quoteID = ? AND fieldServiceID = ?", [newNum, quoteID, row.fieldServiceID]);
            }
            for (let row of freightItems) {
                newNum = parseInt(row.freightNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_freight_table + " SET freightNum = ? WHERE quoteID = ? AND freightID = ?", [newNum, quoteID, row.freightID]);
            }
            for (let row of warrantyItems) {
                newNum = parseInt(row.warrantyNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_warranty_table + " SET warrantyNum = ? WHERE quoteID = ? AND warrantyID = ?", [newNum, quoteID, row.warrantyID]);
            }
            return null
        })
        .then(
            async function(){
                await querySql("INSERT INTO " + database + "." + dbConfig.quote_layout_table + " SET ?", data);
                return null;
        })
        .then(() => {
            res.locals = {title: 'New Quote'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Edit Layout POST request
exports.quoteEditLayout = function (req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let layoutNum = qs.layoutNum;
    let quoteID, data;
    let checkArray = [];
    let reqChecks = [req.body.seismic, req.body.mimic, req.body.IR, req.body.wireway, req.body.trolley];
    for (let i = 0; i < reqChecks.length; i++) {
        if(reqChecks[i]) {
            checkArray.push("Y");
        } else {
            checkArray.push("N");
        }
    }
    let updateData = {
        layoutName: (req.body.layoutName).toUpperCase(),
        layoutType: req.body.editLayoutType,
        layoutUL: req.body.editLayoutUL,
        layoutEnclosure: req.body.layoutEnclosure,
        layoutAccess: req.body.layoutAccess,
        layoutPaint: req.body.layoutPaint,
        layoutBusType: req.body.layoutBusType,
        layoutCabEntry: req.body.layoutCabEntry,
        layoutSystem: req.body.editLayoutSystem,
        systemAmp: req.body.editLayoutSystemAmp,
        mainBusAmp: req.body.editLayoutMainBusAmp,
        busBracing: req.body.editLayoutBusBracing,
        interuptRating: req.body.editLayoutkAICRating,
        seismicCheck: checkArray[0],
        mimicCheck: checkArray[1],
        IRCheck: checkArray[2],
        wirewayCheck: checkArray[3],
        trolleyCheck: checkArray[4]
    };
    data = {
        layoutNum: layoutNum
    };

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            data.quoteID = quoteID;

            querySql("UPDATE " + database + "." + dbConfig.quote_layout_table + " SET " +
                "layoutName = ?, layoutType = ?, layoutUL = ?, layoutEnclosure = ?, layoutAccess = ?, " +
                "layoutPaint = ?, layoutBusType = ?, layoutCabEntry = ?, layoutSystem = ?, systemAmp = ?, " +
                "mainBusAmp = ?, busBracing = ?, interuptRating = ?, seismicCheck = ?, mimicCheck = ?, " +
                "IRCheck = ?, wirewayCheck = ?, trolleyCheck = ? WHERE quoteID = ? AND layoutNum = ?",
                [updateData.layoutName, updateData.layoutType, updateData.layoutUL, updateData.layoutEnclosure,
                    updateData.layoutAccess, updateData.layoutPaint, updateData.layoutBusType, updateData.layoutCabEntry,
                    updateData.layoutSystem, updateData.systemAmp, updateData.mainBusAmp, updateData.busBracing,
                    updateData.interuptRating, updateData.seismicCheck, updateData.mimicCheck, updateData.IRCheck,
                    updateData.wirewayCheck, updateData.trolleyCheck, data.quoteID, data.layoutNum]);
            return null;
        })
        .then(() => {
            res.locals = {title: 'New Quote'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        })
        .catch((err) => {
            return Promise.reject(err);
        })
};

//Add Parts and Labor POST request
exports.quoteAddPartsLabor = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let partsLaborNum = 0;
    let title = req.body.partsLaborTitle;

    let quoteID, data, newNum;

    data = {
        title: title.toUpperCase()
    };

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            data.quoteID = quoteID;
            return quoteID
        })
        .then(
            async function(quoteID) {
                const layouts =  await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_layout_table + " WHERE quoteID = ?", quoteID);
                const partsLaborItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_parts_labor_table + " WHERE quoteID = ?", quoteID);
                const fieldServiceItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_field_service_table + " WHERE quoteID = ?", quoteID);
                const freightItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_freight_table + " WHERE quoteID = ?", quoteID);
                const warrantyItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_warranty_table + " WHERE quoteID = ?", quoteID);
                return {layouts, partsLaborItems, fieldServiceItems, freightItems, warrantyItems}
            }
        )
        .then(({layouts, partsLaborItems, fieldServiceItems, freightItems, warrantyItems}) => {
            partsLaborNum += layouts.length + partsLaborItems.length;
            for (let row of fieldServiceItems) {
                newNum = parseInt(row.fieldServiceNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_field_service_table + " SET fieldServiceNum = ? WHERE quoteID = ? AND fieldServiceID = ?", [newNum, quoteID, row.fieldServiceID]);
            }
            for (let row of freightItems) {
                newNum = parseInt(row.freightNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_freight_table + " SET freightNum = ? WHERE quoteID = ? AND freightID = ?", [newNum, quoteID, row.freightID]);
            }
            for (let row of warrantyItems) {
                newNum = parseInt(row.warrantyNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_warranty_table + " SET warrantyNum = ? WHERE quoteID = ? AND warrantyID = ?", [newNum, quoteID, row.warrantyID]);
            }
            return null
        })
        .then(
            async function(){
                data.partsLaborNum = partsLaborNum;
                await querySql("INSERT INTO " + database + "." + dbConfig.quote_parts_labor_table + " SET ? ", data);
                return null;
        })
        .then(() => {
            res.locals = {title: 'Add Parts and Labor'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};



//Add Field Service POST request
exports.quoteAddFieldService = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let fieldServiceNum = 0;

    let data = [];
    let flyingCheck, airfare, parkingExpense, rentalCarExpense, drivingCheck, numOfMiles, carMileage, holidayHours, overtimeHours, regularHours;

    if (req.body.flyOrDrive == 'fly') {
        flyingCheck = "Y";
        airfare = req.body.airfare;
        parkingExpense = req.body.parkingExpense;
        rentalCarExpense = req.body.rentalCarExpense;

        drivingCheck = "N";
        numOfMiles = null;
        carMileage = null;
    } else {
        drivingCheck = "Y";
        numOfMiles = req.body.numOfMiles;
        carMileage = req.body.carMileage;

        flyingCheck = "N";
        airfare = null;
        parkingExpense = null;
        rentalCarExpense = null;
    }

    if(req.body.fieldLaborSelect == 'regular') {
        regularHours = req.body.fieldLaborInput;
    } else if(req.body.fieldLaborSelect == 'overtime') {
        overtimeHours = req.body.fieldLaborInput;
    } else {
        holidayHours = req.body.fieldLaborInput;
    }

    let quoteID, newNum;

    data = {
        title: (req.body.fieldServiceTitle).toUpperCase(),
        technicians: req.body.technicians,
        numberOfTrips: req.body.numberOfTrips,
        travelLaborDays: req.body.travelLaborDays,
        regularTimeDays: regularHours,
        overtimeDays: overtimeHours,
        holidaysTimeDays: holidayHours,
        mealExpense: req.body.mealExpense,
        hotelExpense: req.body.hotelExpense,
        flying: flyingCheck,
        airfare: airfare,
        parkingExpense: parkingExpense,
        rentalCarExpense: rentalCarExpense,
        driving: drivingCheck,
        numberOfMiles: numOfMiles,
        carMileageCost: carMileage,
        remarks: req.body.fieldServiceRemarks,
        total: null
    };

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            data.quoteID = quoteID;

            return quoteID
        })
        .then(
            async function(quoteID) {
                const layouts =  await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_layout_table + " WHERE quoteID = ?", quoteID);
                const partsLaborItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_parts_labor_table + " WHERE quoteID = ?", quoteID);
                const fieldServiceItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_field_service_table + " WHERE quoteID = ?", quoteID);
                const freightItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_freight_table + " WHERE quoteID = ?", quoteID);
                const warrantyItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_warranty_table + " WHERE quoteID = ?", quoteID);
                return {layouts, partsLaborItems, fieldServiceItems, freightItems, warrantyItems}
            }
        )
        .then(({layouts, partsLaborItems, fieldServiceItems, freightItems, warrantyItems}) => {
            fieldServiceNum += layouts.length + partsLaborItems.length + fieldServiceItems.length;
            data.fieldServiceNum = fieldServiceNum + 1;
            for (let i = 0; i < data.length; i++) {
                if (data[i] == '') {
                    data[i] = null;
                }
            }
            for (let row of freightItems) {
                newNum = parseInt(row.freightNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_freight_table + " SET freightNum = ? WHERE quoteID = ? AND freightID = ?", [newNum, quoteID, row.freightID]);
            }
            for (let row of warrantyItems) {
                newNum = parseInt(row.warrantyNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_warranty_table + " SET warrantyNum = ? WHERE quoteID = ? AND warrantyID = ?", [newNum, quoteID, row.warrantyID]);
            }
            return null
        })
        .then(
            async function(){
                await querySql("INSERT INTO " + database + "." + dbConfig.quote_field_service_table + " SET ?", data);
                return null;
        })
        .then(() => {
            res.locals = {title: 'Add Field Service'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
            return null;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};


//Edit Field Service POST request
exports.quoteEditFieldService = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let fieldServiceNum = qs.fieldServiceNum;

    let updateData = [];
    let flyingCheck, airfare, parkingExpense, rentalCarExpense, drivingCheck, numOfMiles, carMileage, holidayHours, overtimeHours, regularHours;

    if (req.body.editFlyOrDrive == 'fly') {
        flyingCheck = "Y";
        airfare = req.body.editAirfare;
        parkingExpense = req.body.editParkingExpense;
        rentalCarExpense = req.body.editRentalCarExpense;

        drivingCheck = "N";
        numOfMiles = null;
        carMileage = null;
    } else {
        drivingCheck = "Y";
        numOfMiles = req.body.editNumOfMiles;
        carMileage = req.body.editCarMileage;

        flyingCheck = "N";
        airfare = null;
        parkingExpense = null;
        rentalCarExpense = null;
    }

    if(req.body.editFieldLaborSelect == 'regular'){
        regularHours = req.body.editFieldLaborInput;
    }else if(req.body.editFieldLaborSelect == 'overtime'){
        overtimeHours = req.body.editFieldLaborInput;
    }else{
        holidayHours = req.body.editFieldLaborInput;
    }

    let quoteID;

    updateData = {
        fieldServiceNum: fieldServiceNum,
        title: (req.body.editFieldServiceTitle).toUpperCase(),
        technicians: req.body.editTechnicians,
        numberOfTrips: req.body.editNumberOfTrips,
        travelLaborDays: req.body.editTravelLaborDays,
        regularTimeDays: regularHours,
        overTimeDays: overtimeHours,
        holidaysTimeDays: holidayHours,
        mealExpense: req.body.editMealExpense,
        hotelExpense: req.body.editHotelExpense,
        flying: flyingCheck,
        airfare: airfare,
        parkingExpense: parkingExpense,
        rentalCarExpense: rentalCarExpense,
        driving: drivingCheck,
        numberOfMiles: numOfMiles,
        carMileageCost: carMileage,
        remarks: req.body.editFieldServiceRemarks,
        total: null
    };

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            updateData.quoteID = quoteID;
            querySql("UPDATE " + database + "." + dbConfig.quote_field_service_table + " SET ? WHERE quoteID = ? AND fieldServiceNum = ?",
                [updateData, updateData.quoteID, updateData.fieldServiceNum]);
            return null
        })
        .then(() => {
            res.locals = {title: 'Edit Field Service'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
            return null
        })
        .catch((err) => {
        return Promise.reject(err);
    });
};


//Add Freight POST request
exports.quoteAddFreight = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let freightNum = 0;

    let standardCheck, flatbedCheck, stepDeckCheck, surroundingStatesCheck, eastCoastCheck, westCoastCheck, truckCostOverrideCheck, totalOverrideCheck;
    if (req.body.truckType == 'standard') {
        standardCheck = "Y";
        flatbedCheck = "N";
        stepDeckCheck = "N";
    } else if (req.body.truckType == 'flatbed') {
        flatbedCheck = "Y";
        standardCheck = "N";
        stepDeckCheck = "N";
    } else {
        stepDeckCheck = "Y";
        standardCheck = "N";
        flatbedCheck = "N";
    }

    if (req.body.destinationType == 'surroundingStates') {
        surroundingStatesCheck = "Y";
        eastCoastCheck = "N";
        westCoastCheck = "N";
    } else if (req.body.destinationType == 'eastCoast') {
        eastCoastCheck = "Y";
        surroundingStatesCheck = "N";
        westCoastCheck = "N";
    } else {
        westCoastCheck = "Y";
        surroundingStatesCheck = "N";
        eastCoastCheck = "N";
    }

    if (req.body.overrideCost) {
        truckCostOverrideCheck = "Y";
    } else {
        truckCostOverrideCheck = "N";
    }

    if (req.body.overrideTotal) {
        totalOverrideCheck = "Y";
    } else {
        totalOverrideCheck = "N";
    }

    let quoteID, data, newNum;

    data = {
        title: (req.body.freightTitle).toUpperCase(),
        standardTruck: standardCheck,
        flatbedTruck: flatbedCheck,
        stepDeckTruck: stepDeckCheck,
        height: req.body.height,
        width: req.body.width,
        depth: req.body.depth,
        weight: req.body.weight,
        surroundingStates: surroundingStatesCheck,
        eastCoast: eastCoastCheck,
        westCoast: westCoastCheck,
        truckCost: req.body.estimateCostOfTruck,
        truckCostOverride: truckCostOverrideCheck,
        numOfTrucks: req.body.numOfTruck,
        remarks: req.body.freightRemarks,
        total: req.body.freightTotal,
        totalOverride: totalOverrideCheck
    };

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            data.quoteID = quoteID;
            return quoteID
        })
        .then(
            async function(quoteID) {
                const layouts =  await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_layout_table + " WHERE quoteID = ?", quoteID);
                const partsLaborItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_parts_labor_table + " WHERE quoteID = ?", quoteID);
                const fieldServiceItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_field_service_table + " WHERE quoteID = ?", quoteID);
                const freightItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_freight_table + " WHERE quoteID = ?", quoteID);
                const warrantyItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_warranty_table + " WHERE quoteID = ?", quoteID);
                return {layouts, partsLaborItems, fieldServiceItems, freightItems, warrantyItems}
            }
        )
        .then(({layouts, partsLaborItems, fieldServiceItems, freightItems, warrantyItems}) => {
            freightNum += layouts.length + partsLaborItems.length + fieldServiceItems.length + freightItems.length;
            data.freightNum = freightNum + 1;
            for (let i = 0; i < data.length; i++) {
                if (data[i] == '') {
                    data[i] = null;
                }
            }
            for (let row of warrantyItems) {
                newNum = parseInt(row.warrantyNum) + 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_warranty_table + " SET warrantyNum = ? WHERE quoteID = ? AND warrantyID = ?", [newNum, quoteID, row.warrantyID]);
            }
            return null
        })
        .then(
            async function(){
                await querySql("INSERT INTO " + database + "." + dbConfig.quote_freight_table + " SET ?", data);
                return null;
        })
        .then(() => {
            res.locals = {title: 'Add Freight'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
            return null
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Edit Freight POST request
exports.quoteEditFreight = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let freightNum = qs.freightNum;

    let standardCheck, flatbedCheck, stepDeckCheck, surroundingStatesCheck, eastCoastCheck, westCoastCheck, truckCostOverrideCheck, totalOverrideCheck;
    if(req.body.editTruckType == 'standard'){
        standardCheck = "Y";
        flatbedCheck = "N";
        stepDeckCheck = "N";
    }else if (req.body.editTruckType == 'flatbed'){
        flatbedCheck = "Y";
        standardCheck = "N";
        stepDeckCheck = "N";
    }else{
        stepDeckCheck = "Y";
        standardCheck = "N";
        flatbedCheck = "N";
    }

    if(req.body.editDestinationType == 'surroundingStates'){
        surroundingStatesCheck = "Y";
        eastCoastCheck = "N";
        westCoastCheck = "N";
    } else if(req.body.editDestinationType == 'eastCoast'){
        eastCoastCheck = "Y";
        surroundingStatesCheck = "N";
        westCoastCheck = "N";
    } else{
        westCoastCheck = "Y";
        surroundingStatesCheck = "N";
        eastCoastCheck = "N";
    }

    if(req.body.editOverrideCost){
        truckCostOverrideCheck = "Y";
    } else {
        truckCostOverrideCheck = "N";
    }
    if(req.body.editOverrideTotal){
        totalOverrideCheck = "Y";
    } else {
        totalOverrideCheck = "N";
    }

    let quoteID, updateData;

    updateData = {
        title: (req.body.editFreightTitle).toUpperCase(),
        freightNum: freightNum,
        standardTruck: standardCheck,
        flatbedTruck: flatbedCheck,
        stepDeckTruck: stepDeckCheck,
        height: req.body.editHeight,
        width: req.body.editWidth,
        depth: req.body.editDepth,
        weight: req.body.editWeight,
        surroundingStates: surroundingStatesCheck,
        eastCoast: eastCoastCheck,
        westCoast: westCoastCheck,
        truckCost: req.body.editEstimateCostOfTruck,
        truckCostOverride: truckCostOverrideCheck,
        numOfTrucks: req.body.editNumOfTruck,
        remarks: req.body.editFreightRemarks,
        total: req.body.editFreightTotal,
        totalOverride: totalOverrideCheck
    };

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            updateData.quoteID = quoteID;

            querySql("UPDATE " + database + "." + dbConfig.quote_freight_table + " SET ? WHERE quoteID = ? AND freightNum = ?",
                [updateData, updateData.quoteID, updateData.freightNum]);

            return null
        })
        .then(() => {
            res.locals = {title: 'Edit Freight'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Add Warranty POST request
exports.quoteAddWarranty = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let warrantyNum = 0;

    let title = req.body.warrantyTitle;

    let quoteID, data;

    data = {
        title: title.toUpperCase()
    };

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            data.quoteID = quoteID;
            return quoteID
        })
        .then(
            async function(quoteID) {
                const layouts =  await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_layout_table + " WHERE quoteID = ?", quoteID);
                const partsLaborItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_parts_labor_table + " WHERE quoteID = ?", quoteID);
                const fieldServiceItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_field_service_table + " WHERE quoteID = ?", quoteID);
                const freightItems = await querySql("SELECT * FROM " + database + " . " + dbConfig.quote_freight_table + " WHERE quoteID = ?", quoteID);
                const warrantyItems = await querySql("SELECT * FROM " + database + "." + dbConfig.quote_warranty_table + " WHERE quoteID = ?", quoteID);
                return {layouts, partsLaborItems, fieldServiceItems, freightItems, warrantyItems}
            }
        )
        .then(({layouts, partsLaborItems, fieldServiceItems, freightItems, warrantyItems}) => {
            warrantyNum += layouts.length + partsLaborItems.length + fieldServiceItems.length + freightItems.length + warrantyItems.length;
            data.warrantyNum = warrantyNum + 1;
            for (let i = 0; i < data.length; i++) {
                if (data[i] == '') {
                    data[i] = null;
                }
            }
            return null
        })
        .then(
            async function(){
                await querySql("INSERT INTO " + database + "." + dbConfig.quote_warranty_table + " SET ?", data);
                return null;
        })
        .then(() => {
            res.locals = {title: 'Add Warranty'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Delete Board POST request
exports.quoteDeleteLayout = function(req, res) {
    if (slideSelect > 1) {
        slideSelect -= 1;
    } else {
        slideSelect = 1;
    }
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let layoutNum = parseInt(qs.layoutNum);

    let quoteID, newLayoutNum, newNum;

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            return quoteID
        })
        .then(
            async function(quoteID) {
                const layouts =  await querySql("SELECT * FROM " + database + "." + dbConfig.quote_layout_table + " WHERE quoteID = ?", quoteID);
                const partsLaborNum = await querySql("SELECT partsLaborNum FROM " + database + "." + dbConfig.quote_parts_labor_table + " WHERE quoteID = ?", quoteID);
                const fieldServiceNum = await querySql("SELECT fieldServiceNum FROM " + database + "." + dbConfig.quote_field_service_table + " WHERE quoteID = ?", quoteID);
                const freightNum = await querySql("SELECT freightNum FROM " + database + "." + dbConfig.quote_freight_table + " WHERE quoteID = ?", quoteID);
                const warrantyNum = await querySql("SELECT warrantyNum FROM " + database + "." + dbConfig.quote_warranty_table + " WHERE quoteID = ?", quoteID);

                return {layouts, partsLaborNum, fieldServiceNum, freightNum, warrantyNum}
            }
        )
        .then(({layouts, partsLaborNum, fieldServiceNum, freightNum, warrantyNum}) => {
            newLayoutNum = layouts.length - 1;
            querySql("DELETE FROM " + database + "." + dbConfig.quote_layout_table + " WHERE quoteID = ? AND layoutNum = ? ", [quoteID, layoutNum]);

            for (let i = (layoutNum + 1); i <= (newLayoutNum + 1); i++) {
                querySql("UPDATE " + database + " . " + dbConfig.quote_layout_table + " SET layoutNum = ? WHERE quoteID = ? AND layoutNum = ?", [i - 1, quoteID, i]);
            }

            for (let row of partsLaborNum) {
                newNum = parseInt(row.partsLaborNum) - 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_parts_labor_table + " SET partsLaborNum = ? WHERE quoteID = ?", [newNum, quoteID])
            }

            for (let row of fieldServiceNum) {
                newNum = parseInt(row.fieldServiceNum) - 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_field_service_table + " SET fieldServiceNum = ? WHERE quoteID = ?", [newNum, quoteID])
            }

            for (let row of freightNum) {
                newNum = parseInt(row.freightNum) - 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_freight_table + " SET freightNum = ? WHERE quoteID = ?", [newNum, quoteID]);
            }

            for (let row of warrantyNum) {
                newNum = parseInt(row.warrantyNum) - 1;
                querySql("UPDATE " + database + " . " + dbConfig.quote_warranty_table + " SET warrantyNum = ? WHERE quoteID = ?", [newNum, quoteID]);
            }

            return null
        })
        .then(() => {
            //Delete and Update quoteSectionSum
            querySql("DELETE FROM " + database + "." + dbConfig.quote_section_table + " WHERE quoteID = ? AND layoutNum = ? ", [quoteID, layoutNum]);
            for (let i = (layoutNum + 1); i <= (newLayoutNum + 1); i++) {
                querySql("UPDATE " + database + " . " + dbConfig.quote_section_table + " SET layoutNum = ? WHERE quoteID = ? AND layoutNum = ?", [i - 1, quoteID, i]);
            }

            //Delete and Update quoteBrkSum
            querySql("DELETE FROM " + database + "." + dbConfig.quote_breaker_table + " WHERE quoteID = ? AND layoutNum = ? ", [quoteID, layoutNum]);
            for (let i = (layoutNum + 1); i <= (newLayoutNum + 1); i++) {
                querySql("UPDATE " + database + " . " + dbConfig.quote_breaker_table + " SET layoutNum = ? WHERE quoteID = ? AND layoutNum = ?", [i - 1, quoteID, i]);
            }
            return null
        })
        .then(() => {
            res.locals = {title: 'Delete Layout'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
            return null
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Copy Layout POST request -- NEED TO MAKE FORM AND SUBMIT
exports.quoteCopyLayout = function (req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let data1 = [];
    let data2 = [];
    let insertNum, insertData;

    querySql("SELECT idLayout FROM " + database + "." + dbConfig.quote_layout_table + " WHERE quoteNum = ?", qs.quote)
        .then(rows => {
            for (let row of rows) {
                data1.push(row);
            }
            insertNum = "00" + (data1[data1.length - 1].idLayout + 1);

            return querySql("SELECT * FROM " + database + "." + dbConfig.quote_layout_table + " WHERE quoteNum = ? AND layoutNum = ?", [qs.quote, qs.layout])
        })
        .then(rows => {
            for (let row of rows) {
                data2.push(row);
            }
            insertData = {
                quoteNum: data2[0].quoteNum,
                layoutNum: insertNum,
                layoutName: data2[0].layoutName,
                numSections: data2[0].numSections,
                layoutType: data2[0].layoutType,
                layoutUL: data2[0].layoutUL,
                layoutEnclosure: data2[0].layoutEnclosure,
                layoutAccess: data2[0].layoutAccess,
                layoutPaint: data2[0].layoutPaint,
                layoutBusType: data2[0].layoutBusType,
                layoutCabEntry: data2[0].layoutCabEntry,
                layoutSystem: data2[0].layoutSystem,
                systemAmp: data2[0].systemAmp,
                mainBusAmp: data2[0].mainBusAmp,
                busBracing: data2[0].busBracing,
                interuptRating: data2[0].interuptRating,
                seismicCheck: data2[0].seismicCheck,
                mimicCheck: data2[0].mimicCheck,
                IRCheck: data2[0].IRCheck,
                wirewayCheck: data2[0].wirewayCheck,
                trolleyCheck: data2[0].trolleyCheck
            };

            querySql("INSERT INTO " + database + "." + dbConfig.quote_layout_table + " set ?", insertData);

            res.locals = {title: 'Quote Detail'};
            res.redirect('../quoteDetail/?quote=' + insertData.quoteNum);
            return null;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Add Section
exports.quoteAddSection = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let layoutNum = qs.layoutNum;
    let quoteID, layoutID, numSections;

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteNum = ? AND revNum = ?", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            return querySql("SELECT * FROM " + database + "." + dbConfig.quote_layout_table + " WHERE (quoteID, layoutNum) = (?,?)", [quoteID,layoutNum])
        })
        .then(rows => {
            layoutID = rows[0].layoutID;
            numSections = rows[0].numSections;
            if (numSections == null)
                numSections = 1;
            else
                numSections += 1;
            querySql("UPDATE " + database + "." + dbConfig.quote_layout_table + " SET numSections = ? WHERE layoutID = ? ", [numSections, layoutID]);
            querySql("INSERT INTO " + database + "." + dbConfig.quote_section_table + " SET quoteID = ?, layoutNum = ?, sectionNum = ? ", [quoteID, layoutNum, numSections]);
            return null
        })
        .then(() => {
            res.locals = {title: 'Add Section'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
            return null
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Delete Section
exports.quoteDeleteSection = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let layoutNum = qs.layoutNum;
    let quoteID, layoutID, numSections;
    let selectedSection = qs.selectedSection;

    querySql("SELECT * FROM "+ database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            return querySql("SELECT * FROM " + database + "." + dbConfig.quote_layout_table + " WHERE (quoteID, layoutNum) = (?,?)", [quoteID, layoutNum])
        })
        .then(rows => {
            layoutID = rows[0].layoutID;
            numSections = rows[0].numSections - 1;
            querySql("UPDATE " + database + "." + dbConfig.quote_layout_table + " SET numSections = ? WHERE layoutID = ? ", [numSections, layoutID]);
            return null;
        })
        .then(() => {
            querySql("DELETE FROM " + database + "." + dbConfig.quote_section_table + " WHERE quoteID = ? AND layoutNum = ? AND sectionNum = ? ", [quoteID, layoutNum, selectedSection]);

            return null
        })
        .then(
            async function() {
                numSections += 1;
                for(let i = parseInt(selectedSection) + 1; i <= numSections; i++){
                    await querySql("UPDATE " + database + "." + dbConfig.quote_section_table + " SET sectionNum = ? WHERE quoteID = ? AND layoutNum = ? AND sectionNum = ? ", [i-1, quoteID, layoutNum, i]);
                }

                return null
            }
        )
        .then(() => {
            res.locals = {title: 'Delete Section'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
            return null
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Clear All Sections
exports.quoteResetSections = function (req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let layoutNum = qs.layoutNum;
    let quoteID;

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table+" WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            querySql("UPDATE " + database + "." + dbConfig.quote_layout_table + " SET numSections = 0 WHERE quoteID = ? AND layoutNum = ?", [quoteID, layoutNum]);
            querySql("DELETE FROM " + database + "." + dbConfig.quote_section_table + " WHERE quoteID = ? AND layoutNum = ?", [quoteID, layoutNum]);
            return null
        })
        .then(() => {
            res.locals = {title: 'Delete Section'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
            return null
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Save Section Properties POST request
exports.quoteSectionProperties = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteNum = qs.quoteID.split('_')[0];
    let revNum = qs.quoteID.split('_')[1];
    let sectionNum = qs.sectionNum;
    let layoutNum =  qs.layoutNum;

    let quoteID;

    let data = {
        secType: req.body.secType,
        secHeight: req.body.secHeight,
        secWidth: req.body.secWidth,
        secDepth: req.body.secDepth,
        compA: null,
        compB: null,
        compC: null,
        compD: null,
        compAType: req.body.compA,
        compBType: req.body.compB,
        compCType: req.body.compC,
        compDType: req.body.compD
    };
    let applyToArr = [];
    applyToArr.push(sectionNum);

    let apply = req.body.applyToCheck;

    querySql("SELECT quoteID FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteNum = ? AND revNum = ?", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;
            if (apply) {
                if(apply instanceof Array) {
                    for (let i = 0; i < apply.length; i++) {
                        let temp = apply[i].split('o')[1];
                        applyToArr.push(temp);
                    }
                }else{
                    let temp = apply.split('o')[1];
                    applyToArr.push(temp);
                }
            }

            for (let i = 0; i < applyToArr.length; i++) {
                querySql("UPDATE " + database + "." + dbConfig.quote_section_table + " SET " +
                    " secType = ?, secHeight = ?, secWidth = ?, secDepth = ?, compA = ?, compB = ?, compC = ?, compD = ?, " +
                    "compAType = ?, compBType = ?, compCType = ?, compDType = ? WHERE quoteID = ? AND layoutNum = ? AND sectionNum = ?",
                    [data.secType, data.secHeight, data.secWidth, data.secDepth, data.compA, data.compB, data.compC, data.compD,
                        data.compAType, data.compBType, data.compCType, data.compDType, quoteID, layoutNum, applyToArr[i]]);
            }

            res.locals = {title: 'Save Section Properties'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);

            return null;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Add Device POST request
exports.addDevice = function (req, res) {
    let quoteNum = req.body.quoteNum;
    let revNum = req.body.revNum;

    //Splitting up the Mfg, Product, and Product Line
    let devMfgProd = req.body.devMfgProd;
    let devMfg = devMfgProd.split('/')[0];
    let devProduct = devMfgProd.slice(devMfgProd.indexOf('(') + 1, devMfgProd.indexOf(')'));
    let devProdLine = devMfgProd.slice(devMfgProd.indexOf('/') + 1, devMfgProd.indexOf('('));
    //Splitting up the device designations
    let designations = req.body.devDesignation;
    let designationArrayInitial = designations.split(',').map(item => item.trim());
    let designationArrayFinal = [];
    for (let i = 0; i < designationArrayInitial.length; i++) {
        if (designationArrayInitial[i].includes("(") == true) {
            let designationInterval = (designationArrayInitial[i].slice(designationArrayInitial[i].indexOf('(') + 1, designationArrayInitial[i].indexOf(')'))).split('-');
            let designationText = designationArrayInitial[i].slice(0, designationArrayInitial[i].indexOf('('));
            let designationFinalText = designationArrayInitial[i].slice(designationArrayInitial[i].indexOf(')') + 1, designationArrayInitial[i].length);
            for (let j = parseInt(designationInterval[0]); j <= parseInt(designationInterval[1]); j++) {
                let newDesignation = designationText + j.toString() + designationFinalText;
                designationArrayFinal.push(newDesignation);
            }
        } else {
            designationArrayFinal.push(designationArrayInitial[i]);
        }
    }
    let quoteID;
    let data = [];

    querySql("SELECT quoteID FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteNum = ? AND revNum = ?", [quoteNum, revNum])
        .then(rows => {
            quoteID = rows[0].quoteID;

            for (let i = 0; i < designationArrayFinal.length; i++) {
                let catCode = '';
                if (devProduct == 'ICCB') {
                    catCode = '37-CB IC';
                } else if (devProduct == 'MCCB') {
                    catCode = '36-CB MC';
                }

                data.push( {
                    quoteID: quoteID,
                    devDesignation: designationArrayFinal[i],
                    layoutNum: req.body.layoutNum,
                    unitOfIssue: 'EA',
                    devApp: req.body.devApp,
                    catCode: catCode,
                    brkPN: req.body.brkPN,
                    cradlePN: req.body.cradlePN,
                    devProduct: devProduct,
                    devMfg: devMfg,
                    devProdLine: devProdLine,
                    devMount: req.body.devMount,
                    rearAdaptType: req.body.rearAdaptType,
                    devUL: req.body.devUL,
                    devLevel: req.body.devLevel,
                    devOperation: req.body.devOperation,
                    devCtrlVolt: req.body.devCtrlVolt,
                    devMaxVolt: req.body.devMaxVolt,
                    devKAIC: req.body.devKAIC,
                    devFrameSet: req.body.devFrameSet,
                    devSensorSet: req.body.devSensorSet,
                    devTripSet: req.body.devTripSet,
                    devTripUnit: req.body.devTripUnit,
                    devTripParam: req.body.devTripParam,
                    devPoles: req.body.devPoles,
                    devLugQty: '',
                    devLugType: '',
                    devLugSize: '',
                    devAcc: ''
                });
            }

            return data;
        })
        .then(
            async function(rows) {
                for (let row of rows) {
                    await querySql("INSERT INTO " + database + "." + dbConfig.quote_breaker_table + " set ?", row)
                }
            }
        )
        .then(() => {
            res.locals = {title: 'New Device'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
            return null;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Copy Device POST request
exports.quoteCopyDevice = function(req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteID = qs.quoteID;
    let layoutNum = qs.layoutNum;
    let devID = qs.devID;
    let deviceData;
    let quoteNum;
    let revNum;

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_breaker_table + " WHERE quoteID = ? AND devID = ? AND layoutNum = ? ", [quoteID, devID, layoutNum])
        .then(rows => {
            deviceData = {
                quoteID: quoteID,
                layoutNum: layoutNum,
                devDesignation: rows[0].devDesignation,
                devApp: rows[0].devApp,
                unitOfIssue: rows[0].unitOfIssue,
                catCode: rows[0].catCode,
                brkPN: rows[0].brkPN,
                cradlePN: rows[0].cradlePN,
                devProduct: rows[0].devProduct,
                devMfg: rows[0].devMfg,
                devProdLine: rows[0].devProdLine,
                devMount: rows[0].devMount,
                rearAdaptType: rows[0].rearAdaptType,
                devUL: rows[0].devUL,
                devLevel: rows[0].devLevel,
                devOperation: rows[0].devOperation,
                devCtrlVolt: rows[0].devCtrlVolt,
                devMaxVolt: rows[0].devMaxVolt,
                devKAIC: rows[0].devKAIC,
                devFrameSet: rows[0].devFrameSet,
                devSensorSet: rows[0].devSensorSet,
                devTripSet: rows[0].devTripSet,
                devTripUnit: rows[0].devTripUnit,
                devTripParam: rows[0].devTripParam,
                devPoles: rows[0].devPoles
            };
            querySql("INSERT INTO " + database + "." + dbConfig.quote_breaker_table + " SET ? ", deviceData);

            return querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", quoteID)
        })
        .then(rows => {
            quoteNum = rows[0].quoteNum;
            revNum = rows[0].revNum;
            res.locals = {title: 'Copy Device'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);

            return null;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Edit Device GET request
exports.quoteEditDevice = function (req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteID = qs.quoteID;
    let layoutNum = qs.layoutNum;
    let devID = qs.devID;
    let data1 = [];
    let data2 = [];
    let data3 = [];
    let profilePic;

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", qs.quoteID)
        .then(rows => {
            for (let row of rows) {
                data1.push(row)
            }

            return querySql("SELECT * FROM " + database + " . " + dbConfig.quote_layout_table + " WHERE quoteID = ? AND layoutNum = ?", [quoteID, layoutNum])
        })
        .then(rows => {
            for (let row of rows) {
                data2.push(row)
            }
            return querySql("SELECT * FROM " + database + "." + dbConfig.quote_breaker_table + " WHERE quoteID = ? AND layoutNum = ? AND devID = ?", [quoteID, layoutNum, devID])
        })
        .then(rows => {
            for (let row of rows) {
                data3.push(row)
            }
            return querySql("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id)
        })
        .then(rows => {
            if (rows.length != 0) {
                profilePic = '/public/uploads/' + rows[0].profilePic;
            }
            return null;
        })
        .then(() => {
            res.locals = {title: 'Edit Device'};
            res.render('AppsEng/editDevice', {
                quoteData: data1,
                layoutData: data2,
                deviceData: data3,
                profilePic: profilePic
            });
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Save Device POST request
exports.saveDevice = function (req, res) {
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteID = qs.quoteID;
    let layoutNum = qs.layoutNum;
    let devID = qs.devID;
    let devMfgProd = req.body.devMfgProd;
    let devMfg = devMfgProd.split('/')[0];
    let devProduct = devMfgProd.slice(devMfgProd.indexOf('(') + 1, devMfgProd.indexOf(')'));
    let devProdLine = devMfgProd.slice(devMfgProd.indexOf('/') + 1, devMfgProd.indexOf('('));

    let data = {
        devID: devID,
        quoteID: quoteID,
        layoutNum: layoutNum
    };

    let updateData = {
        devDesignation: req.body.devDesignation,
        devApp: req.body.devApp,
        brkPN: req.body.brkPN,
        cradlePN: req.body.cradlePN,
        devProduct: devProduct,
        devMfg: devMfg,
        devProdLine: devProdLine,
        devMount: req.body.devMount,
        rearAdaptType: req.body.rearAdaptType,
        devUL: req.body.devUL,
        devLevel: req.body.devLevel,
        devOperation: req.body.devOperation,
        devCtrlVolt: req.body.devCtrlVolt,
        devMaxVolt: req.body.devMaxVolt,
        devKAIC: req.body.devKAIC,
        devFrameSet: req.body.devFrameSet,
        devTripSet: req.body.devTripSet,
        devTripUnit: req.body.devTripUnit,
        devTripParam: req.body.devTripParam,
        devPoles: req.body.devPoles
    };

    let quoteNum;
    let revNum;

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", quoteID)
        .then(rows => {
            quoteNum = rows[0].quoteNum;
            revNum = rows[0].revNum;

            querySql("UPDATE " + database + "." + dbConfig.quote_breaker_table + " SET " +
                " devDesignation = ?, devApp = ?, brkPN = ?, cradlePN = ?, devProduct = ?, devMfg = ?, devProdLine = ?, devMount = ?, rearAdaptType = ?, " +
                "devUL = ?, devOperation = ?, devCtrlVolt = ?, devMaxVolt = ?, devKAIC = ?, devFrameSet = ?, " +
                "devTripSet = ?, devTripUnit = ?, devTripParam = ?, devPoles = ? WHERE devID = ? AND quoteID = ? AND layoutNum = ? ",
                [updateData.devDesignation, updateData.devApp, updateData.brkPN, updateData.cradlePN, updateData.devProduct, updateData.devMfg, updateData.devProdLine,
                    updateData.devMount, updateData.rearAdaptType, updateData.devUL, updateData.devOperation, updateData.devCtrlVolt,
                    updateData.devMaxVolt, updateData.devKAIC, updateData.devFrameSet, updateData.devTripSet, updateData.devTripUnit,
                    updateData.devTripParam, updateData.devPoles, data.devID, data.quoteID, data.layoutNum]);

            return null;
        })
        .then(() => {
            res.locals = {title: 'Edit Device'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};


//Delete device POST request
exports.quoteDeleteDevice = function (req, res){
    let urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    let qs = queryString.parse(urlObj.search);
    let quoteID = qs.quoteID;
    let layoutNum = qs.layoutNum;
    let devID = qs.devID;
    let quoteNum;
    let revNum;

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", quoteID)
        .then(rows => {
            quoteNum = rows[0].quoteNum;
            revNum = rows[0].revNum;
            querySql("DELETE FROM " + database + "." + dbConfig.quote_breaker_table + " WHERE quoteID = ? AND layoutNum = ? AND devID = ?", [quoteID, layoutNum, devID]);
            return null
        })
        .then(() => {
            res.locals = {title: 'Delete Device'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

//Save changes
exports.quoteSaveChanges = function (req, res) {
    let data = [];
    let quoteNum;
    let revNum;
    let secData;

    querySql("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", req.body.quoteID[0])
        .then(rows => {
            quoteNum = rows[0].quoteNum;
            revNum = rows[0].revNum;

            if(req.body.totalSection.length == 1){
                data.push({
                    sectionNum: (req.body.sectionNum)[0],
                    quoteID: (req.body.quoteID)[0],
                    layoutNum: (req.body.layoutNum)[0],
                    compA: req.body.compA,
                    compB: req.body.compB,
                    compC: req.body.compC,
                    compD: req.body.compD
                })
            } else {
                for (let i = 0; i < parseInt(req.body.totalSection[0]); i++) {
                    data.push({
                        sectionNum: (req.body.sectionNum)[i],
                        quoteID: (req.body.quoteID)[i],
                        layoutNum: (req.body.layoutNum)[i],
                        compA: (req.body.compA)[i],
                        compB: (req.body.compB)[i],
                        compC: (req.body.compC)[i],
                        compD: (req.body.compD)[i]
                    })
                }
            }

            return data;
        })
        .then(
            async function(data) {
                for (let row of data) {
                    secData = row;
                    let secCompMap = [secData.compA, secData.compB, secData.compC, secData.compD];
                    for (let i = 0; i < secCompMap.length; i++) {
                        if (secCompMap[i] == '') {
                            secCompMap[i] = null;
                        }
                    }

                    await querySql("SELECT * FROM " + database + "." + dbConfig.quote_section_table + " WHERE sectionNum = ? AND quoteID = ? AND layoutNum = ?", [secData.sectionNum, secData.quoteID, secData.layoutNum])
                        .then(rows => {
                            if(!rows) {
                                querySql("INSERT INTO " + database + " . " + dbConfig.quote_section_table + " SET sectionNum = ?, compA = ?, compB = ?, compC = ?, compD = ?, quoteID = ?, layoutNum = ?",
                                    [secData.sectionNum, secCompMap[0], secCompMap[1], secCompMap[2], secCompMap[3], secData.quoteID, secData.layoutNum]);
                            } else {
                                querySql("UPDATE " + database + " . " + dbConfig.quote_section_table + " SET compA = ?, compB = ?, compC = ?, compD = ? WHERE secID = ?",
                                    [secCompMap[0], secCompMap[1], secCompMap[2], secCompMap[3], rows[0].secID]);
                            }

                            return null;
                        })
                        .catch((err) => {
                            return Promise.reject(err);
                        });
                }
                return null
            })
        .then(() => {
            res.locals = {title: 'Save Section'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);

            return null;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};




