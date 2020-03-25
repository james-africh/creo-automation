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


// MECHANICAL ENGINEERING SUBMITTAL TABLES
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

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_rev_table + ' ( \
    revID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    subID INT UNSIGNED NOT NULL, \
    revNum VARCHAR(3) NULL, \
    revNote VARCHAR(100) NULL, \
    PRIMARY KEY (revID), \
    CONSTRAINT fk_subID \
    FOREIGN KEY (subID) \
        REFERENCES submittalSum(subID), \
    UNIQUE INDEX revID_UNIQUE (revID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


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
    iccbPlatform VARCHAR(100) NULL, \
    mccbPlatform VARCHAR(100) NULL, \
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
        REFERENCES submittalSum(subID), \
    UNIQUE INDEX layoutID_UNIQUE (layoutID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_sections_table + ' ( \
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
    CONSTRAINT fk_layoutID \
    FOREIGN KEY (layoutID) \
        REFERENCES submittalLayoutSum(layoutID), \
    UNIQUE INDEX secID_UNIQUE (secID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_layout_dropdowns + ' ( \
    dropdownID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    dropdownType VARCHAR(100) NULL,\
    dropdownValue VARCHAR(100) NULL,\
    PRIMARY KEY (dropdownID), \
    UNIQUE INDEX dropdownID_UNIQUE (dropdownID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.submittal_layout_dropdowns+" (dropdownType, dropdownValue) VALUES " +

    //ulListing
    "('ulListing', 'UL891'), " +
    "('ulListing', 'UL1558'), " +

    //systemType
    "('systemType', '480V - 3PH 3W'), " +
    "('systemType', '480Y/277V - 3PH 4W'), " +
    "('systemType', '600V - 3PH 3W'), " +
    "('systemType', '208Y/120V - 3PH 4W'), " +
    "('systemType', '120V - 3PH 3W'), " +

    //enclosure
    "('enclosure', 'NEMA 1'), " +
    "('enclosure', 'NEMA 3R'), " +
    "('enclosure', 'NEMA 4X'), " +
    "('enclosure', 'NEMA 12'), " +

    //accessibility
    "('accessibility', 'FRONT AND REAR ACCESS'), " +
    "('accessibility', 'FRONT AND SIDE ACCESS'), " +
    "('accessibility', 'FRONT ACCESS ONLY'), " +

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
    "('busBracing', '85kA'), " +
    "('busBracing', '100kA'), " +
    "('busBracing', '150kA'), " +

    //interruptRating
    "('interruptRating', '42kAIC'), " +
    "('interruptRating', '65kAIC'), " +
    "('interruptRating', '85kAIC'), " +
    "('interruptRating', '100kAIC'), " +
    "('interruptRating', '130kAIC'), " +
    "('interruptRating', '150kAIC'), " +
    "('interruptRating', '200kAIC'), " +

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

    //mccbPlatform
    "('mccbPlatform', 'SQUARE D POWERPACT'), " +
    "('mccbPlatform', 'SIEMENS VL'), " +
    "('mccbPlatform', 'EATON POWER DEFENSE'), " +
    "('mccbPlatform', 'ABB TMAX'), " +
    "('mccbPlatform', 'LSIS SUSOL'), " +

    //keyInterlocks
    "('keyInterlocks', 'SCHEME 29'), " +
    "('keyInterlocks', 'SCHEME 39'), " +
    "('keyInterlocks', 'SCHEME 29/39'), " +
    "('keyInterlocks', 'SCHEME 40'), " +
    "('keyInterlocks', 'OTHER'), " +
    "('keyInterlocks', 'N/A'); ", function (err, result) { if(err) throw err; });



connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_breaker_table + ' ( \
    devID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    layoutNum INT UNSIGNED NULL, \
    comp VARCHAR(100) NULL, \
    secID VARCHAR(100) NULL,\
    devDesignation VARCHAR(100) NULL, \
    tie VARCHAR(1) DEFAULT "N", \
    unitOfIssue VARCHAR(100) NULL, \
    catCode VARCHAR(100) NULL, \
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
    UNIQUE INDEX idDev_UNIQUE (devID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });



connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_brkAcc_table + ' ( \
    brkAccID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT NULL,\
    layoutNum INT NULL, \
    devID INT NULL,\
    productLine VARCHAR(100) NULL,\
    brkAccOpt JSON NULL, \
    PRIMARY KEY (brkAccID), \
        UNIQUE INDEX brkAccID_UNIQUE (brkAccID ASC))\
        ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_brkAcc_dropdown + ' (\
        brkAccDropdownID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
        mfg VARCHAR(100) NULL, \
        productLine VARCHAR(100) NULL, \
        brkAccOpt JSON NULL, \
        PRIMARY KEY (brkAccDropdownID), \
        UNIQUE INDEX brkAccDropdownID_UNIQUE (brkAccDropdownID ASC))\
        ENGINE = InnoDB;', function(err){ if(err) throw err; });

connection.query("INSERT INTO " + dbConfig.database + '.' + dbConfig.submittal_brkAcc_dropdown + " (mfg, productLine, brkAccOpt) VALUES " +
    "(" +
    "'Eaton', " +
    "'Magnum DS (ICCB)', " +
    "'{" +
    "\"shuntTrip\": [\"None\", \"110-127vac/dc 100% duty\", \"24vdc 100% duty\", \"48vdc 100% duty\"], " +
    "\"motor\": [\"None\", \"110-125vac 3 sec\", \"110-125vdc 3 sec\", \"24vdc 3 sec\", \"48vdc 3 sec\"], " +
    "\"springReleaseDevice\": [\"None\", \"110-127vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"undervoltageTrip\": [\"None\", \"110-125vac\", \"110-125vdc\", \"208-277vac\", \"24vdc\", \"48vdc\"], " +
    "\"secondShuntTrip\": [\"None\", \"110-127vac/dc 100% duty\", \"24vdc 100% duty\", \"48vdc 100% duty\"], " +
    "\"auxSwitch\": [\"2\", \"4\", \"6\", \"8\", \"10\", \"12\"], " +
    "\"bellAlarm\": [\"1\", \"2\"], " +
    "\"mechTripIndicator\": [\"Yes\"], " +
    "\"mechInterlock\": [\"Yes\"], " +
    "\"remoteReset\": " + null + ", " +
    "\"padlock\": [\"None\", \"Metal\", \"Plastic\"], " +
    "\"operationsCounter\": [\"Yes\", \"No\"], " +
    "\"kirkKeyProvisions\": [\"Yes\", \"No\"], " +
    "\"breakerReadyToClose\": " + null + ", " +
    "\"meteringForTripUnit\": " + null + ", " +
    "\"coms\": " + null + ", " +
    "\"pushButtonCover\": " + null + ", " +
    "\"latchCheck\": " + null + ", " +
    "\"secondaryTerminalBlocks\": " + null +
    "}'" +
    "), " +
    "(" +
    "'Eaton', " +
    "'Magnum SB (ICCB or MCCB)', " +
    "'{" +
    "\"shuntTrip\": [\"None\", \"110-127vac/dc 100% duty\", \"24vdc 100% duty\", \"48vdc 100% duty\"], " +
    "\"motor\": [\"None\", \"110-125vac 3 sec\", \"110-125vdc 3 sec\", \"24vdc 3 sec\", \"48vdc 3 sec\"], " +
    "\"springReleaseDevice\": [\"None\", \"110-127vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"undervoltageTrip\": [\"None\", \"110-125vac\", \"110-125vdc\", \"208-277vac\", \"24vdc\", \"48vdc\"], " +
    "\"secondShuntTrip\": [\"None\", \"110-127vac/dc 100% duty\", \"24vdc 100% duty\", \"48vdc 100% duty\"], " +
    "\"auxSwitch\": [\"2\", \"4\", \"6\"], " +
    "\"bellAlarm\": [\"2\"], " +
    "\"mechTripIndicator\": [\"Yes\"], " +
    "\"mechInterlock\": [\"Yes\"], " +
    "\"remoteReset\": " + null + ", " +
    "\"padlock\": [\"None\", \"Metal\", \"Plastic\"], " +
    "\"operationsCounter\": [\"Yes\", \"No\"], " +
    "\"kirkKeyProvisions\": [\"Yes\", \"No\"], " +
    "\"breakerReadyToClose\": " + null + ", " +
    "\"meteringForTripUnit\": [\"Upper Terms\", \"Lower Terms\"], " +
    "\"coms\": " + null + ", " +
    "\"pushButtonCover\": " + null + ", " +
    "\"latchCheck\": [\"None\", \"LCS Wired to SRD\"], " +
    "\"secondaryTerminalBlocks\": " + null +
    "}'" +
    "), " +
    "(" +
    "'Eaton', " +
    "'NRX NF (ICCB or MCCB)', " +
    "'{" +
    "\"shuntTrip\": [\"None\", \"110-127vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"motor\": [\"None\", \"110-125vac\", \"110-125vdc\", \"24vdc\", \"48vdc\"], " +
    "\"springReleaseDevice\": [\"None\", \"110-127vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"undervoltageTrip\": [\"None\", \"110-125vac/dc\", \"208-250vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"secondShuntTrip\": [\"None\", \"110-127vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"auxSwitch\": [\"2\", \"4\"], " +
    "\"bellAlarm\": [\"2\"], " +
    "\"mechTripIndicator\": [\"interlock trip\"], " +
    "\"mechInterlock\": " + null + ", " +
    "\"remoteReset\": " + null + ", " +
    "\"padlock\": [\"None\", \"Metal\", \"Plastic\"], " +
    "\"operationsCounter\": [\"Yes\", \"No\"], " +
    "\"kirkKeyProvisions\": [\"Yes\", \"No\"], " +
    "\"breakerReadyToClose\":" + null + ", " +
    "\"meteringForTripUnit\": " + null + ", " +
    "\"coms\": " + null + ", " +
    "\"pushButtonCover\": " + null + ", " +
    "\"latchCheck\": [\"None\", \"LCS Wired to SRD\"], " +
    "\"secondaryTerminalBlocks\": [\"Per Breaker Options\", \"Full Complement\"] " +
    "}'" +
    "), " +
    "(" +
    "'Eaton', " +
    "'NRX RF (ICCB or MCCB)', " +
    "'{" +
    "\"shuntTrip\": [\"None\", \"110-127vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"motor\": [\"None\", \"110-125vac\", \"24vdc\", \"48vdc\"], " +
    "\"springReleaseDevice\": [\"None\", \"110-127vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"undervoltageTrip\": [\"None\", \"110-125vac/dc\", \"208-250vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"secondShuntTrip\": [\"None\", \"110-127vac/dc\", \"24vdc\", \"48vdc\"], " +
    "\"auxSwitch\": [\"2\", \"6\", \"8\", \"10\", \"12\"], " +
    "\"bellAlarm\": [\"1\", \"2\"], " +
    "\"mechTripIndicator\": " + null + ", " +
    "\"mechInterlock\": [\"interlock trip\"], " +
    "\"remoteReset\": " + null + ", " +
    "\"padlock\": [\"None\", \"Metal\", \"Plastic\"], " +
    "\"operationsCounter\": [\"Yes\", \"No\"], " +
    "\"kirkKeyProvisions\": [\"Yes\", \"No\"], " +
    "\"breakerReadyToClose\": " + null + ", " +
    "\"meteringForTripUnit\": " + null + ", " +
    "\"coms\": " + null + ", " +
    "\"pushButtonCover\": " + null + ", " +
    "\"latchCheck\": [\"None\", \"LCS Wired to SRD\"], " +
    "\"secondaryTerminalBlocks\": [\"Per Breaker Options\", \"Full Complement\"] " +
    "}'" +
    "), " +
    "(" +
    "'Siemens', " +
    "'WL (ICCB)', " +
    "'{" +
    "\"shuntTrip\": [\"None\", \"24vdc\", \"48vdc\", \"125vdc\", \"120vac\"], " +
    "\"motor\": [\"None\", \"24vdc\", \"48vdc\", \"125vdc\", \"120vac\"], " +
    "\"springReleaseDevice\": [\"None\", \"24vdc\", \"48vdc\", \"125vdc\", \"120vac\"], " +
    "\"undervoltageTrip\": [\"None\", \"24vdc\", \"48vdc\", \"125vdc\", \"120vac\", \"240vac\", \"24vdc delay\", \"48vdc delay\", \"125vdc delay\", \"120vac delay\"], " +
    "\"secondShuntTrip\": [\"None\", \"24vdc\", \"48vdc\", \"125vdc\", \"120vac\"], " +
    "\"auxSwitch\": [\"2\", \"4\"], " +
    "\"bellAlarm\": [\"Yes\"], " +
    "\"mechTripIndicator\": " + null + ", " +
    "\"mechInterlock\": " + null + ", " +
    "\"remoteReset\": " + null + ", " +
    "\"padlock\": " + null + ", " +
    "\"operationsCounter\": [\"Yes\", \"No\"], " +
    "\"kirkKeyProvisions\": [\"Yes\", \"No\"], " +
    "\"breakerReadyToClose\": [\"Yes\", \"No\"], " +
    "\"meteringForTripUnit\": [\"Yes\", \"No\"], " +
    "\"coms\": [\"None\", \"Modbus\"], " +
    "\"pushButtonCover\": " + null + ", " +
    "\"latchCheck\": " + null + ", " +
    "\"secondaryTerminalBlocks\": " + null +
    "}'" +
    "), " +
    "(" +
    "'ABB', " +
    "'EMAX 2 (ICCB)', " +
    "'{" +
    "\"shuntTrip\": [\"None\", \"24vac/dc\", \"30vac/dc\", \"48vac/dc\", \"110-120vac/dc\", \"120-127vac/dc\"], " +
    "\"motor\": [\"None\", \"24-30vac/dc\", \"48-60vac/dc\", \"100-130vac/dc\"], " +
    "\"springReleaseDevice\": [\"None\", \"24vac/dc\", \"30vac/dc\", \"48vac/dc\", \"110-120vac/dc\", \"120-127vac/dc\"], " +
    "\"undervoltageTrip\": [\"None\", \"24vac/dc\", \"30vac/dc\", \"48vac/dc\", \"110-120vac/dc\", \"120-127vac/dc\", \"277vac\"], " +
    "\"secondShuntTrip\": [\"None\", \"24vac/dc\", \"30vac/dc\", \"48vac/dc\", \"110-120vac/dc\", \"120-127vac/dc\"], " +
    "\"auxSwitch\": [\"4\"], " +
    "\"bellAlarm\": [\"Yes\"], " +
    "\"mechTripIndicator\": " + null + ", " +
    "\"mechInterlock\": " + null + ", " +
    "\"remoteReset\": " + null + ", " +
    "\"padlock\": [\"None\", \"Yes\"], " +
    "\"operationsCounter\": [\"Yes\", \"No\"], " +
    "\"kirkKeyProvisions\": [\"Yes\", \"No\"], " +
    "\"breakerReadyToClose\": [\"None\", \"250vac/dc\"], " +
    "\"meteringForTripUnit\": " + null + ", " +
    "\"coms\": [\"None\", \"Mod rs 485\", \"Mod tcp\"], " +
    "\"pushButtonCover\": [\"Yes\", \"No\"], " +
    "\"latchCheck\": " + null + ", " +
    "\"secondaryTerminalBlocks\": " + null +
    "}'" +
    "), " +
    "(" +
    "'Schneider/ Square D', " +
    "'Masterpact NW (ICCB)', " +
    "'{" +
    "\"shuntTrip\": [\"None\", \"24-30vac/dc\", \"48-60vac/dc\", \"100-130vac/dc\"], " +
    "\"motor\": [\"None\", \"24-30vac/dc\", \"48-60vac/dc\", \"100-130vac/dc\"], " +
    "\"springReleaseDevice\": [\"None\", \"24-30vac/dc\", \"48-60vac/dc\", \"100-130vac/dc\"], " +
    "\"undervoltageTrip\": [\"None\", \"24-30vac/dc\", \"48-60vac/dc\", \"100-130vac/dc\", \"220-240vac/dc\", \"24-30vac/dc delay\", \"48-60vac/dc delay\", \"100-130vac/dc delay\", \"220-240vac/dc delay\"], " +
    "\"secondShuntTrip\": [\"None\", \"24-30vac/dc\", \"48-60vac/dc\", \"100-130vac/dc\"], " +
    "\"auxSwitch\": [\"4\", \"8\", \"12\"], " +
    "\"bellAlarm\": [\"1\", \"2\"], " +
    "\"mechTripIndicator\": " + null + ", " +
    "\"mechInterlock\": " + null + ", " +
    "\"remoteReset\": " + null + ", " +
    "\"padlock\": [\"Yes\", \"No\"], " +
    "\"operationsCounter\": [\"Yes\", \"No\"], " +
    "\"kirkKeyProvisions\": [\"Yes\", \"No\"], " +
    "\"breakerReadyToClose\": [\"Yes\", \"No\"], " +
    "\"meteringForTripUnit\": " + null + ", " +
    "\"coms\": [\"None\", \"Modbus\"], " +
    "\"pushButtonCover\": [\"Yes\", \"No\"], " +
    "\"latchCheck\": " + null + ", " +
    "\"secondaryTerminalBlocks\": " + null +
    "}'" +
    "), " +
    "(" +
    "'Schneider/ Square D', " +
    "'Powerpact (MCCB)', " +
    "'{}'" +
    "), " +
    "(" +
    "'Eaton', " +
    "'Power Defense (MCCB)', " +
    "'{}'" +
    "), " +
    "(" +
    "'Eaton', " +
    "'Series C (MCCB)', " +
    "'{}'" +
    "), " +
    "(" +
    "'ABB', " +
    "'Tmax (MCCB)', " +
    "'{}'" +
    "), " +
    "(" +
    "'Siemens', " +
    "'VL (MCCB)', " +
    "'{}'" +
    "), " +
    "(" +
    "'LSIS', " +
    "'Susol (ICCB)', " +
    "'{}'" +
    "), " +
    "(" +
    "'LSIS', " +
    "'Susol (MCCB)', " +
    "'{}'" +
    ") "
    , function (err) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_common_items + ' ( \
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

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_user_items + ' ( \
    userItemID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
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

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_item_table + ' ( \
    itemSumID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    quoteID VARCHAR(100) NULL, \
    layoutNum INT UNSIGNED NULL, \
    comItemID VARCHAR(100) NULL,\
    userItemID VARCHAR(100) NULL,\
    itemQty INT UNSIGNED NULL, \
    comp VARCHAR(100) NULL,\
    secID VARCHAR(100) NULL,\
    PRIMARY KEY (itemSumID), \
    UNIQUE INDEX itemSumID_UNIQUE (itemSumID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.submittal_control_sum + ' ( \
    ctlSumID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    layoutNum INT UNSIGNED NULL, \
    qty INT UNSIGNED NULL, \
    FK_cktID INT UNSIGNED NULL, \
    comp VARCHAR(100), \
    secID INT UNSIGNED NULL, \
    PRIMARY KEY (ctlSumID), \
    UNIQUE INDEX ctlSumID_UNIQUE (ctlSumID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });

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


connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.control_items_table + ' ( \
    ctlItemID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    FK_cktID INT UNSIGNED NULL, \
    itemDesc VARCHAR(100) NULL, \
    itemPN VARCHAR(100) NULL, \
    unitCost DOUBLE UNSIGNED NULL, \
    qty INT UNSIGNED NULL,\
    catCode VARCHAR(100), \
    PRIMARY KEY (ctlItemID), \
    UNIQUE INDEX ctlItemID_UNIQUE (ctlItemID ASC))\
    ENGINE = InnoDB;', function(err) { if(err) throw err; });








console.log("createSubSchema successful");

connection.end();
