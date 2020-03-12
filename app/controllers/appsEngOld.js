var app = require('express')();
var mysql = require('mysql');
var connection = require('express-myconnection');
var queryString = require('query-string');
var url = require('url');


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



//*********************************APPLICATION ENG. PORTAL*************************************//
var exports = module.exports = {}


//New Quote GET request
exports.newQuote = function(req, res) {
    var quoteData = [];

    req.getConnection(function(err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            for (var i = 0; i < result.length; i++) {
                quoteData[i] = result[i];
            }
            connection.query("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id, function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                if (result.length != 0)
                    var profilePic = '/public/uploads/' + result[0].profilePic;
                res.locals = {title: 'New Quote'};
                res.render('AppsEng/newQuote', {
                    quoteData: quoteData,
                    profilePic: profilePic,
                });

            });
        });
    });
};

//Add Quote POST request
exports.addQuote = function (req, res) {
    //Getting Users Name
    var email = req.user.email;
    var firstName = email.split('.')[0];
    var lastName = email.substring(email.indexOf('.') + 1, email.indexOf("@"));
    var usersFullName = firstName + ' ' + lastName;
    var data = {
        quoteNum: req.body.quoteNum[0],
        revNum: '00',
        projName: req.body.projName,
        customer: req.body.customer,
        rep: req.body.rep,
        numQuoteLayoutItems: 0,
        numQuoteItems: 0,
        quoteNotes: req.body.quoteNotes,
        createdBy: usersFullName.toUpperCase()
    };

    req.getConnection(function (err, connection) {
        connection.query("INSERT INTO " + database + "." + dbConfig.quote_summary_table + " set ?", data, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
        });
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteNum = ?", data.quoteNum, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            var quoteNum = result[0].quoteNum;
            var revNum = result[0].revNum;

            res.locals = {title: 'Quote Detail'};
            res.redirect('quoteDetail/?quoteID='+quoteNum+'_'+revNum);
        });
    });
};


//Edit Quote POST request
exports.editQuote = function (req, res){
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];
    req.getConnection(function (err, connection) {
        var data = {
            projName: req.body.projName,
            customer: req.body.customer,
            rep: req.body.rep
        };
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum] , function(err, result) {
            var quoteID = result[0].quoteID;
            connection.query("UPDATE " + database + "." + dbConfig.quote_summary_table + " SET projName = ?, customer = ?, rep = ? WHERE quoteID = ?", [data.projName, data.customer, data.rep, quoteID], function(err, result){
                if (err)
                    console.log("Error updating : %s ", err);
                res.locals = {title: 'Quote Detail'};
                res.redirect('../quoteDetail/?quoteID='+quoteNum+'_'+revNum);
            });
        });
    });
};

let slideSelect = 1;

//Selected Slide POST request
exports.selectedSlide = function(req, res) {
    slideSelect = parseInt(req.body.slideSelect) + 1;
    var quoteNum = req.body.quoteNum;
    var revNum = req.body.revNum;
    res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
};

//Quote Detail GET request
exports.quoteDetail = function (req, res) {
    var currentSlide = slideSelect;
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];
    var data1 = [];
    var data2 = [];
    var data3 = [];
    var data4 = [];
    var data5 = [];
    var data6 = [];
    var data7 = [];
    var data8 = [];
    var dropdownOptions = [];

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum], function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            for (var i = 0; i < result.length; i++) {
                data1[i] = result[i];
            }
            connection.query("SELECT catCode FROM " + database + " . " + dbConfig.jobscope_codes_table, function (err, result) {
                if (err)
                    console.log("Error selecting : %s ", err);
                for (var i = 0; i < result.length; i++) {
                    data2[i] = result[i];
                }
                connection.query("SELECT * FROM " + database + " . " + dbConfig.quote_layout_table + " WHERE quoteID = ?", data1[0].quoteID, function (err, result) {
                    if (err)
                        console.log("Error selecting : %s ", err);
                    if(result) {
                        for (var i = 0; i < result.length; i++) {
                            data3[i] = result[i];
                        }
                    }
                    connection.query("SELECT * FROM " + database + " . " + dbConfig.quote_section_table + " WHERE quoteID = ?", data1[0].quoteID, function (err, result) {
                        if (err)
                            console.log("Error selecting : %s ", err);
                        if(result) {
                            for (var i = 0; i < result.length; i++) {
                                data4[i] = result[i];
                            }
                        }
                        connection.query("SELECT * FROM " + database + " . " + dbConfig.quote_breaker_table + " WHERE quoteID = ?", data1[0].quoteID, function (err, result) {
                            if (err)
                                console.log("Error selecting : %s ", err);
                            if (result) {
                                for (var i = 0; i < result.length; i++) {
                                    data5[i] = result[i];
                                }
                            }
                            connection.query("SELECT * FROM " + database + " . " + dbConfig.quote_field_service_table + " WHERE quoteID = ?", data1[0].quoteID, function (err, result) {
                                if (err)
                                    console.log("Error selecting : %s ", err);
                                if (result) {
                                    for (var i = 0; i < result.length; i++) {
                                        data6[i] = result[i];
                                    }
                                }
                                connection.query("SELECT * FROM " + database + " . " + dbConfig.quote_freight_table + " WHERE quoteID = ?", data1[0].quoteID, function (err, result) {
                                    if (err)
                                        console.log("Error selecting : %s ", err);
                                    if (result) {
                                        for (var i = 0; i < result.length; i++) {
                                            data7[i] = result[i];
                                        }
                                    }
                                    connection.query("SELECT dropdownRestrictions -> \"$.SystemAmp\" systemAmp, dropdownRestrictions -> \"$.ULListing\" ulListing, " +
                                        "dropdownRestrictions -> \"$.SystemType\" systemType, dropdownRestrictions -> \"$.MainBusAmp\" mainBusAmp, " +
                                        "dropdownRestrictions -> \"$.BusBracing\" busBracing, dropdownRestrictions -> \"$.kAICRating\" kAICRating FROM " + database + "." + dbConfig.quote_layout_dropdown +
                                        " WHERE dropdownValue = 'LV Panelboard'", function (err, result) {
                                        if (err)
                                            console.log("Error selecting : %s ", err);
                                        for(var i = 0; i < result.length; i++){
                                            dropdownOptions.push({
                                                layoutType: 'LV Panelboard',
                                                systemAmp: JSON.parse(result[0].systemAmp),
                                                ulListing: [JSON.parse(result[0].ulListing)],
                                                systemType: JSON.parse(result[0].systemType),
                                                mainBusAmp: JSON.parse(result[0].mainBusAmp),
                                                busBracing: JSON.parse(result[0].busBracing),
                                                kAICRating: JSON.parse(result[0].kAICRating)
                                            });
                                        }

                                        connection.query("SELECT dropdownRestrictions -> \"$.SystemAmp\" systemAmp, dropdownRestrictions -> \"$.ULListing\" ulListing, " +
                                            "dropdownRestrictions -> \"$.SystemType\" systemType, dropdownRestrictions -> \"$.MainBusAmp\" mainBusAmp, " +
                                            "dropdownRestrictions -> \"$.BusBracing\" busBracing, dropdownRestrictions -> \"$.kAICRating\" kAICRating FROM " + database + "." + dbConfig.quote_layout_dropdown +
                                            " WHERE dropdownValue = 'LV Switchboard'", function (err, result) {
                                            if (err)
                                                console.log("Error selecting : %s ", err);
                                            for(var i = 0; i < result.length; i++){
                                                dropdownOptions.push({
                                                    layoutType: 'LV Switchboard',
                                                    systemAmp: JSON.parse(result[0].systemAmp),
                                                    ulListing: [JSON.parse(result[0].ulListing)],
                                                    systemType: JSON.parse(result[0].systemType),
                                                    mainBusAmp: JSON.parse(result[0].mainBusAmp),
                                                    busBracing: JSON.parse(result[0].busBracing),
                                                    kAICRating: JSON.parse(result[0].kAICRating)
                                                });
                                            }

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
                                            // end of temp section

                                            connection.query("SELECT * FROM " + database + "." + dbConfig.quote_section_type, function (err, result) {
                                                if (err)
                                                    console.log("Error selecting : %s ", err);
                                                for (var i = 0; i < result.length; i++) {
                                                    data8[i] = result[i];
                                                }

                                                connection.query("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id, function (err, result) {
                                                    if (err)
                                                        console.log("Error selecting : %s ", err);
                                                    if (result.length != 0)
                                                        var profilePic = '/public/uploads/' + result[0].profilePic;

                                                    connection.query("SELECT * FROM " + database + "." + dbConfig.quote_layout_dropdown, function(err, result) {
                                                        if (err)
                                                            console.log("Error selecting : %s ", err);
                                                        var layoutTypes = [];
                                                        var ulListings  = [];
                                                        var systemTypes = [];
                                                        var enclosureTypes = [];
                                                        var accessTypes = [];
                                                        var cableEntryTypes = [];
                                                        var paintTypes = [];
                                                        var systemAmpTypes = [];
                                                        var mainBusAmpTypes = [];
                                                        var busBracingTypes = [];
                                                        var kaicTypes = [];
                                                        var bussingTypes = [];
                                                        for (var i = 0; i < result.length; i++) {
                                                            switch (result[i].dropdownType) {
                                                                case "Layout Type":
                                                                    layoutTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "UL Listing":
                                                                    ulListings.push(result[i].dropdownValue);
                                                                    break;
                                                                case "System Type":
                                                                    systemTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "Enclosure":
                                                                    enclosureTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "Access":
                                                                    accessTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "Cable Entry":
                                                                    cableEntryTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "Paint":
                                                                    paintTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "System Amp":
                                                                    systemAmpTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "Main Bus Amp":
                                                                    mainBusAmpTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "Bus Bracing":
                                                                    busBracingTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "kAIC Rating":
                                                                    kaicTypes.push(result[i].dropdownValue);
                                                                    break;
                                                                case "Bussing Type":
                                                                    bussingTypes.push(result[i].dropdownValue);
                                                                    break;
                                                            }
                                                        }
                                                        res.locals = {title: 'New Quote'};
                                                        res.render('AppsEng/quoteDetail', {
                                                            quoteData: data1,
                                                            catCodeData: data2,
                                                            layoutData: data3,
                                                            sectionData: data4,
                                                            deviceData: data5,
                                                            fieldServiceData: data6,
                                                            freightData: data7,
                                                            sectionType: data8,
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
    });
};

//Add Layout POST request
exports.quoteAddLayout = function (req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];
    var seismicCheck, mimicCheck, IRCheck, wirewayCheck, trolleyCheck;
    if (req.body.seismic) {
        seismicCheck = "Y";
    } else {
        seismicCheck = "N";
    }
    if (req.body.mimic) {
        mimicCheck = "Y";
    } else {
        mimicCheck = "N";
    }
    if (req.body.IR) {
        IRCheck = "Y";
    } else {
        IRCheck = "N";
    }
    if (req.body.wireway) {
        wirewayCheck = "Y";
    } else {
        wirewayCheck = "N";
    }
    if (req.body.trolley) {
        trolleyCheck = "Y";
    } else {
        trolleyCheck = "N";
    }
    req.getConnection(function (err, connection) {


        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum], function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            var quoteID = result[0].quoteID;
            var layoutNum = parseInt(result[0].numQuoteLayoutItems);
            layoutNum += 1;
            var data = {
                quoteID: quoteID,
                layoutName: (req.body.layoutName).toUpperCase(),
                layoutType: req.body.layoutType,
                layoutNum: layoutNum,
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
                seismicCheck: seismicCheck,
                mimicCheck: mimicCheck,
                IRCheck: IRCheck,
                wirewayCheck: wirewayCheck,
                trolleyCheck: trolleyCheck
            };

            connection.query("UPDATE " + database + "." + dbConfig.quote_summary_table + " SET numQuoteLayoutItems = ? WHERE quoteID = ?", [layoutNum, quoteID], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                connection.query("INSERT INTO " + database + "." + dbConfig.quote_layout_table + " SET ?", data, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    res.locals = {title: 'New Quote'};
                    res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
                });
            });
        });
    });
};

//Edit Layout POST request
exports.quoteEditLayout = function (req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];
    var layoutNum = qs.layoutNum;
    var quoteID;
    var panelBoardOptions = [];
    var switchBoardOptions = [];

    var seismicCheck, mimicCheck, IRCheck, wirewayCheck, trolleyCheck;
    if (req.body.seismic) {
        seismicCheck = "Y";
    } else {
        seismicCheck = "N";
    }
    if (req.body.mimic) {
        mimicCheck = "Y";
    } else {
        mimicCheck = "N";
    }
    if (req.body.IR) {
        IRCheck = "Y";
    } else {
        IRCheck = "N";
    }
    if (req.body.wireway) {
        wirewayCheck = "Y";
    } else {
        wirewayCheck = "N";
    }
    if (req.body.trolley) {
        trolleyCheck = "Y";
    } else {
        trolleyCheck = "N";
    }
    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM "+ database + "." + dbConfig.quote_summary_table+" WHERE (quoteNum, revNum) = (?,?)",[quoteNum, revNum], function(err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            quoteID = result[0].quoteID;
            var data = {
                layoutNum: layoutNum,
                quoteID: quoteID
            };
            var updateData = {
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
                seismicCheck: seismicCheck,
                mimicCheck: mimicCheck,
                IRCheck: IRCheck,
                wirewayCheck: wirewayCheck,
                trolleyCheck: trolleyCheck
            };

            connection.query("UPDATE " + database + "." + dbConfig.quote_layout_table + " SET " +
                "layoutName = ?, layoutType = ?, layoutUL = ?, layoutEnclosure = ?, layoutAccess = ?, " +
                "layoutPaint = ?, layoutBusType = ?, layoutCabEntry = ?, layoutSystem = ?, systemAmp = ?, " +
                "mainBusAmp = ?, busBracing = ?, interuptRating = ?, seismicCheck = ?, mimicCheck = ?, " +
                "IRCheck = ?, wirewayCheck = ?, trolleyCheck = ? WHERE quoteID = ? AND layoutNum = ?",
                [updateData.layoutName, updateData.layoutType, updateData.layoutUL, updateData.layoutEnclosure,
                    updateData.layoutAccess, updateData.layoutPaint, updateData.layoutBusType, updateData.layoutCabEntry,
                    updateData.layoutSystem, updateData.systemAmp, updateData.mainBusAmp, updateData.busBracing,
                    updateData.interuptRating, updateData.seismicCheck, updateData.mimicCheck, updateData.IRCheck,
                    updateData.wirewayCheck, updateData.trolleyCheck, data.quoteID, data.layoutNum], function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    res.locals = {title: 'New Quote'};
                    res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
                });
        });
    });
};

//Add Field Service POST request
exports.quoteAddFieldService = function(req, res){
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];

    var data = [];
    var flyingCheck, airfare, parkingExpense, rentalCarExpense, drivingCheck, numOfMiles, carMileage, holidayHours, overtimeHours, regularHours;

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

    if(req.body.fieldLaborSelect == 'regular'){
        regularHours = req.body.fieldLaborInput;
    }else if(req.body.fieldLaborSelect == 'overtime'){
        overtimeHours = req.body.fieldLaborInput;
    }else{
        holidayHours = req.body.fieldLaborInput;
    }

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            var quoteID = result[0].quoteID;
            var totalLayout = result[0].numQuoteLayoutItems;
            if(result[0].numQuoteItems) {
                var numQuoteItems = parseInt(result[0].numQuoteItems);
                numQuoteItems += 1;
            } else
                var numQuoteItems = 1;

            data = {
                quoteID: quoteID,
                title: (req.body.fieldServiceTitle).toUpperCase(),
                fieldServiceNum: totalLayout + numQuoteItems,
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
                total: null,
            };

            for (var i in data) {
                if( data[i] == '') {
                    data[i] = null;
                }
            }

            connection.query("UPDATE " + database + "." + dbConfig.quote_summary_table + " SET numQuoteItems = ? WHERE quoteID = ?", [numQuoteItems, quoteID], function (err, result) {
                if (err)
                    console.log("Error updating : %s ", err);

                connection.query("INSERT INTO " + database + "." + dbConfig.quote_field_service_table + " SET ?", data, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                });
            });
        });

        res.locals = {title: 'Add Field Service'};
        res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
    });
};

//Add Freight POST request
exports.quoteAddFreight = function(req, res){
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];

    var standardCheck, flatbedCheck, stepDeckCheck, surroundingStatesCheck, eastCoastCheck, westCoastCheck, truckCostOverrideCheck, totalOverrideCheck;
    if(req.body.truckType == 'standard'){
        standardCheck = "Y";

        flatbedCheck = "N";
        stepDeckCheck = "N";
    }else if (req.body.truckType == 'flatbed'){
        flatbedCheck = "Y";

        standardCheck = "N";
        stepDeckCheck = "N";
    }else{
        stepDeckCheck = "Y";

        standardCheck = "N";
        flatbedCheck = "N";
    }

    if(req.body.destinationType == 'surroundingStates'){
        surroundingStatesCheck = "Y";

        eastCoastCheck = "N";
        westCoastCheck = "N";
    }else if(req.body.destinationType == 'eastCoast'){
        eastCoastCheck = "Y";

        surroundingStatesCheck = "N";
        westCoastCheck = "N";
    }else{
        westCoastCheck = "Y";

        surroundingStatesCheck = "N";
        eastCoastCheck = "N";
    }

    if(req.body.overrideCost){
        truckCostOverrideCheck = "Y";
    } else {
        truckCostOverrideCheck = "N";
    }
    if(req.body.overrideTotal){
        totalOverrideCheck = "Y";
    } else {
        totalOverrideCheck = "N";
    }

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            var quoteID = result[0].quoteID;
            if (result[0].numQuoteItems) {
                var numQuoteItems = parseInt(result[0].numQuoteItems);
                numQuoteItems += 1;
            } else
                var numQuoteItems = 1;

            data = {
                quoteID: quoteID,
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
                total: null,
                totalOverride: totalOverrideCheck
            };

            connection.query("UPDATE " + database + "." + dbConfig.quote_summary_table + " SET numQuoteItems = ? WHERE quoteID = ?", [numQuoteItems, quoteID], function (err, result) {
                if (err)
                    console.log("Error updating : %s ", err);

                connection.query("INSERT INTO " + database + "." + dbConfig.quote_freight_table + " SET ?", data, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                });
            });
        });
        res.locals = {title: 'Add Freight'};
        res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
    });
};

//Delete Board POST request
exports.quoteDeleteLayout = function(req, res) {
    if (slideSelect > 1) {
        slideSelect -= 1;
    } else {
        slideSelect = 1;
    }
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];
    var layoutNum = qs.layoutNum;

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum,revNum],  function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            var quoteID = result[0].quoteID;
            var numQuoteLayoutItems = result[0].numQuoteLayoutItems;
            numQuoteLayoutItems -= 1;

            connection.query("UPDATE " + database + "." + dbConfig.quote_summary_table + " SET numQuoteLayoutItems = ? WHERE quoteID = ?", [numQuoteLayoutItems, quoteID], function (err, result) {
                if (err)
                    console.log("Error updating : %s ", err);
            });
            connection.query("DELETE FROM " + database + "." + dbConfig.quote_layout_table + " WHERE quoteID = ? AND layoutNum = ? ", [quoteID, layoutNum], function (err, result) {
                if (err)
                    console.log("Error deleting : %s ", err);
            });
            for (var i = parseInt(layoutNum) + 1; i <= (numQuoteLayoutItems + 1); i++) {
                connection.query("UPDATE " + database + " . " + dbConfig.quote_layout_table + " SET layoutNum = ? WHERE quoteID = ? AND layoutNum = ?", [i - 1, quoteID, i], function (err, result) {
                    if (err)
                        console.log("Error updating : %s ", err);
                });
            }

            //Delete and Update quoteSectionSum
            connection.query("DELETE FROM " + database + "." + dbConfig.quote_section_table + " WHERE quoteID = ? AND layoutNum = ? ", [quoteID, layoutNum], function (err, result) {
                if (err)
                    console.log("Error deleting : %s ", err);
            });
            for (var i = parseInt(layoutNum) + 1; i <= (numQuoteLayoutItems + 1); i++) {
                connection.query("UPDATE " + database + " . " + dbConfig.quote_section_table + " SET layoutNum = ? WHERE quoteID = ? AND layoutNum = ?", [i - 1, quoteID, i], function (err, result) {
                    if (err)
                        console.log("Error updating : %s ", err);
                });
            }

            //Delete and Update quoteBrkSum
            connection.query("DELETE FROM " + database + "." + dbConfig.quote_breaker_table + " WHERE quoteID = ? AND layoutNum = ? ", [quoteID, layoutNum], function (err, result) {
                if (err)
                    console.log("Error deleting : %s ", err);
            });
            for (var i = parseInt(layoutNum) + 1; i <= (numQuoteLayoutItems + 1); i++) {
                connection.query("UPDATE " + database + " . " + dbConfig.quote_breaker_table + " SET layoutNum = ? WHERE quoteID = ? AND layoutNum = ?", [i - 1, quoteID, i], function (err, result) {
                    if (err)
                        console.log("Error updating : %s ", err);
                });
            }
        });

        res.locals = {title: 'Delete Layout'};
        res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
    });
};

//Copy Layout POST request
exports.quoteCopyLayout = function (req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var data1 = [];
    var data2 = [];
    var insertNum;
    var insertData = [];
    req.getConnection(function (err, connection) {
        connection.query("SELECT idLayout FROM " + database + "." + dbConfig.quote_layout_table + " WHERE quoteNum = ?", qs.quote, function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            for (var i = 0; i < result.length; i++) {
                data1[i] = result[i];
            }
            insertNum = "00" + (data1[data1.length - 1].idLayout + 1);
            connection.query("SELECT * FROM " + database + "." + dbConfig.quote_layout_table + " WHERE quoteNum = ? AND layoutNum = ?", [qs.quote, qs.layout], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                for (var i = 0; i < result.length; i++) {
                    data2[i] = result[i];
                }
                var insertData = {
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
                connection.query("INSERT INTO " + database + "." + dbConfig.quote_layout_table + " set ?", insertData, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                    res.locals = {title: 'Quote Detail'};
                    res.redirect('../quoteDetail/?quote=' + insertData.quoteNum);
                });
            });
        });
    });
};


//Add Section
exports.quoteAddSection = function(req, res){
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];
    var layoutNum = qs.layoutNum;

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteNum = ? AND revNum = ?", [quoteNum, revNum], function (err, result) {
            if (err)
                console.log("Error inserting : %s ", err);
            var quoteID = result[0].quoteID;

            connection.query("SELECT * FROM " + database + "." + dbConfig.quote_layout_table + " WHERE (quoteID, layoutNum) = (?,?)", [quoteID,layoutNum], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
                var layoutID = result[0].layoutID;
                var numSections = result[0].numSections;
                if (numSections == null)
                    numSections = 1;
                else
                    numSections += 1;
                connection.query("UPDATE " + database + "." + dbConfig.quote_layout_table + " SET numSections = ? WHERE layoutID = ? ", [numSections, layoutID], function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                });
                connection.query("INSERT INTO " + database + "." + dbConfig.quote_section_table + " SET quoteID = ?, layoutNum = ?, sectionNum = ? ", [quoteID, layoutNum, numSections], function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                });
            });
        });
        res.locals = {title: 'Add Section'};
        res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
    });
};

//Delete Section
exports.quoteDeleteSection = function(req, res){
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];
    var layoutNum = qs.layoutNum;
    var quoteID;
    var selectedSection = qs.selectedSection;

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM "+ database + "." + dbConfig.quote_summary_table + " WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum], function(err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            quoteID = result[0].quoteID;

            connection.query("SELECT * FROM " + database + "." + dbConfig.quote_layout_table + " WHERE (quoteID, layoutNum) = (?,?)", [quoteID, layoutNum], function(err, result){
                if (err)
                    console.log("Error selecting : %s ", err);
                var layoutID = result[0].layoutID;
                var numSections = result[0].numSections;
                numSections -= 1;

                connection.query("UPDATE " + database + "." + dbConfig.quote_layout_table + " SET numSections = ? WHERE layoutID = ? ", [numSections, layoutID], function(err, result){
                    if (err)
                        console.log("Error inserting : %s ", err);
                });

                connection.query("DELETE FROM " + database + "." + dbConfig.quote_section_table + " WHERE quoteID = ? AND layoutNum = ? AND sectionNum = ? ", [quoteID, layoutNum, selectedSection], function(err, result){
                    if (err)
                        console.log("Error inserting : %s ", err);
                });
                for(var i = parseInt(selectedSection) + 1; i <= (numSections+1);i++){
                    connection.query("UPDATE " + database + "." + dbConfig.quote_section_table + " SET sectionNum = ? WHERE quoteID = ? AND layoutNum = ? AND sectionNum = ? ", [i-1, quoteID, layoutNum, i], function (err, result) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                    });
                }
            });
            res.locals = {title: 'Delete Section'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        });
    });
};

//Clear All Sections
exports.quoteResetSections = function (req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];
    var layoutNum = qs.layoutNum;
    var quoteID;

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table+" WHERE (quoteNum, revNum) = (?,?)", [quoteNum, revNum], function(err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            quoteID = result[0].quoteID;

            connection.query("UPDATE " + database + "." + dbConfig.quote_layout_table + " SET numSections = 0 WHERE quoteID = ? AND layoutNum = ?", [quoteID, layoutNum], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
            });
            connection.query("DELETE FROM " + database + "." + dbConfig.quote_section_table + " WHERE quoteID = ? AND layoutNum = ?", [quoteID, layoutNum], function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
            });
            res.locals = {title: 'Delete Section'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        });
    });
};

//Save Section Properties POST request
exports.quoteSectionProperties = function(req, res){
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteNum = qs.quoteID.split('_')[0];
    var revNum = qs.quoteID.split('_')[1];
    var sectionNum = qs.sectionNum;
    var layoutNum =  qs.layoutNum;

    var quoteID;
    var data = [];

    data = {
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
    var applyToArr = [];
    applyToArr.push(sectionNum);

    req.getConnection(function (err, connection) {
        connection.query("SELECT quoteID FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteNum = ? AND revNum = ?", [quoteNum, revNum], function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            quoteID = result[0].quoteID;

            var apply = req.body.applyToCheck;

            if(apply){
                if(apply instanceof Array) {
                    for (var i = 0; i < apply.length; i++) {
                        var temp = apply[i].split('o')[1];
                        applyToArr.push(temp);
                    }
                }else{
                    var temp = apply.split('o')[1];
                    applyToArr.push(temp);
                }
            }

            for(var i = 0; i < applyToArr.length; i++) {
                connection.query("UPDATE " + database + "." + dbConfig.quote_section_table + " SET " +
                    " secType = ?, secHeight = ?, secWidth = ?, secDepth = ?, compA = ?, compB = ?, compC = ?, compD = ?, " +
                    "compAType = ?, compBType = ?, compCType = ?, compDType = ? WHERE quoteID = ? AND layoutNum = ? AND sectionNum = ?",
                    [data.secType, data.secHeight, data.secWidth, data.secDepth, data.compA, data.compB, data.compC, data.compD,
                        data.compAType, data.compBType, data.compCType, data.compDType, quoteID, layoutNum, applyToArr[i]], function (err, result) {
                        if (err)
                            console.log("Error updating : %s ", err);
                    });
            }

            res.locals = {title: 'Save Section Properties'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        });
    });
};

//Add Device POST request
exports.addDevice = function (req, res) {
    var quoteNum = req.body.quoteNum;
    var revNum = req.body.revNum;

    req.getConnection(function (err, connection) {
        connection.query("SELECT quoteID FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteNum = ? AND revNum = ?", [quoteNum, revNum], function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            var quoteID = result[0].quoteID;

            //Splitting up the Mfg, Product, and Product Line
            var devMfgProd = req.body.devMfgProd;
            var devMfg = devMfgProd.split('/')[0];
            var devProduct = devMfgProd.slice(devMfgProd.indexOf('(') + 1, devMfgProd.indexOf(')'));
            var devProdLine = devMfgProd.slice(devMfgProd.indexOf('/') + 1, devMfgProd.indexOf('('));
            //Splitting up the device designations
            var designations = req.body.devDesignation;
            var designationArrayInitial = designations.split(',').map(item => item.trim());
            var designationArrayFinal = [];
            for (var i = 0; i < designationArrayInitial.length; i++) {
                if (designationArrayInitial[i].includes("(") == true) {
                    var designationInterval = (designationArrayInitial[i].slice(designationArrayInitial[i].indexOf('(') + 1, designationArrayInitial[i].indexOf(')'))).split('-');
                    var designationText = designationArrayInitial[i].slice(0, designationArrayInitial[i].indexOf('('));
                    var designationFinalText = designationArrayInitial[i].slice(designationArrayInitial[i].indexOf(')') + 1, designationArrayInitial[i].length);
                    for (var j = parseInt(designationInterval[0]); j <= parseInt(designationInterval[1]); j++) {
                        var newDesignation = designationText + j.toString() + designationFinalText;
                        designationArrayFinal.push(newDesignation);
                    }
                } else {
                    designationArrayFinal.push(designationArrayInitial[i]);
                }
            }
            for (var i = 0; i < designationArrayFinal.length; i++) {
                var catCode = '';
                if (devProduct == 'ICCB') {
                    catCode = '37-CB IC';
                }
                else if (devProduct == 'MCCB') {
                    catCode = '36-CB MC';
                }
                var data = {
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
                };
                connection.query("INSERT INTO " + database + "." + dbConfig.quote_breaker_table + " set ?", data, function (err, result) {
                    if (err)
                        console.log("Error inserting : %s ", err);
                });
            }
            res.locals = {title: 'New Device'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        });
    });
};

//Copy Device POST request
exports.quoteCopyDevice = function(req, res){
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteID = qs.quoteID;
    var layoutNum = qs.layoutNum;
    var devID = qs.devID;

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_breaker_table + " WHERE quoteID = ? AND devID = ? AND layoutNum = ? ", [quoteID, devID, layoutNum], function(err, result){
            if (err)
                console.log("Error selecting : %s ", err);
            var deviceData = {
                quoteID: quoteID,
                layoutNum: layoutNum,
                devDesignation: result[0].devDesignation,
                devApp: result[0].devApp,
                unitOfIssue: result[0].unitOfIssue,
                catCode: result[0].catCode,
                brkPN: result[0].brkPN,
                cradlePN: result[0].cradlePN,
                devProduct: result[0].devProduct,
                devMfg: result[0].devMfg,
                devProdLine: result[0].devProdLine,
                devMount: result[0].devMount,
                rearAdaptType: result[0].rearAdaptType,
                devUL: result[0].devUL,
                devLevel: result[0].devLevel,
                devOperation: result[0].devOperation,
                devCtrlVolt: result[0].devCtrlVolt,
                devMaxVolt: req.body.devMaxVolt,
                devKAIC: result[0].devKAIC,
                devFrameSet: result[0].devFrameSet,
                devSensorSet: result[0].devSensorSet,
                devTripSet: result[0].devTripSet,
                devTripUnit: result[0].devTripUnit,
                devTripParam: result[0].devTripParam,
                devPoles: result[0].devPoles
            };
            connection.query("INSERT INTO " + database + "." + dbConfig.quote_breaker_table + " SET ? ", deviceData, function (err, result) {
                if (err)
                    console.log("Error inserting : %s ", err);
            });

            connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", quoteID, function (err, result) {
                if (err)
                    console.log("Error Selecting : %s ", err);
                var quoteNum = result[0].quoteNum;
                var revNum = result[0].revNum;

                res.locals = {title: 'Copy Device'};
                res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
            });
        });
    });
};

//Edit Device GET request
exports.quoteEditDevice = function (req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteID = qs.quoteID;
    var layoutNum = qs.layoutNum;
    var devID = qs.devID;
    var data1 = [];
    var data2 = [];
    var data3 = [];

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", qs.quoteID, function (err, result) {
            if (err)
                console.log("Error Selecting : %s ", err);
            for (var i = 0; i < result.length; i++) {
                data1[i] = result[i];
            }
            connection.query("SELECT * FROM " + database + " . " + dbConfig.quote_layout_table + " WHERE quoteID = ? AND layoutNum = ?", [quoteID, layoutNum], function (err, result) {
                if (err)
                    console.log("Error Selecting : %s ", err);
                for (var i = 0; i < result.length; i++) {
                    data2[i] = result[i];
                }
                connection.query("SELECT * FROM " + database + "." + dbConfig.quote_breaker_table + " WHERE quoteID = ? AND layoutNum = ? AND devID = ?", [quoteID, layoutNum, devID], function (err, result) {
                    if (err)
                        console.log("Error Selecting : %s ", err);
                    for (var i = 0; i < result.length; i++) {
                        data3[i] = result[i];
                    }

                    connection.query("SELECT * FROM " + database + "." + dbConfig.user_profile_table + " WHERE FK_id = ?", req.user.id, function (err, result) {
                        if (err)
                            console.log("Error Selecting : %s ", err);
                        if (result.length != 0)
                            var profilePic = '/public/uploads/' + result[0].profilePic;

                        res.locals = {title: 'Edit Device'};
                        res.render('AppsEng/editDevice', {
                            quoteData: data1,
                            layoutData: data2,
                            deviceData: data3,
                            profilePic: profilePic
                        });
                    });
                });
            });
        });
    });
};

//Save Device POST request
exports.saveDevice = function (req, res) {
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteID = qs.quoteID;
    var layoutNum = qs.layoutNum;
    var devID = qs.devID;

    req.getConnection(function (err, connection) {
        var devMfgProd = req.body.devMfgProd;
        var devMfg = devMfgProd.split('/')[0];
        var devProduct = devMfgProd.slice(devMfgProd.indexOf('(') + 1, devMfgProd.indexOf(')'));
        var devProdLine = devMfgProd.slice(devMfgProd.indexOf('/') + 1, devMfgProd.indexOf('('));
        /*var tripFrameArray = req.body.tripFrame.split(';');
        var tripSet = tripFrameArray[0];
        var frameSet = tripFrameArray[1];*/
        var data = {
            devID: devID,
            quoteID: quoteID,
            layoutNum: layoutNum
        };
        var updateData = {
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
        connection.query("UPDATE " + database + "." + dbConfig.quote_breaker_table + " SET " +
            " devDesignation = ?, devApp = ?, brkPN = ?, cradlePN = ?, devProduct = ?, devMfg = ?, devProdLine = ?, devMount = ?, rearAdaptType = ?, " +
            "devUL = ?, devOperation = ?, devCtrlVolt = ?, devMaxVolt = ?, devKAIC = ?, devFrameSet = ?, " +
            "devTripSet = ?, devTripUnit = ?, devTripParam = ?, devPoles = ? WHERE devID = ? AND quoteID = ? AND layoutNum = ? ",
            [updateData.devDesignation, updateData.devApp, updateData.brkPN, updateData.cradlePN, updateData.devProduct, updateData.devMfg, updateData.devProdLine,
                updateData.devMount, updateData.rearAdaptType, updateData.devUL, updateData.devOperation, updateData.devCtrlVolt,
                updateData.devMaxVolt, updateData.devKAIC, updateData.devFrameSet, updateData.devTripSet, updateData.devTripUnit,
                updateData.devTripParam, updateData.devPoles, data.devID, data.quoteID, data.layoutNum], function (err, result) {
                if (err)
                    console.log("Error updating : %s ", err);
            });
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", quoteID, function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            var quoteNum = result[0].quoteNum;
            var revNum = result[0].revNum;

            res.locals = {title: 'Edit Device'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        });
    });
};

//Delete device POST request
exports.quoteDeleteDevice = function (req, res){
    var urlObj = url.parse(req.originalUrl);
    urlObj.protocol = req.protocol;
    urlObj.host = req.get('host');
    var qs = queryString.parse(urlObj.search);
    var quoteID = qs.quoteID;
    var layoutNum = qs.layoutNum;
    var devID = qs.devID;

    req.getConnection(function (err, connection) {
        connection.query("DELETE FROM " + database + "." + dbConfig.quote_breaker_table + " WHERE quoteID = ? AND layoutNum = ? AND devID = ?", [quoteID, layoutNum, devID], function (err, result) {
            if (err)
                console.log("Error deleting : %s ", err);
        });
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", quoteID, function (err, result) {
            if (err)
                console.log("Error selecting : %s ", err);
            var quoteNum = result[0].quoteNum;
            var revNum = result[0].revNum;

            res.locals = {title: 'Delete Device'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        });
    });
};

//Save changes
exports.quoteSaveChanges = function (req, res) {
    req.getConnection(function (err, connection) {
        var data = [];

        for (var i = 0; i < req.body.totalSection[0]; i++) {
            data[i] = {
                sectionNum: (req.body.sectionNum)[i],
                quoteID: (req.body.quoteID)[i],
                layoutNum: (req.body.layoutNum)[i],
                compA: (req.body.compA)[i],
                compB: (req.body.compB)[i],
                compC: (req.body.compC)[i],
                compD: (req.body.compD)[i]
            }
        }

        for (var j = 0; j < data.length; j++) {
            let secData = data[j];

            connection.query("SELECT * FROM " + database + "." + dbConfig.quote_section_table + " WHERE sectionNum = ? AND quoteID = ? AND layoutNum = ?", [secData.sectionNum, secData.quoteID, secData.layoutNum], function(err, result){
                if (!result) {
                    if(secData.compA == ''){
                        connection.query("INSERT INTO " + database + " . " + dbConfig.quote_section_table + " SET sectionNum = ?, compA = ?, compB = ?, compC = ?, compD = ?, quoteID = ?, layoutNum = ?",
                            [secData.sectionNum, null, secData.compB, secData.compC, secData.compD, secData.quoteID, secData.layoutNum], function (err, result) {
                                if (err)
                                    throw err;
                            });
                    } else if(secData.compB == ''){
                        connection.query("INSERT INTO " + database + " . " + dbConfig.quote_section_table + " SET sectionNum = ?, compA = ?, compB = ?, compC = ?, compD = ?, quoteID = ?, layoutNum = ?",
                            [secData.sectionNum, secData.compA, null, secData.compC, secData.compD, secData.quoteID, secData.layoutNum], function (err, result) {
                                if (err)
                                    throw err;
                            });
                    } else if(secData.compC == ''){
                        connection.query("INSERT INTO " + database + " . " + dbConfig.quote_section_table + " SET sectionNum = ?, compA = ?, compB = ?, compC = ?, compD = ?, quoteID = ?, layoutNum = ?",
                            [secData.sectionNum, secData.compA, secData.compB, null, secData.compD, secData.quoteID, secData.layoutNum], function (err, result) {
                                if (err)
                                    throw err;
                            });
                    } else if(secData.compD == ''){
                        connection.query("INSERT INTO " + database + " . " + dbConfig.quote_section_table + " SET sectionNum = ?, compA = ?, compB = ?, compC = ?, compD = ?, quoteID = ?, layoutNum = ?",
                            [secData.sectionNum, secData.compA, secData.compB, secData.compC, null, secData.quoteID, secData.layoutNum], function (err, result) {
                                if (err)
                                    throw err;
                            });
                    }else {
                        connection.query("INSERT INTO " + database + " . " + dbConfig.quote_section_table + " SET ?", secData, function (err, result) {
                            if (err)
                                throw err;
                        });
                    }
                } else {
                    if(secData.compA == ''){
                        connection.query("UPDATE " + database + " . " + dbConfig.quote_section_table + " SET compA = ?, compB = ?, compC = ?, compD = ? WHERE secID = ?",
                            [null, secData.compB, secData.compC, secData.compD, result[0].secID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                    } else if(secData.compB == ''){
                        connection.query("UPDATE " + database + " . " + dbConfig.quote_section_table + " SET compA = ?, compB = ?, compC = ?, compD = ? WHERE secID = ?",
                            [secData.compA, null, secData.compC, secData.compD, result[0].secID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                    } else if(secData.compC == ''){
                        connection.query("UPDATE " + database + " . " + dbConfig.quote_section_table + " SET compA = ?, compB = ?, compC = ?, compD = ? WHERE secID = ?",
                            [secData.compA, secData.compB, null, secData.compD, result[0].secID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                    } else if(secData.compD == ''){
                        connection.query("UPDATE " + database + " . " + dbConfig.quote_section_table + " SET compA = ?, compB = ?, compC = ?, compD = ? WHERE secID = ?",
                            [secData.compA, secData.compB, secData.compC, null, result[0].secID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                    }else {
                        connection.query("UPDATE " + database + "." + dbConfig.quote_section_table + " SET compA = ?, compB = ?, compC = ?, compD = ? WHERE secID = ?",
                            [secData.compA, secData.compB, secData.compC, secData.compD, result[0].secID], function (err, result) {
                                if (err)
                                    throw err;
                            });
                    }
                }
            });

        }
        connection.query("SELECT * FROM " + database + "." + dbConfig.quote_summary_table + " WHERE quoteID = ?", req.body.quoteID[0], function (err, result) {
            if (err)
                console.log("Error Selecting : %s ", err);
            var quoteNum = result[0].quoteNum;
            var revNum = result[0].revNum;

            res.locals = {title: 'Save Section'};
            res.redirect('../quoteDetail/?quoteID=' + quoteNum + "_" + revNum);
        });
    });
};
