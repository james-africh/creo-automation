let mysql = require('mysql');
let dbConfig = require('../app/config/database');
let host = dbConfig.connection.host;
let user = dbConfig.connection.user;
let password = dbConfig.connection.password;
let database = dbConfig.database;
let port = dbConfig.connection.port;

let connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
    port : port,
    multipleStatements: true,
});


connection.query('DROP SCHEMA IF EXISTS ' + dbConfig.database, function(err,rows) { if(err) throw err; }); // DROPS RESIDUAL DATABASE/TABLES

connection.query('CREATE DATABASE ' + dbConfig.database, function(err,rows) { if(err) throw err; }); // CREATES SAI_db SCHEMA

connection.query('USE ' + dbConfig.database, function(err,rows) { if(err) throw err; });

// ********************************************************************************** //
// ******************** PRE-LOADED STATIC TABLES (SHARED B/W APPS) ****************** //
// ********************************************************************************** //
/*
// userPermissions
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.permissions_table + ' ( \
    idPermission INT NOT NULL AUTO_INCREMENT, \
    permission VARCHAR(10) NULL, \
    PRIMARY KEY (idPermission), \
    UNIQUE INDEX idPermission_UNIQUE (idPermission ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });
connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.permissions_table+" (permission) VALUES " +
    "('BASIC'), ('SUPERVISOR'), ('ADMIN') ", function (err, result) {
    if (err)
        console.log("Error inserting : %s ", err);
});

// jobscopeCatCodes
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.jobscope_codes_table + ' ( \
    idCode INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    catCode VARCHAR(12) NOT NULL, \
    PRIMARY KEY (idCode), \
    UNIQUE INDEX idCode_UNIQUE (idCode ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });
connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.jobscope_codes_table+" (catCode) VALUES " +
    "('01-STEEL'), ('02-COPPER'), ('06-WIRE'), ('12-ACC'), ('25-TRN CON'), ('26-METER'), ('27-FUSE'), ('28-KIRK'), " +
    "('30-LUGS'), ('31-GEN CON'), ('33-PLC'), ('34-INS TRN'), ('35-POW TRN'), ('36-CB MC'), ('37-CB IC'), " +
    "('38-DISC SW'), ('39-MV GEAR'), ('40-PANEL'), ('41-TVSS'), ('42-PROT RLY'), ('43-COMP HW'), ('44-COMP SW'), " +
    "('84-MISC'), ('92-BUYOUT'), ('96-OUTSVC'), ('98-ENGOUT') ", function (err, result) {
    if (err)
        console.log("Error inserting : %s ", err);
});*/

// layoutParamTypes
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.layout_paramTypes_table + ' ( \
    dropdownID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    dropdownType VARCHAR(100) NULL,\
    dropdownValue VARCHAR(100) NULL,\
    PRIMARY KEY (dropdownID), \
    UNIQUE INDEX dropdownID_UNIQUE (dropdownID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.layout_paramTypes_table+" (dropdownType, dropdownValue) VALUES " +

    //ulListing
    "('ulListing', 'UL891'), " +
    "('ulListing', 'UL1558'), " +
    "('ulListing', 'UL/ANSI'), " +

    //systemType
    "('systemType', '208Y/120VAC - 3PH, 4W'), " +
    "('systemType', '240VAC - 3PH, 3W'), " +
    "('systemType', '380Y/220VAC - 3PH, 4W'), " +
    "('systemType', '400Y/230VAC - 3PH, 4W'), " +
    "('systemType', '415Y/240VAC - 3PH, 4W'), " +
    "('systemType', '480VAC - 3PH, 3W'), " +
    "('systemType', '480Y/277VAC - 3PH, 4W'), " +
    "('systemType', '600VAC - 3PH, 3W'), " +
    "('systemType', '600Y/347VAC - 3PH, 4W'), " +
    "('systemType', '500VDC - 2W'), " +
    "('systemType', '600VDC - 2W'), " +
    "('systemType', '4160VAC - 3PH, 3W'), " +
    "('systemType', '12470VAC - 3PH, 3W'), " +
    "('systemType', '13200VAC - 3PH, 3W'), " +
    "('systemType', '13800VAC - 3PH, 3W'), " +

    //enclosure
    "('enclosure', 'NEMA 1'), " +
    "('enclosure', 'NEMA 3R'), " +

    //accessibility
    "('accessibility', 'FRONT AND REAR'), " +
    "('accessibility', 'FRONT AND SIDE'), " +
    "('accessibility', 'FRONT ONLY'), " +

    //cableAccess
    "('cableAccess', 'TOP'), " +
    "('cableAccess', 'BOTTOM'), " +
    "('cableAccess', 'TOP OR BOTTOM'), " +
    "('cableAccess', 'N/A'), " +

    //paint
    "('paint', 'ANSI 61'), " +
    "('paint', 'RAL 7035'), " +

    //systemAmp
    "('systemAmp', '800A'), " +
    "('systemAmp', '1200A'), " +
    "('systemAmp', '1600A'), " +
    "('systemAmp', '2000A'), " +
    "('systemAmp', '2500A'), " +
    "('systemAmp', '3000A'), " +
    "('systemAmp', '3200A'), " +
    "('systemAmp', '4000A'), " +
    "('systemAmp', '5000A'), " +
    "('systemAmp', '6000A'), " +
    "('systemAmp', '10000A'), " +

    //mainBusAmp
    "('mainBusAmp', '800A'), " +
    "('mainBusAmp', '1200A'), " +
    "('mainBusAmp', '1600A'), " +
    "('mainBusAmp', '2000A'), " +
    "('mainBusAmp', '2500A'), " +
    "('mainBusAmp', '3000A'), " +
    "('mainBusAmp', '3200A'), " +
    "('mainBusAmp', '4000A'), " +
    "('mainBusAmp', '5000A'), " +
    "('mainBusAmp', '6000A'), " +
    "('mainBusAmp', '10000A'), " +

    //Bus Bracing
    "('busBracing', '65kA'), " +
    "('busBracing', '100kA'), " +
    "('busBracing', '31.5kA'), " +

    //interruptRating
    "('interruptRating', '42kAIC'), " +
    "('interruptRating', '65kAIC'), " +
    "('interruptRating', '85kAIC'), " +
    "('interruptRating', '100kAIC'), " +
    "('interruptRating', '31.5kAIC'), " +

    //busType
    "('busType', 'SILVER PLATED COPPER'), " +
    "('busType', 'TIN PLATED COPPER'), " +

    //iccbPlatform
    "('iccbPlatform', 'SQUARE D MASTERPACT NW'), " +
    "('iccbPlatform', 'SIEMENS WL'), " +
    "('iccbPlatform', 'EATON MAGNUM DS'), " +
    "('iccbPlatform', 'EATON MAGNUM SB'), " +
    "('iccbPlatform', 'EATON NRX'), " +
    "('iccbPlatform', 'ABB EMAX2'), " +
    "('iccbPlatform', 'LSIS SUSOL'), " +

    //mccbPlatform
    "('mccbPlatform', 'SQUARE D POWERPACT'), " +
    "('mccbPlatform', 'SIEMENS VL'), " +
    "('mccbPlatform', 'EATON POWER DEFENSE'), " +
    "('mccbPlatform', 'ABB TMAX'), " +
    "('mccbPlatform', 'LSIS SUSOL'), " +

    //vcbPlatform
    "('vcbPlatform', 'ABB VD4'), " +

    //keyInterlocks
    "('keyInterlocks', 'SCHEME 29'), " +
    "('keyInterlocks', 'SCHEME 39'), " +
    "('keyInterlocks', 'SCHEME 29/39'), " +
    "('keyInterlocks', 'SCHEME 40'), " +
    "('keyInterlocks', 'OTHER'), " +
    "('keyInterlocks', 'N/A'); ", function (err, result) { if(err) throw err; });


// layoutParamRestrictions
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.layout_paramType_restrictions + ' ( \
    dropdownID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    dropdownType VARCHAR(100) NULL,\
    dropdownValue VARCHAR(100) NULL,\
    dropdownRestrictions JSON NULL,\
    PRIMARY KEY (dropdownID), \
    UNIQUE INDEX dropdownID_UNIQUE (dropdownID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });
connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.layout_paramType_restrictions+" (dropdownType, dropdownValue, dropdownRestrictions) VALUES " +

    //Restrictions due to 891 UL Listing
    "('ulListing', 'UL891', '{" +
    "\"systemType\": [\"208Y/120VAC - 3PH, 4W\", \"240VAC - 3PH, 3W\", \"380Y/220VAC - 3PH, 4W\", " +
    "\"400Y/230VAC - 3PH, 4W\", \"415Y/240VAC - 3PH, 4W\", \"480VAC - 3PH, 3W\", \"480Y/277VAC - 3PH, 4W\", " +
    "\"600VAC - 3PH, 3W\", \"600Y/347VAC - 3PH, 4W\", \"500VDC - 2W\", \"600VDC - 2W\"], " +
    "\"systemAmp\": [\"800A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\", \"5000A\", \"6000A\", \"10000A\"], " +
    "\"mainBusAmp\": [\"800A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\", \"5000A\", \"6000A\", \"10000A\"], " +
    "\"busBracing\": [\"65kA\", \"100kA\"], " +
    "\"interruptRating\": [\"42kAIC\", \"65kAIC\", \"85kAIC\", \"100kAIC\"], " +
    "\"enclosure\": [\"NEMA 1\", \"NEMA 3R\"], " +
    "\"accessibility\": [\"FRONT AND REAR\", \"FRONT AND SIDE\", \"FRONT ONLY\"], " +
    "\"cableEntry\": [\"TOP\", \"BOTTOM\", \"TOP OR BOTTOM\"], " +
    "\"iccbPlatform\": [\"SQUARE D MASTERPACT NW\", \"SIEMENS WL\", \"EATON MAGNUM DS\", \"EATON MAGNUM SB\", \"EATON NRX\", \"ABB EMAX2\", \"LSIS SUSOL\"], " +
    "\"mccbPlatform\": [\"SQUARE D POWERPACT\", \"SIEMENS VL\", \"EATON POWER DEFENSE\", \"ABB TMAX\", \"LSIS SUSOL\"], " +
    "\"vcbPlatform\": [] " +
    "}'), " +

    //Restrictions due to 1558 UL Listing
    "('ulListing', 'UL1558', '{" +
    "\"systemType\": [\"208Y/120VAC - 3PH, 4W\", \"240VAC - 3PH, 3W\", \"380Y/220VAC - 3PH, 4W\", " +
    "\"400Y/230VAC - 3PH, 4W\", \"415Y/240VAC - 3PH, 4W\", \"480VAC - 3PH, 3W\", \"480Y/277VAC - 3PH, 4W\", " +
    "\"600VAC - 3PH, 3W\", \"600Y/347VAC - 3PH, 4W\", \"500VDC - 2W\", \"600VDC - 2W\"], " +
    "\"systemAmp\": [\"800A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\", \"5000A\", \"6000A\", \"10000A\"], " +
    "\"mainBusAmp\": [\"800A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\", \"5000A\", \"6000A\", \"10000A\"], " +
    "\"busBracing\": [\"65kA\", \"100kA\"], " +
    "\"interruptRating\": [\"42kAIC\", \"65kAIC\", \"85kAIC\", \"100kAIC\"], " +
    "\"enclosure\": [\"NEMA 1\"], " +
    "\"accessibility\": [\"FRONT AND REAR\"], " +
    "\"cableEntry\": [\"TOP\", \"BOTTOM\", \"TOP OR BOTTOM\"], " +
    "\"iccbPlatform\": [\"SQUARE D MASTERPACT NW\", \"SIEMENS WL\", \"EATON MAGNUM DS\", \"ABB EMAX2\", \"LSIS SUSOL\"], " +
    "\"mccbPlatform\": [], " +
    "\"vcbPlatform\": [] " +
    "}'), " +

    //Restrictions due to UL/ANSI (MV) UL Listing
    "('ulListing', 'UL/ANSI', '{" +
    "\"systemType\": [\"4160VAC - 3PH, 3W\", \"12470VAC - 3PH, 3W\", \"13200VAC - 3PH, 3W\", \"13800VAC - 3PH, 3W\"], " +
    "\"systemAmp\": [\"1200A\", \"2000A\"], " +
    "\"mainBusAmp\": [\"1200A\", \"2000A\"], " +
    "\"busBracing\": [\"31.5kA\"], " +
    "\"interruptRating\": [\"31.5kAIC\"], " +
    "\"enclosure\": [\"NEMA 1\"], " +
    "\"accessibility\": [\"FRONT AND REAR\"], " +
    "\"cableEntry\": [\"TOP\", \"BOTTOM\"], " +
    "\"iccbPlatform\": [], " +
    "\"mccbPlatform\": [], " +
    "\"vcbPlatform\": [\"ABB VD4\"] " +
    "}'), " +

    //Restrictions due to NEMA 3R Enclosure (only in UL891)
    "('enclosure', 'NEMA 1', '{" +
    "\"systemAmp\": [\"800A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\", \"5000A\", \"6000A\", \"10000A\"], " +
    "\"mainBusAmp\": [\"800A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\", \"5000A\", \"6000A\", \"10000A\"] " +
    "}'), " +
    "('enclosure', 'NEMA 3R', '{" +
    "\"systemAmp\": [\"800A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\"], " +
    "\"mainBusAmp\": [\"800A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\"] " +
    "}') "

    , function (err, result) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);



// sectionType
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.secType_table + ' ( \
    secTypeID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    type VARCHAR(100) NULL, \
    PRIMARY KEY (secTypeID), \
    UNIQUE INDEX secTypeID_UNIQUE (secTypeID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });


connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.secType_table+" (type) VALUES " +
    "('SWITCHGEAR - UL1558'), " +
    "('SWITCHBOARD - UL891'), " +
    "('PANELBOARD - MAIN LUG (T)'), " +
    "('PANELBOARD - MAIN LUG (B)'), " +
    "('PANELBOARD - NO MAIN LUG'), " +
    "('CONTROL'), " +
    "('PASSTHROUGH'), " +
    "('XFMR'), " +
    "('BOLTSWITCH'), " +
    "('DC DISCONNECT'), " +
    "('UTILITY METERING'); ", function (err, result) { if(err) throw err; });


// brkType
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.brkType_table + ' ( \
    brkTypeID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    type VARCHAR(100) NULL, \
    PRIMARY KEY (brkTypeID), \
    UNIQUE INDEX brkTypeID_UNIQUE (brkTypeID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });


connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.brkType_table+" (type) VALUES " +
    "('MASTERPACT NW (SQUARE D) - FIXED'), " +
    "('MASTERPACT NW (SQUARE D) - DRAWOUT'), " +
    "('POWERPACT (SQUARE D)'), " +
    "('TMAX (ABB)'); ", function (err, result) { if(err) throw err; });



// brkAccOptions
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.brkAcc_options_table + ' (\
        brkAccDropdownID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
        brkAcc VARCHAR(100) NULL, \
        brkAccName VARCHAR(100) NULL, \
        brkAccOpt VARCHAR(100) NULL, \
        brkAccNameCode VARCHAR(100) NULL, \
        brkAccOptCode VARCHAR(100) NULL, \
        PRIMARY KEY (brkAccDropdownID), \
        UNIQUE INDEX brkAccDropdownID_UNIQUE (brkAccDropdownID ASC))\
        ENGINE = InnoDB;', function(err){ if(err) throw err; });

let quoteBrkAccData = [
    {brkAcc: "shuntTrip", brkAccName: "Shunt Trip", brkAccOpt: ["110-127VAC/DC 100% DUTY", "24VDC 100% DUTY", "48VDC 100% DUTY"], brkAccNameCode: "ST", brkAccOptCode: ["120VAC/DC", "24VDC", "48VDC"]},
    {brkAcc: "motor", brkAccName: "Spring Charge Motor",  brkAccOpt: ["110-125VAC 3s" , "110-125VDC 3s" , "24VDC 3s" , "48VDC 3s"], brkAccNameCode: "SCM", brkAccOptCode: ["120VAC", "120VDC", "24VDC", "48VDC"]},
    {brkAcc: "springReleaseDevice", brkAccName: "Closing Coil",  brkAccOpt: ["110-127VAC/DC" , "24VDC" , "48VDC"], brkAccNameCode: "CC", brkAccOptCode: ["120VAC/DC", "24VDC", "48VDC"]},
    {brkAcc: "undervoltageTrip", brkAccName: "UV Trip",  brkAccOpt: ["110-127VAC/DC 100% DUTY", "24VDC 100% DUTY", "48VDC 100% DUTY"], brkAccNameCode: "UVR", brkAccOptCode: ["120VAC/DC", "24VDC", "48VDC"]},
    {brkAcc: "secondShuntTrip", brkAccName: "2nd Shunt Trip",  brkAccOpt: ["110-127VAC/DC 100% DUTY", "24VDC 100% DUTY", "48VDC 100% DUTY"], brkAccNameCode: "SST", brkAccOptCode: ["120VAC/DC", "24VDC", "48VDC"]},
    {brkAcc: "auxSwitch", brkAccName: "Aux Switch",  brkAccOpt: ["1", "2" , "4" , "6" , "8" , "10" , "12"], brkAccNameCode: "AUX", brkAccOptCode: ["1", "2", "4", "6", "8", "10", "12"]},
    {brkAcc: "cradleContacts", brkAccName: "Cradle Contacts",  brkAccOpt: ["3C,3T,3D" , "6C,3T,0D" , "9C,0T,0D" , "3C,0T,6D"], brkAccNameCode: "CRC", brkAccOptCode: ["3C,3T,3D" , "6C,3T,0D" , "9C,0T,0D" , "3C,0T,6D"]},
    {brkAcc: "bellAlarm", brkAccName: "Bell Alarm",  brkAccOpt: [], brkAccNameCode: "BA", brkAccOptCode: []},
    {brkAcc: "padlock", brkAccName: "Padlock Provision",  brkAccOpt: [], brkAccNameCode: "PD", brkAccOptCode: []},
    {brkAcc: "comms", brkAccName: "Communications",  brkAccOpt: [], brkAccNameCode: "COM", brkAccOptCode: []},
    {brkAcc: "maintenanceMode", brkAccName: "Maintenance Mode", brkAccOpt: [], brkAccNameCode: "MM", brkAccOptCode: []},
    {brkAcc: "kirkKeyProvisions", brkAccName: "Kirk Key Provision",  brkAccOpt: [], brkAccNameCode: "KK", brkAccOptCode: []},
    {brkAcc: "safetyShutters", brkAccName: "Safety Shutters",  brkAccOpt: [], brkAccNameCode: "SS", brkAccOptCode: []},
    {brkAcc: "pushButtonCover", brkAccName: "Push-button Cover",  brkAccOpt: [], brkAccNameCode: "PB", brkAccOptCode: []},
    {brkAcc: "operationsCounter", brkAccName: "Operations Counter",  brkAccOpt: [], brkAccNameCode: "OC", brkAccOptCode: []},
    {brkAcc: "mechTripIndicator", brkAccName: "Mechanical Trip Indicator",  brkAccOpt: [], brkAccNameCode: "MTI", brkAccOptCode: []},
    {brkAcc: "mechInterlock", brkAccName: "Mechanical Interlock",  brkAccOpt: [], brkAccNameCode: "MI", brkAccOptCode: []},
    {brkAcc: "remoteReset", brkAccName: "Remote Reset",  brkAccOpt: [], brkAccNameCode: "RR", brkAccOptCode: []},
    {brkAcc: "breakerReadyToClose", brkAccName: "Ready to Close",  brkAccOpt: [], brkAccNameCode: "RC", brkAccOptCode: []},
    {brkAcc: "meteringForTripUnit", brkAccName: "Trip Unit Metering",  brkAccOpt: [], brkAccNameCode: "TUM", brkAccOptCode: []},
    {brkAcc: "latchCheck", brkAccName: "Latch Check Switch",  brkAccOpt: [], brkAccNameCode: "LCS", brkAccOptCode: []},
    {brkAcc: "secondaryTerminalBlocks", brkAccName: "Secondary Terminal Blocks",  brkAccOpt: [], brkAccNameCode: "STB", brkAccOptCode: []}
];

for (let i = 0; i < quoteBrkAccData.length; i++) {
    if (quoteBrkAccData[i].brkAccOpt.length != 0) {
        for (let j = 0; j < quoteBrkAccData[i].brkAccOpt.length; j++) {
            connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.brkAcc_options_table + " (brkAcc, brkAccName, brkAccOpt, brkAccNameCode, brkAccOptCode) VALUES (?,?,?,?,?)", [quoteBrkAccData[i].brkAcc, quoteBrkAccData[i].brkAccName, quoteBrkAccData[i].brkAccOpt[j], quoteBrkAccData[i].brkAccNameCode, quoteBrkAccData[i].brkAccOptCode[j]]);
        }
    } else {
        connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.brkAcc_options_table + " (brkAcc, brkAccName, brkAccOpt, brkAccNameCode, brkAccOptCode) VALUES (?,?,?,?,?)", [quoteBrkAccData[i].brkAcc, quoteBrkAccData[i].brkAccName, null, quoteBrkAccData[i].brkAccNameCode, null]);
    }
}


//controlAsmSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.control_assemblies_table + ' ( \
    cktID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    cktName VARCHAR(100) NULL, \
    extCost DOUBLE NULL, \
    hrsEE DOUBLE NULL, \
    hrsTEST DOUBLE NULL, \
    hrsPROG DOUBLE NULL, \
    numWires INT NULL, \
    PRIMARY KEY (cktID), \
    UNIQUE INDEX cktID_UNIQUE (cktID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });


//controlItemSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.control_items_table + ' ( \
    ctlItemID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    cktID INT UNSIGNED NULL, \
    itemDesc VARCHAR(100) NULL, \
    itemPN VARCHAR(100) NULL, \
    unitCost DOUBLE UNSIGNED NULL, \
    qty INT UNSIGNED NULL,\
    catCode VARCHAR(100), \
    PRIMARY KEY (ctlItemID), \
    CONSTRAINT fk_controlAsmItem \
    FOREIGN KEY (cktID) \
        REFERENCES controlAsmSum(cktID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_controlItemCatCode \
    UNIQUE INDEX ctlItemID_UNIQUE (ctlItemID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });


// ********************************************************************************** //
// *************************** STANDARD DESIGN TABLES ******************************* //
// ********************************************************************************** //

// panelboardAmpType
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.panelboard_amp_type + '( \
    panelboardAmpTypeID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    type INT NULL, \
    min INT NULL, \
    max INT NULL, \
    PRIMARY KEY (panelboardAmpTypeID), \
    UNIQUE INDEX panelboardAmpTypeID_UNIQUE (panelboardAmpTypeID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.panelboard_amp_type + " (type, min, max) VALUES " +
    "(1,0,600), " +
    "(2,601,1200), " +
    "(3,1201,1800)", function (err) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

// basePanelCopper3W
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.base_panel_copper_3W + '( \
    copper3WID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    intXSize INT NULL, \
    intIN DECIMAL(5,2) NULL, \
    type1 INT NULL, \
    type2 INT NULL, \
    type3 INT NULL, \
    PRIMARY KEY (copper3WID), \
    UNIQUE INDEX copper3WID_UNIQUE (copper3WID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.base_panel_copper_3W + " (intXSize, intIN, type1, type2, type3) VALUES " +
    "(12, 16.5, 11, 21, 31), " +
    "(24, 33, 21, 42, 62), " +
    "(30, 41.25, 26, 52, 78), " +
    "(36, 49.5, 31, 62, 93), " +
    "(42, 57.75, 37, 73, 109), " +
    "(48, 66, 42, 83, 124)", function (err) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

// basePanelCopper4W
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.base_panel_copper_4W + '( \
    copper4WID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    intXSize INT NULL, \
    intIN DECIMAL(5,2) NULL, \
    type1 INT NULL, \
    type2 INT NULL, \
    type3 INT NULL, \
    PRIMARY KEY (copper4WID), \
    UNIQUE INDEX copper4WID_UNIQUE (copper4WID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.base_panel_copper_4W + " (intXSize, intIN, type1, type2, type3) VALUES " +
    "(12, 16.5, 14, 28, 42), " +
    "(24, 33, 28, 55, 83), " +
    "(30, 41.25, 35, 69, 104), " +
    "(36, 49.5, 42, 83, 124), " +
    "(42, 57.75, 49, 97, 145), " +
    "(48, 66, 55, 110, 165)", function (err) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

// addCopperPerPanel3WType
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.add_Copper_Per_Panel_3WType + '( \
    addCopper3WID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    tieSpace VARCHAR(100) NULL, \
    type1 INT NULL, \
    type2 INT NULL, \
    type3 INT NULL, \
    PRIMARY KEY (addCopper3WID), \
    UNIQUE INDEX addCopper3WID_UNIQUE (addCopper3WID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.add_Copper_Per_Panel_3WType + " (tieSpace, type1, type2, type3) VALUES " +
    "('4X', 4, 7, 11), " +
    "('5X', 5, 9, 13), " +
    "('7X', 7, 13, 19)", function (err) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

// addCopperPerPanel4WType
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.add_Copper_Per_Panel_4WType + '( \
    addCopper4WID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    tieSpace VARCHAR(100) NULL, \
    type1 INT NULL, \
    type2 INT NULL, \
    type3 INT NULL, \
    PRIMARY KEY (addCopper4WID), \
    UNIQUE INDEX addCopper4WID_UNIQUE (addCopper4WID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.add_Copper_Per_Panel_4WType + " (tieSpace, type1, type2, type3) VALUES " +
    "('6X', 7, 14, 21), " +
    "('9X', 11, 21, 31)", function (err) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

// quoteSystemType
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_system_type + ' ( \
    systemTypeID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    systemType JSON NULL, \
    PRIMARY KEY (systemTypeID), \
    UNIQUE INDEX systemTypeID_UNIQUE (systemTypeID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.quote_system_type + " (systemType) VALUES " +
    "('{" +
    "\"3W\": [\"250A 3W\", \"600A 3W\", \"800A 3W\", \"1200A 3W\", \"1600A 3W\"], " +
    "\"4W\": [\"250A 4W\", \"600A 4W\", \"800A 4W\", \"1200A 4W\", \"1600A 4W\"]" +
    "}')"
    , function (err) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

// panelboardWidth3W
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.panelboard_width_3W + ' ( \
    panelboardWidth3WID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    systemType VARCHAR(100) NULL, \
    ENCL_W INT NULL, \
    maxBrk VARCHAR(100) NULL, \
    PRIMARY KEY (panelboardWidth3WID), \
    UNIQUE INDEX panelboardWidth3WID_UNIQUE (panelboardWidth3WID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.panelboard_width_3W + " (systemType, ENCL_W, maxBrk) VALUES " +
    "('250A 3W', 32, 'L FRAME(400A) single'), " +
    "('250A 3W', 38, 'L FRAME(600A) single'), " +
    "('800A 3W', 38, 'P FRAME(800A)'), " +
    "('1200A 3W', 42, 'P FRAME(1200A)'), " +
    "('1600A 3W', 42, 'P FRAME(1200A)')"
    , function (err) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

// panelboardWidth4W
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.panelboard_width_4W + ' ( \
    panelboardWidth4WID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    systemType VARCHAR(100) NULL, \
    ENCL_W VARCHAR(100) NULL, \
    maxBrk VARCHAR(100) NULL, \
    PRIMARY KEY (panelboardWidth4WID), \
    UNIQUE INDEX panelboardWidth4WID_UNIQUE (panelboardWidth4WID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.panelboard_width_4W + " (systemType, ENCL_W, maxBrk) VALUES " +
    "('250A 4W', 32, 'J FRAME'), " +
    "('250A 4W', 38, 'L FRAME(400A) double'), " +
    "('800A 4W', 38, 'P FRAME(800A)'), " +
    "('1200A 4W', 42, 'P FRAME(1200A)'), " +
    "('1600A 4W', 42, 'P FRAME(1200A)')"
    , function (err) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

// ********************************************************************************** //
// ********************************* USER TABLES ************************************ //
// ********************************************************************************** //

// userProfile
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.user_profile_table + ' ( \
    idProfile INT NOT NULL AUTO_INCREMENT, \
    FK_id INT UNSIGNED NOT NULL , \
    firstName VARCHAR(50) NULL, \
    lastName VARCHAR(50) NULL, \
    profilePic VARCHAR(100) NOT NULL DEFAULT "default.jpg",\
    email VARCHAR(100) NULL, \
    department VARCHAR(50) NULL, \
    role VARCHAR(100) NULL, \
    cell VARCHAR(20) NULL, \
    permissions INT NULL, \
    PRIMARY KEY (idProfile), \
    CONSTRAINT fk_userPermissions \
    FOREIGN KEY (permissions) \
        REFERENCES userPermissions(idPermission) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX idProfile_UNIQUE (idProfile ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


// ********************************************************************************** //
// **************** APPLICATIONS ENGINEERING QUOTE DATA TABLES ********************** //
// ********************************************************************************** //

//quoteSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_summary_table + ' ( \
    quoteID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteNum VARCHAR(100) NULL, \
    revNum VARCHAR(2) DEFAULT "00",\
    projName VARCHAR(100) NULL, \
    customer VARCHAR(100) NULL, \
    rep VARCHAR(100) NULL, \
    quoteNotes VARCHAR(1000) NULL, \
    createdBy VARCHAR(100) NULL, \
    PRIMARY KEY (quoteID), \
    UNIQUE INDEX quoteID_UNIQUE (quoteID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

//quoteRevSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_rev_table + ' ( \
    revID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NOT NULL, \
    revNum VARCHAR(2) DEFAULT "00", \
    revNote VARCHAR(100) NULL, \
    PRIMARY KEY (revID), \
    CONSTRAINT fk_quoteRev \
    FOREIGN KEY (quoteID) \
        REFERENCES quoteSum(quoteID), \
    UNIQUE INDEX revID_UNIQUE (revID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// quoteLayoutSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_layout_table + ' ( \
    layoutID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    layoutNum INT UNSIGNED NULL, \
    layoutName VARCHAR(100) NULL, \
    numSections INT NULL, \
    layoutType VARCHAR(100) NULL, \
    layoutUL VARCHAR(100) NULL, \
    layoutEnclosure VARCHAR(100) NULL, \
    layoutAccess VARCHAR(100) NULL, \
    layoutBusType VARCHAR(100) NULL, \
    layoutPaint VARCHAR(100) NULL,\
    layoutCabEntry VARCHAR(100) NULL, \
    layoutSystem VARCHAR(100) NULL, \
    systemAmp VARCHAR(100) NULL, \
    mainBusAmp VARCHAR(100) NULL, \
    busBracing VARCHAR(100) NULL, \
    interuptRating VARCHAR(100) NULL, \
    seismicCheck ENUM("Y","N") NOT NULL, \
    mimicCheck ENUM("Y","N") NOT NULL, \
    IRCheck ENUM("Y","N") NOT NULL, \
    wirewayCheck ENUM("Y","N") NOT NULL, \
    trolleyCheck ENUM("Y","N") NOT NULL, \
    PRIMARY KEY (layoutID), \
    CONSTRAINT fk_quoteLayout \
    FOREIGN KEY (quoteID) \
        REFERENCES quoteSum(quoteID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX layoutID_UNIQUE (layoutID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// quoteSectionSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_section_table + ' ( \
    secID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    layoutID INT UNSIGNED NULL, \
    sectionNum VARCHAR(100) NULL, \
    compType JSON NULL, \
    controlAsmID VARCHAR(100) NULL, \
    secType VARCHAR(100) NULL, \
    secHeight INT NULL, \
    secWidth INT NULL, \
    secDepth INT NULL, \
    PRIMARY KEY (secID), \
    CONSTRAINT fk_quoteLayoutSection \
    FOREIGN KEY (layoutID) \
        REFERENCES quoteLayoutSum(layoutID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX secID_UNIQUE (secID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// quoteBrkSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_breaker_table + ' ( \
    devID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    layoutID INT UNSIGNED NULL, \
    secID INT UNSIGNED NULL, \
    comp VARCHAR(4) NULL, \
    devDesignation VARCHAR(100) NULL, \
    tie VARCHAR(1) DEFAULT "N", \
    unitOfIssue VARCHAR(2) DEFAULT "EA", \
    catCode VARCHAR(12) NULL, \
    brkPN VARCHAR(100) NULL, \
    cradlePN VARCHAR(100) NULL, \
    devProduct VARCHAR(100) NULL, \
    devMfg VARCHAR(100) NULL, \
    devProdLine VARCHAR(100) NULL, \
    devMount VARCHAR(100) NULL, \
    rearAdaptType VARCHAR(100) NULL, \
    devUL VARCHAR(100) NULL, \
    devLevel VARCHAR(100) NULL, \
    devOperation VARCHAR(100) NULL, \
    devCtrlVolt VARCHAR(100) NULL, \
    devMaxVolt VARCHAR(100) NULL, \
    devKAIC VARCHAR(100) NULL, \
    devFrameSet VARCHAR(100) NULL, \
    devSensorSet VARCHAR(100) NULL, \
    devTripSet VARCHAR(100) NULL, \
    devTripUnit VARCHAR(100) NULL, \
    devTripParam VARCHAR(100) NULL, \
    devPoles VARCHAR(100) NULL,  \
    devLugQty VARCHAR(100) NULL,  \
    devLugType VARCHAR(100) NULL, \
    devLugSize VARCHAR(100) NULL, \
    devAcc VARCHAR(100) NULL, \
    PRIMARY KEY (devID), \
    CONSTRAINT fk_quoteLayoutBrk \
    FOREIGN KEY (layoutID) \
        REFERENCES quoteLayoutSum(layoutID) \
        ON DELETE SET NULL \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_quoteSectionBrk \
    FOREIGN KEY (secID) \
        REFERENCES quoteSectionSum(secID) \
        ON DELETE SET NULL \
        ON UPDATE CASCADE, \
    UNIQUE INDEX idDev_UNIQUE (devID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// quoteBrkAccSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_brkAcc_table + ' ( \
    brkAccID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    brkAccDropdownID INT UNSIGNED NULL,\
    devID INT UNSIGNED NULL,\
    PRIMARY KEY (brkAccID), \
    CONSTRAINT fk_quoteBrkAcc \
    FOREIGN KEY (devID) \
        REFERENCES quoteBrkSum(devID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_quoteBrkAccOptions \
    FOREIGN KEY (brkAccDropdownID) \
        REFERENCES brkAccOptions(brkAccDropdownID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX brkAccID_UNIQUE (brkAccID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// quoteComItem
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_common_items + ' ( \
    comItemID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    itemType VARCHAR(100) NULL, \
    itemMfg VARCHAR(100) NULL, \
    itemDesc VARCHAR(100) NULL, \
    itemPN VARCHAR(100) NULL, \
    unitOfIssue VARCHAR(100) NULL, \
    catCode VARCHAR(100) NULL, \
    price DECIMAL(12,2) NULL, \
    lastUpdatedPrice DATE NULL, \
    hrsEE DECIMAL(5,2) NULL, \
    hrsME DECIMAL(5,2) NULL, \
    hrsTEST DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    hrsWIRE DECIMAL(5,2) NULL, \
    PRIMARY KEY (comItemID), \
    UNIQUE INDEX itemID_UNIQUE (comItemID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// quoteUserItem
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_user_items + ' ( \
    userItemID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    itemType VARCHAR(100) NULL, \
    itemMfg VARCHAR(100) NULL, \
    itemDesc VARCHAR(100) NULL, \
    itemPN VARCHAR(100) NULL, \
    unitOfIssue VARCHAR(100) NULL, \
    catCode VARCHAR(100) NULL, \
    price DECIMAL(12,2) NULL, \
    hrsEE DECIMAL(5,2) NULL, \
    hrsME DECIMAL(5,2) NULL, \
    hrsTEST DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    hrsWIRE DECIMAL(5,2) NULL, \
    PRIMARY KEY (userItemID), \
    UNIQUE INDEX itemID_UNIQUE (userItemID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// quoteItemSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_item_table + ' ( \
    itemSumID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    layoutID INT UNSIGNED NULL, \
    secID INT UNSIGNED NULL, \
    comItemID INT UNSIGNED NULL, \
    userItemID INT UNSIGNED NULL, \
    itemQty INT UNSIGNED NULL, \
    comp VARCHAR(100) NULL, \
    PRIMARY KEY (itemSumID), \
    CONSTRAINT fk_quoteComItem \
    FOREIGN KEY (comItemID) \
        REFERENCES quoteComItem(comItemID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_quoteUserItem \
    FOREIGN KEY (userItemID) \
        REFERENCES quoteUserItem(userItemID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_quoteLayoutItem \
    FOREIGN KEY (layoutID) \
        REFERENCES quoteLayoutSum(layoutID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_quoteSectionItem \
    FOREIGN KEY (secID) \
        REFERENCES quoteSectionSum(secID) \
        ON DELETE SET NULL \
        ON UPDATE CASCADE, \
    UNIQUE INDEX itemSumID_UNIQUE (itemSumID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });


// quoteControlSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_control_sum + ' ( \
    ctlSumID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    layoutID INT UNSIGNED NULL, \
    secID INT UNSIGNED NULL, \
    cktID INT UNSIGNED NULL, \
    qty INT UNSIGNED NULL, \
    comp VARCHAR(100), \
    PRIMARY KEY (ctlSumID), \
    CONSTRAINT fk_quoteControlAsm \
    FOREIGN KEY (cktID) \
        REFERENCES controlAsmSum(cktID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_quoteLayoutControlAsm \
    FOREIGN KEY (layoutID) \
        REFERENCES quoteLayoutSum(layoutID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_quoteSectionControlAsm \
    FOREIGN KEY (secID) \
        REFERENCES quoteSectionSum(secID) \
        ON DELETE SET NULL \
        ON UPDATE CASCADE, \
    UNIQUE INDEX ctlSumID_UNIQUE (ctlSumID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// panelboardSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.panelboard_sum + ' ( \
    panelboardSumID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    layoutID INT UNSIGNED NULL, \
    secID INT UNSIGNED NULL, \
    lugQty INT UNSIGNED NULL, \
    systemType VARCHAR(100) NULL, \
    tieQty INT UNSIGNED NULL, \
    ctrlDev VARCHAR(100) NULL, \
    ctrlDevDim VARCHAR(100) NULL, \
    PRIMARY KEY (panelboardSumID), \
    CONSTRAINT fk_quoteLayoutPanel \
    FOREIGN KEY (layoutID) \
        REFERENCES quoteLayoutSum(layoutID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_quoteSectionPanel \
    FOREIGN KEY (secID) \
        REFERENCES quoteSectionSum(secID) \
        ON DELETE SET NULL \
        ON UPDATE CASCADE, \
    UNIQUE INDEX panelboardSumID_UNIQUE (panelboardSumID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });


// quotePartsLaborSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_parts_labor_table + ' ( \
    partsLaborID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    title VARCHAR(100) NULL, \
    partsLaborNum INT UNSIGNED NULL,\
    PRIMARY KEY (partsLaborID), \
    CONSTRAINT fk_quotePartsLabor \
    FOREIGN KEY (quoteID) \
        REFERENCES quoteSum(quoteID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX partsLaborID_UNIQUE (partsLaborID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// quoteFieldServiceSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_field_service_table + ' ( \
    fieldServiceID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    title VARCHAR(100) NULL, \
    fieldServiceNum INT NULL,\
    technicians DOUBLE NULL, \
    numberOfTrips DOUBLE NULL, \
    travelLaborDays DOUBLE NULL, \
    regularTimeDays DOUBLE NULL, \
    overTimeDays DOUBLE NULL, \
    holidaysTimeDays DOUBLE NULL, \
    mealExpense DOUBLE NULL, \
    hotelExpense DOUBLE NULL, \
    flying VARCHAR(100) NULL, \
    airfare DOUBLE NULL, \
    parkingExpense DOUBLE NULL, \
    rentalCarExpense DOUBLE NULL, \
    driving VARCHAR(100) NULL, \
    numberOfMiles DOUBLE NULL, \
    carMileageCost DOUBLE NULL, \
    remarks VARCHAR(250) NULL, \
    total DOUBLE NULL, \
    PRIMARY KEY (fieldServiceID), \
    CONSTRAINT fk_quoteFieldService \
    FOREIGN KEY (quoteID) \
        REFERENCES quoteSum(quoteID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX fieldServiceID_UNIQUE (fieldServiceID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// quoteFreightSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_freight_table + ' ( \
    freightID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    title VARCHAR(100) NULL, \
    freightNum INT UNSIGNED NULL, \
    standardTruck VARCHAR(100) NULL, \
    flatbedTruck VARCHAR(100) NULL, \
    stepDeckTruck VARCHAR(100) NULL, \
    height DOUBLE UNSIGNED NULL, \
    width DOUBLE UNSIGNED NULL, \
    depth DOUBLE UNSIGNED NULL, \
    weight DOUBLE UNSIGNED NULL, \
    surroundingStates VARCHAR(100) NULL, \
    eastCoast VARCHAR(100) NULL, \
    westCoast VARCHAR(100) NULL, \
    truckCost DOUBLE UNSIGNED NULL,\
    truckCostOverride VARCHAR(100) NULL,\
    numOfTrucks DOUBLE UNSIGNED NULL,\
    remarks VARCHAR(250),\
    total DOUBLE UNSIGNED NULL,\
    totalOverride VARCHAR(100) NULL, \
    PRIMARY KEY (freightID), \
    CONSTRAINT fk_quoteFreight \
    FOREIGN KEY (quoteID) \
        REFERENCES quoteSum(quoteID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX freightID_UNIQUE (freightID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// quoteWarrantySum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_warranty_table + ' ( \
    warrantyID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    title VARCHAR(100) NULL, \
    warrantyNum INT UNSIGNED NULL, \
    PRIMARY KEY (warrantyID), \
    CONSTRAINT fk_quoteWarranty \
    FOREIGN KEY (quoteID) \
        REFERENCES quoteSum(quoteID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX warrantyID_UNIQUE (warrantyID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


// ********************************************************************************** //
// **************** APPLICATIONS ENGINEERING QUOTE PRICING TABLES ******************* //
// ********************************************************************************** //

// matCost
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_matCost + ' ( \
    matCostID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    matType VARCHAR(100) NULL, \
    cost DECIMAL(5,2) NULL,\
    PRIMARY KEY (matCostID), \
    UNIQUE INDEX matCostID_UNIQUE (matCostID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// density
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_density + ' ( \
    densityID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    densityType VARCHAR(100) NULL, \
    cost DECIMAL(5,2) NULL,\
    PRIMARY KEY (densityID), \
    UNIQUE INDEX densityID_UNIQUE (densityID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// nemaTypes
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_nemaTypes + ' ( \
    nemaTypeID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    ratingENCL VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL,\
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    cornerPosts INT UNSIGNED NULL, \
    outerDoors INT UNSIGNED NULL, \
    gasketed BOOLEAN NULL, \
    roof INT UNSIGNED NULL, \
    bases INT UNSIGNED NULL, \
    frontRearCovers INT UNSIGNED NULL, \
    sideCoversSheets INT UNSIGNED NULL, \
    topBottomPlates INT UNSIGNED NULL, \
    glasticSideSheet INT UNSIGNED NULL, \
    PRIMARY KEY (nemaTypeID), \
    UNIQUE INDEX nemaTypeID_UNIQUE (nemaTypeID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

//trolleyTrackPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_trolleyTrack + ' ( \
    trolleyTrackID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    trolleyTrack VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    frontTrack DECIMAL(5,2) NULL, \
    rearTrack DECIMAL(5,2) NULL, \
    PRIMARY KEY (trolleyTrackID), \
    UNIQUE INDEX trolleyTrackID_UNIQUE (trolleyTrackID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

//mimicBusPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_mimicBus + ' ( \
    mimicBusID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    mimicBus VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (mimicBusID), \
    UNIQUE INDEX mimicBusID_UNIQUE (mimicBusID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// fanHoodsPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_fanHoods + ' ( \
    fanHoodsID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    fanHoods VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (fanHoodsID), \
    UNIQUE INDEX fanHoodsID_UNIQUE (fanHoodsID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// rearBarrierPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_rearBarrier + ' ( \
    rearBarrierID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    rearBarrier VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (rearBarrierID), \
    UNIQUE INDEX rearBarrierID_UNIQUE (rearBarrierID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// controlCubPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_controlCub + ' ( \
    controlCubID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    controlCub VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (controlCubID), \
    UNIQUE INDEX controlCubID_UNIQUE (controlCubID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// seismicPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_seismic + ' ( \
    seismicID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    seismicBracing VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (seismicID), \
    UNIQUE INDEX seismicID_UNIQUE (seismicID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// iccbCompPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_iccbComp + ' ( \
    iccbCompID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    iccbComp VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (iccbCompID), \
    UNIQUE INDEX iccbCompID_UNIQUE (iccbCompID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// mccbCompPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_mccbComp + ' ( \
    mccbCompID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    indMCCB VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (mccbCompID), \
    UNIQUE INDEX mccbCompID_UNIQUE (mccbCompID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// panelPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_panel + ' ( \
    panelID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    panelInteriorSWBD VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (panelID), \
    UNIQUE INDEX panelID_UNIQUE (panelID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// tvssPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_tvss + ' ( \
    tvssID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    tvssMount VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (tvssID), \
    UNIQUE INDEX tvssID_UNIQUE (tvssID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// ctPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_ct + ' ( \
    ctID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    ctMount VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (ctID), \
    UNIQUE INDEX ctID_UNIQUE (ctID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

//ptPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_pt + ' ( \
    ptID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    ptMount VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (ptID), \
    UNIQUE INDEX ptID_UNIQUE (ptID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// sectionPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_section + ' ( \
    sectionID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    enclosureType VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (sectionID), \
    UNIQUE INDEX sectionID_UNIQUE (sectionID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// accessPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_access + ' ( \
    accessID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    accessibility VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (accessID), \
    UNIQUE INDEX accessID_UNIQUE (accessID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// copperPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_copperTypes + ' ( \
    copperTypesID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    copperType VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (copperTypesID), \
    UNIQUE INDEX copperTypesID_UNIQUE (copperTypesID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// bracingPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_bracingTypes + ' ( \
    bracingTypesID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    bracing VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    hrsENG DECIMAL(5,2) NULL, \
    hrsFAB DECIMAL(5,2) NULL, \
    hrsASSY DECIMAL(5,2) NULL, \
    PRIMARY KEY (bracingTypesID), \
    UNIQUE INDEX bracingTypesID_UNIQUE (bracingTypesID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// secBusPricing
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_secBusType + ' ( \
    secBusTypeID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    secBusType VARCHAR(100) NULL, \
    length DECIMAL(5,2) NULL, \
    PRIMARY KEY (secBusTypeID), \
    UNIQUE INDEX secBusTypeID_UNIQUE (secBusTypeID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// laborRates
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quotePricing_laborRates + ' ( \
    laborRatesID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    laborInputs VARCHAR(100) NULL, \
    MATL DECIMAL(5,2) NULL, \
    PRIMARY KEY (laborRatesID), \
    UNIQUE INDEX laborRatesID_UNIQUE (laborRatesID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });


// ********************************************************************************** //
// ********************* MECHANICAL ENGINEERING MBOM TABLES ************************* //
// ********************************************************************************** //

// mbomSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_summary_table + ' ( \
    mbomID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    jobNum VARCHAR(6) NULL, \
    releaseNum VARCHAR(10) NULL, \
    jobName VARCHAR(100) NULL, \
    customer VARCHAR(100) NULL, \
    boardDesignation VARCHAR(100) NULL, \
    numSections INT NOT NULL, \
    PRIMARY KEY (mbomID), \
    UNIQUE INDEX mbomID_UNIQUE (mbomID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


//mbomSectionSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_section_sum + ' ( \
    secID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    sectionNum VARCHAR(100) NULL, \
    mbomID INT UNSIGNED NULL, \
    PRIMARY KEY (secID), \
    CONSTRAINT fk_mbomSection \
    FOREIGN KEY (mbomID) \
        REFERENCES mbomSum(mbomID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX secID_UNIQUE (secID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


// mbomComItem
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_common_items + ' ( \
    comItemID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    itemType VARCHAR(100) NULL, \
    itemMfg VARCHAR(100) NULL, \
    itemDesc VARCHAR(100) NULL, \
    itemPN VARCHAR(100) NULL, \
    unitOfIssue VARCHAR(100) NULL, \
    catCode VARCHAR(100) NULL, \
    status VARCHAR(100) NULL, \
    PRIMARY KEY (comItemID), \
    UNIQUE INDEX itemID_UNIQUE (comItemID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.MBOM_common_items+" (itemType, itemMfg, itemDesc, itemPN, unitOfIssue, catCode) VALUES " +
    // OVERHEAD LIFT DEVICE COMMON PARTS
    "('OVERHEAD LIFTING DEVICE', 'SIEMENS', 'LIFTING YOKE/OVERHEAD LIFT', 'GOVHDLD', 'EA', '12-ACC'), " +
    // GASKETING COMMON PARTS
    "('GASKETING', 'EMKA', 'EDGE GASKETING', '1011-05', 'FT', '84-MISC'), " +
    // IR WINDOW COMMON PARTS
    "('IR WINDOW', 'IRISS', '3 IN. DIAMETER IR WINDOW', 'VPT-075', 'EA', '12-ACC'), " +
    "('IR WINDOW', 'IRISS', '4 IN. DIAMETER IR WINDOW', 'VPT-100', 'EA', '12-ACC'), " +
    // PHASE BARRIER COMMON PARTS
    "('PHASE BARRIER', 'ABB', 'PHASE BARRIER, EMAX 2.2/4.2/6.2, 2 PCS, FIXED 3P', 'ZEBPBF', 'EA', '12-ACC'), " +
    "('PHASE BARRIER', 'ABB', 'PHASE BARRIER, EMAX 2.2/4.2/6.2, 3 PCS, FIXED 4P', 'ZEBPBF-4', 'EA', '12-ACC'), " +
    "('PHASE BARRIER', 'ABB', 'PHASE BARRIER, EMAX 2.2/4.2/6.2, 2 PCS, D.O. 3P', 'ZEBPBW', 'EA', '12-ACC'), " +
    "('PHASE BARRIER', 'ABB', 'PHASE BARRIER, EMAX 2.2/4.2/6.2, 3 PCS, D.O. 4P', 'ZEBPBW-4', 'EA', '12-ACC'), " +
    // MV COMMON PARTS
    "('MV CT BUSHING', 'ZELISKO', '2000A CT BUSHINGS (MV)', 'CT BUSHING-2000', 'EA', '39-MV GEAR'), " +
    "('MV CT BUSHING', 'ZELISKO', '1200A CT BUSHINGS (MV)', 'CT BUSHING-1200', 'EA', '39-MV GEAR'), " +
    "('MV CT BUSHING', 'EATON', 'MV CT BUSHINGS', '69C7790G01', 'EA', '39-MV GEAR'), " +
    "('MV WALL BUSHING', 'LSIS', 'MV WALL BUSHINGS', '45963177005', 'EA', '39-MV GEAR'), " +
    "('MV SURGE ARRESTOR', 'ABB', '(1/3) - 15KV MV SURGE ARRESTOR', 'D0xxSA0xxADXYAA0', 'EA', '39-MV GEAR'), " +
    "('MV SURGE ARRESTOR', 'SOUTHWIRE', '(2/3) - 2AWG CABLE (PER FOOT)', '569424', 'FT', '06-WIRE'), " +
    "('MV SURGE ARRESTOR', 'PANDUIT', '(3/3) - LUG, 2AWG 0 DEGREE', 'LCA2-12-Q', 'EA', '30-LUGS'), " +
    "('MV SURGE ARRESTOR', 'PANDUIT', '(3/3) - LUG, 2AWG 90 DEGREE', 'LCA2-12F-Q', 'EA', '30-LUGS'), " +
    "('MV PT', 'LSIS', '(1/5) - VT INSULATOR', '45963177006', 'EA', '39-MV GEAR'), " +
    "('MV PT', 'LSIS', '(2/5) - MV PT TRUCK', '72313177402', 'EA', '39-MV GEAR'), " +
    "('MV PT', 'LSIS', '(3/5) - MV PT CRADLE', '84053177601', 'EA', '39-MV GEAR'), " +
    "('MV PT', 'LSIS', '(4/5) - 3 PHASE VT', 'DPExxxxxx', 'EA', '39-MV GEAR'), " +
    "('MV PT', 'EATON', '(5/5) - 5KV, 1.5A FUSE (NEED 3)', '5.5CAVHxxxE', 'EA', '27-FUSE'), " +
    "('MV PT', 'EATON', '(5/5) - 15KV, 0.5A FUSE (NEED 3)', '15.5CAVH0.5E', 'EA', '27-FUSE'), " +
    "('MV INSULATOR', 'MARBAL', 'MV INSULATOR', '6600-S104X2', 'EA', '39-MV GEAR'), " +
    // KIRK KEY COMMON PARTS
    "('KIRK KEY', 'SCHNEIDER', 'KIRK KEY PROVISION, NW', 'S48565', 'EA', '28-KIRK'), " +
    "('KIRK KEY', 'KIRK', 'SKRU - 120VAC SOLENOID', 'SKPM1-S', 'EA', '28-KIRK'), " +
    "('KIRK KEY', 'KIRK', 'SKRU - 24VDC SOLENOID', 'SKPM2-S', 'EA', '28-KIRK'), " +
    "('KIRK KEY', 'KIRK', 'CN22 KIRK KEY (NW ICCB), KEYED/STAMPED', 'KC40---105', 'EA', '28-KIRK'), " +
    "('KIRK KEY', 'KIRK', 'C900301 KIRK KEY (WL ICCB), KEYED/STAMPED', 'C900301', 'EA', '28-KIRK'), " +
    "('KIRK KEY', 'KIRK', 'END MOUNTED KIRK KEY (H/J/L FRAME), KEYED/STAMPED', 'KFN020010S', 'EA', '28-KIRK'), " +
    "('KIRK KEY', 'KIRK', 'FLAT MOUNTED KIRK KEY (P FRAME), KEYED/STAMPED', 'KFL003710S', 'EA', '28-KIRK'), " +
    // CONNECTOR KIT COMMON PARTS
    "('CONNECTOR KIT', 'ABB', 'T7 STRAP KIT (SINGLE)', 'KT7S1.38', 'EA', '02-COPPER'), " +
    "('CONNECTOR KIT', 'ABB', 'T6 STRAP KIT (SINGLE)', 'KT6S1.38', 'EA', '02-COPPER'), " +
    "('CONNECTOR KIT', 'ABB', 'T5 STRAP KIT (SINGLE)', 'KT5S1.38', 'EA', '02-COPPER'), " +
    "('CONNECTOR KIT', 'ABB', 'XT4 STRAP KIT (DUAL)', 'KX4D1.38', 'EA', '02-COPPER'), " +
    "('CONNECTOR KIT', 'ABB', 'XT3 STRAP KIT (DUAL)', 'KX3D1.38', 'EA', '02-COPPER'), " +
    "('CONNECTOR KIT', 'ABB', 'XT2 STRAP KIT (DUAL)', 'KX2D1.38', 'EA', '02-COPPER'), " +
    "('CONNECTOR KIT', 'ABB', 'XT1 STRAP KIT (DUAL)', 'KX1D1.38', 'EA', '02-COPPER'), " +
    // I LINE COVER COMMON PARTS
    "('I LINE COVER', 'SCHNEIDER', '4.5 IN. SPACE', 'HNM4BL', 'EA', '40-PANEL'), " +
    "('I LINE COVER', 'SCHNEIDER', '1.5 IN. SPACE', 'HNM1BL', 'EA', '40-PANEL'), " +
    "('I LINE COVER', 'SCHNEIDER', 'H, J-FRAME COVER LSIG LEFT', 'HLW4EBL', 'EA', '40-PANEL'), " +
    "('I LINE COVER', 'SCHNEIDER', '1.5 IN. SPACE COVER LEFT', 'HLW1BL', 'EA', '40-PANEL'), " +
    "('I LINE COVER', 'SCHNEIDER', '4.5 IN. SPACE/J-FRAME TM COVER LEFT', 'HLW4BL', 'EA', '40-PANEL'), " +
    "('I LINE COVER', 'SCHNEIDER', 'H, J-FRAME COVER LSIG RIGHT', 'HLN4EBL', 'EA', '40-PANEL'), " +
    "('I LINE COVER', 'SCHNEIDER', '1.5 IN. SPACE COVER RIGHT', 'HLN1BL', 'EA', '40-PANEL'), " +
    "('I LINE COVER', 'SCHNEIDER', '4.5 IN. SPACE/J-FRAME TM COVER RIGHT', 'HLN4BL', 'EA', '40-PANEL'), "+
    // CTS COMMON PARTS
    "('CTS', 'GE', 'CT, ITI562, 2000:5, 5 IN. WINDOW', '562-202', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI562, 2500:5, 5 IN. WINDOW', '562-252', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI562, 3000:5, 5 IN. WINDOW', '562-302', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI562, 3200:5, 5 IN. WINDOW', '562-322', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI562, 4000:5, 5 IN. WINDOW', '562-402', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 800:5, 6 IN. WINDOW, MAIN BUS', '568TL-801', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 1000:5, 6 IN. WINDOW, MAIN BUS', '568TL-102', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 1200:5, 6 IN. WINDOW, MAIN BUS', '568TL-122', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 1600:5, 6 IN. WINDOW, MAIN BUS', '568TL-162', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 2000:5, 6 IN. WINDOW, MAIN BUS', '568TL-202', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 2500:5, 6 IN. WINDOW, MAIN BUS', '568TL-252', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 3000:5, 6 IN. WINDOW, MAIN BUS', '568TL-302', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 3200:5, 6 IN. WINDOW, MAIN BUS', '568TL-322', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 4000:5, 6 IN. WINDOW, MAIN BUS', '568TL-402', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TL, 5000:5, 6 IN. WINDOW, MAIN BUS', '568TL-502', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 400:5, 6 IN. WINDOW, RUNBACKS', '568TS-401', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 600:5, 6 IN. WINDOW, RUNBACKS', '568TS-601', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 800:5, 6 IN. WINDOW, RUNBACKS', '568TS-801', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 1000:5, 6 IN. WINDOW, RUNBACKS', '568TS-102', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 1200:5, 6 IN. WINDOW, RUNBACKS', '568TS-122', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 1600:5, 6 IN. WINDOW, RUNBACKS', '568TS-162', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 2000:5, 6 IN. WINDOW, RUNBACKS', '568TS-202', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 2500:5, 6 IN. WINDOW, RUNBACKS', '568TS-252', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 3000:5, 6 IN. WINDOW, RUNBACKS', '568TS-302', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 3200:5, 6 IN. WINDOW, RUNBACKS', '568TS-322', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 4000:5, 6 IN. WINDOW, RUNBACKS', '568TS-402', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI568TS, 5000:5, 6 IN. WINDOW, RUNBACKS', '568TS-502', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI563, 2000:5, 5 IN. WINDOW, RELAY CLASS C50', '563-202', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI563, 2500:5, 5 IN. WINDOW, RELAY CLASS C50', '563-252', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI563, 3000:5, 5 IN. WINDOW, RELAY CLASS C20', '563-302', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI563, 3200:5, 5 IN. WINDOW, RELAY CLASS C20', '563-322', 'EA', '34-INS TRN'), " +
    "('CTS', 'GE', 'CT, ITI563, 4000:5, 5 IN. WINDOW, RELAY CLASS C20', '563-402', 'EA', '34-INS TRN'), " +
    //NCT's COMMON PARTS
    "('NCTS', 'SCHNEIDER', 'NCT, POWERPACT H, 60-100A', 'S429521', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, POWERPACT H, 150A', 'S430562', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, POWERPACT J, 250A', 'S430563', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, POWERPACT L, 125-600A', 'S432575', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT LUG KIT, POWERPACT H, 8-2/0 AWG', 'AL150HD', 'EA', '30-LUGS'), " +
    "('NCTS', 'SCHNEIDER', 'NCT LUG KIT, POWERPACT, 4-4/0 AWG', 'AL175JD', 'EA', '30-LUGS'), " +
    "('NCTS', 'SCHNEIDER', 'NCT LUG KIT, POWERPACT J, 3/0 AWG-350 KCMIL', 'AL250JD', 'EA', '30-LUGS'), " +
    "('NCTS', 'SCHNEIDER', 'NCT LUG KIT, POWERPACT L, (2) 1 AWG-350 KCMIL', 'AL600LI35', 'EA', '30-LUGS'), " +
    "('NCTS', 'SCHNEIDER', 'NCT LUG KIT, POWERPACT L, (2) 4/0 AWG-500 KCMIL', 'AL600LI5', 'EA', '30-LUGS'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, POWERPACT P, 250A', 'S33575', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, POWERPACT P, 400-1600A', 'S33576', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, MASTERPACT NW-W, 100-250A', 'S48916', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, MASTERPACT NW-W, 400-1600A', 'S34036', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, MASTERPACT NW-W, 2000A', 'S48896', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, MASTERPACT NW-W, 2500-4000A', 'S48182', 'EA', '34-INS TRN'), " +
    "('NCTS', 'SCHNEIDER', 'NCT, MASTERPACT NW-Y, 2000-6000A', 'S48897', 'EA', '34-INS TRN') "
    , function (err, result) {
        if (err)
            console.log("Error inserting : %s ", err);
    });

// mbomUserItem
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_user_items + ' ( \
    userItemID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    itemType VARCHAR(100) NULL, \
    itemMfg VARCHAR(100) NULL, \
    itemDesc VARCHAR(160) NULL, \
    itemPN VARCHAR(100) NULL, \
    unitOfIssue VARCHAR(100) NULL, \
    catCode VARCHAR(100) NULL, \
    PRIMARY KEY (userItemID), \
    UNIQUE INDEX itemID_UNIQUE (userItemID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// mbomItemSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_item_table + ' ( \
    itemSumID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    comItemID INT UNSIGNED NULL, \
    userItemID INT UNSIGNED NULL, \
    mbomID INT UNSIGNED NULL, \
    secID INT UNSIGNED NULL, \
    itemQty INT UNSIGNED NULL, \
    shipLoose VARCHAR(1) NULL, \
    PRIMARY KEY (itemSumID), \
    CONSTRAINT fk_mbomItemFromUser \
    FOREIGN KEY (userItemID) \
        REFERENCES mbomUserItem(userItemID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_mbomItemFromCom \
    FOREIGN KEY (comItemID) \
        REFERENCES mbomComItem(comItemID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_mbomItem \
    FOREIGN KEY (mbomID) \
        REFERENCES mbomSum(mbomID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_mbomSectionItem \
    FOREIGN KEY (secID) \
        REFERENCES mbomSectionSum(secID) \
        ON DELETE SET NULL \
        ON UPDATE CASCADE, \
    UNIQUE INDEX itemSumID_UNIQUE (itemSumID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// mbomBrkSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_breaker_table + ' ( \
    idDev INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    mbomID INT UNSIGNED NULL, \
    secID INT UNSIGNED NULL, \
    devLayout VARCHAR(100) NULL, \
    devDesignation VARCHAR(160) NULL, \
    unitOfIssue VARCHAR(100) NULL, \
    catCode VARCHAR(100) NULL, \
    brkPN VARCHAR(100) NULL, \
    cradlePN VARCHAR(100) NULL, \
    devProduct VARCHAR(100) NULL, \
    devMfg VARCHAR(100) NULL, \
    devProdLine VARCHAR(100) NULL, \
    devMount VARCHAR(100) NULL, \
    devUL VARCHAR(100) NULL, \
    devOperation VARCHAR(100) NULL, \
    devCtrlVolt VARCHAR(100) NULL, \
    devKAIC VARCHAR(100) NULL, \
    devFrameSet VARCHAR(100) NULL, \
    devSensorSet VARCHAR(100) NULL, \
    devTripSet VARCHAR(100) NULL, \
    devTripUnit VARCHAR(100) NULL, \
    devTripParam VARCHAR(100) NULL, \
    devPoles VARCHAR(100) NULL,  \
    devLugQty VARCHAR(100) NULL,  \
    devLugType VARCHAR(100) NULL, \
    devLugSize VARCHAR(100) NULL, \
    devAcc VARCHAR(100) NULL, \
    PRIMARY KEY (idDev), \
    CONSTRAINT fk_mbomBrk \
    FOREIGN KEY (mbomID) \
        REFERENCES mbomSum(mbomID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_mbomSectionBrk \
    FOREIGN KEY (secID) \
        REFERENCES mbomSectionSum(secID) \
        ON DELETE SET NULL \
        ON UPDATE CASCADE, \
    UNIQUE INDEX idDev_UNIQUE (idDev ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


// mbomBrkAccSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_brkAcc_table + ' ( \
    brkAccID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    idDev INT UNSIGNED NULL,\
    brkAccQty INT NULL,\
    brkAccType VARCHAR(100) NULL,\
    brkAccMfg VARCHAR(100) NULL,\
    brkAccDesc VARCHAR(160) NULL,\
    brkAccPN VARCHAR(100) NULL,\
    PRIMARY KEY (brkAccID), \
    CONSTRAINT fk_mbomBrkAcc \
    FOREIGN KEY (idDev) \
        REFERENCES mbomBrkSum(idDev) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX brkAccID_UNIQUE (brkAccID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


// ********************************************************************************** //
// ****************** MECHANICAL ENGINEERING SUBMITTAL TABLES *********************** //
// ********************************************************************************** //

// submittalSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_summary_table + ' ( \
    subID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    jobNum VARCHAR(6) NULL, \
    releaseNum VARCHAR(10) NULL, \
    jobName VARCHAR(100) NULL, \
    customer VARCHAR(100) NULL, \
    layoutName VARCHAR(100) NULL, \
    drawnBy VARCHAR(5) NULL, \
    drawnDate DATE NULL, \
    checkedBy VARCHAR(5) NULL, \
    checkedDate DATE NULL, \
    PRIMARY KEY (subID), \
    UNIQUE INDEX subID_UNIQUE (subID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// submittalRevSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_rev_table + ' ( \
    revID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    subID INT UNSIGNED NOT NULL, \
    revNum VARCHAR(3) NULL, \
    revNote VARCHAR(100) NULL, \
    PRIMARY KEY (revID), \
    CONSTRAINT fk_subID \
    FOREIGN KEY (subID) \
        REFERENCES submittalSum(subID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX revID_UNIQUE (revID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// submittalLayoutSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_layout_table + ' ( \
    layoutID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    subID INT UNSIGNED NOT NULL, \
    layoutName VARCHAR(100) NULL, \
    ulListing VARCHAR(100) NULL, \
    systemType VARCHAR(100) NULL, \
    systemAmp VARCHAR(100) NULL, \
    mainBusAmp VARCHAR(100) NULL, \
    enclosure VARCHAR(100) NULL, \
    accessibility VARCHAR(100) NULL, \
    cableAccess VARCHAR(100) NULL, \
    paint VARCHAR(100) NULL,\
    interruptRating VARCHAR(100) NULL, \
    busBracing VARCHAR(100) NULL, \
    busType VARCHAR(100) NULL, \
    insulatedBus ENUM("Y","N") NOT NULL, \
    boots ENUM ("Y","N") NOT NULL, \
    keyInterlocks VARCHAR(100) NULL, \
    seismic ENUM("Y","N") NOT NULL, \
    mimic ENUM("Y","N") NOT NULL, \
    ir ENUM("Y","N") NOT NULL, \
    wireway ENUM("Y","N") NOT NULL, \
    trolley ENUM("Y","N") NOT NULL, \
    numSections INT NOT NULL, \
    PRIMARY KEY (layoutID), \
    CONSTRAINT fk_layoutSubID \
    FOREIGN KEY (subID) \
        REFERENCES submittalSum(subID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX layoutID_UNIQUE (layoutID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// submittalSectionSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_sections_table + ' ( \
    secID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    layoutID INT UNSIGNED NULL, \
    sectionNum VARCHAR(100) NULL, \
    compType JSON NULL, \
    controlAsmID VARCHAR(100) NULL, \
    secType VARCHAR(100) NULL, \
    brkType VARCHAR(100) NULL, \
    secAmp VARCHAR(100) NULL, \
    secPoles INT NULL, \
    secHeight INT NULL, \
    secWidth INT NULL, \
    secDepth INT NULL, \
    PRIMARY KEY (secID), \
    CONSTRAINT fk_layoutID \
    FOREIGN KEY (layoutID) \
        REFERENCES submittalLayoutSum(layoutID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX secID_UNIQUE (secID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// submittalBrkSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_breaker_table + ' ( \
    devID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    layoutID INT UNSIGNED NOT NULL, \
    secID INT UNSIGNED NULL,\
    comp VARCHAR(100) NULL, \
    devDesignation VARCHAR(100) NULL, \
    devFunction VARCHAR(100) NOT NULL, \
    unitOfIssue VARCHAR(2)  DEFAULT "EA", \
    catCode VARCHAR(100) NULL, \
    platform VARCHAR(100) NULL, \
    brkPN VARCHAR(100) NULL, \
    cradlePN VARCHAR(100) NULL, \
    devMount VARCHAR(100) NULL, \
    rearAdaptType VARCHAR(100) NULL, \
    devUL VARCHAR(100) NULL, \
    devLevel VARCHAR(100) NULL, \
    devOperation VARCHAR(100) NULL, \
    devCtrlVolt VARCHAR(100) NULL, \
    devMaxVolt VARCHAR(100) NULL, \
    devKAIC VARCHAR(100) NULL, \
    devFrameSet VARCHAR(100) NULL, \
    devSensorSet VARCHAR(100) NULL, \
    devTripSet VARCHAR(100) NULL, \
    devTripUnit VARCHAR(100) NULL, \
    devTripParam VARCHAR(100) NULL, \
    devPoles VARCHAR(100) NULL,  \
    devLugQty VARCHAR(100) NULL,  \
    devLugType VARCHAR(100) NULL, \
    devLugSize VARCHAR(100) NULL, \
    PRIMARY KEY (devID), \
    CONSTRAINT fk_layoutID_1 \
    FOREIGN KEY (layoutID) \
        REFERENCES submittalLayoutSum(layoutID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_secID_1 \
    FOREIGN KEY (secID) \
        REFERENCES submittalSectionSum(secID) \
        ON DELETE SET NULL \
        ON UPDATE CASCADE, \
    UNIQUE INDEX devID_UNIQUE (devID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

// submittalBrkAccSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_brkAcc_table + ' ( \
    brkAccID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    brkAccDropdownID INT UNSIGNED NULL,\
    devID INT UNSIGNED NULL,\
    PRIMARY KEY (brkAccID), \
    CONSTRAINT fk_devID_1 \
    FOREIGN KEY (devID) \
        REFERENCES submittalBrkSum(devID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_brkAccDropdownID \
    FOREIGN KEY (brkAccDropdownID) \
        REFERENCES brkAccOptions(brkAccDropdownID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    UNIQUE INDEX brkAccID_UNIQUE (brkAccID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });



//submittalPanelBrkSum
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_panel_breakers + ' ( \
    panelBrkID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    secID INT UNSIGNED NULL, \
    devID INT UNSIGNED NULL, \
    panelRow INT UNSIGNED NULL, \
    configuration VARCHAR(100) NULL, \
    mounting VARCHAR(100) NULL, \
    frame VARCHAR(100) NULL, \
    PRIMARY KEY (panelBrkID), \
    CONSTRAINT fk_secID_2 \
    FOREIGN KEY (secID) \
        REFERENCES submittalSectionSum(secID) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    CONSTRAINT fk_devID_2 \
    FOREIGN KEY (devID) \
        REFERENCES submittalBrkSum(devID) \
        ON DELETE SET NULL \
        ON UPDATE CASCADE, \
    UNIQUE INDEX panelBrkID_UNIQUE (panelBrkID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });


console.log("createSubSchema successful");

connection.end();
