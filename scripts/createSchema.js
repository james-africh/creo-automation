/**
 * Created by barrett on 8/28/14.
 */

var mysql = require('mysql');
var dbConfig = require('../app/config/database');

var connection = mysql.createConnection(dbConfig.connection);

connection.query('DROP SCHEMA IF EXISTS ' + dbConfig.database, function(err,rows) { if(err) throw err; }); // DROPS RESIDUAL DATABASE/TABLES

connection.query('CREATE DATABASE ' + dbConfig.database, function(err,rows) { if(err) throw err; }); // CREATES SAI_db SCHEMA

connection.query('USE ' + dbConfig.database, function(err,rows) { if(err) throw err; });

//JOBSCOPE TABLES
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.jobscope_codes_table + ' ( \
    idCode INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    catCode VARCHAR(100) NOT NULL, \
    PRIMARY KEY (idCode), \
    UNIQUE INDEX idCode_UNIQUE (idCode ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.jobscope_codes_table+" (catCode) VALUES " +
    "('01-STEEL'), " +
    "('02-COPPER'), " +
    "('06-WIRE'), " +
    "('12-ACC'), " +
    "('25-TRN CON'), " +
    "('26-METER'), " +
    "('27-FUSE'), " +
    "('28-KIRK'), " +
    "('30-LUGS'), " +
    "('31-GEN CON'), " +
    "('33-PLC'), " +
    "('34-INS TRN'), " +
    "('35-POW TRN'), " +
    "('36-CB MC'), " +
    "('37-CB IC'), " +
    "('38-DISC SW'), " +
    "('39-MV GEAR'), " +
    "('40-PANEL'), " +
    "('41-TVSS'), " +
    "('42-PROT RLY'), " +
    "('43-COMP HW'), " +
    "('44-COMP SW'), " +
    "('84-MISC'), " +
    "('92-BUYOUT'), " +
    "('96-OUTSVC'), " +
    "('98-ENGOUT') ", function (err, result) {
    if (err)
        console.log("Error inserting : %s ", err);
});

// APPLICATIONS ENGINEERING TABLES

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.user_profile_table + ' ( \
    idProfile INT NOT NULL AUTO_INCREMENT, \
    FK_id INT UNSIGNED NOT NULL , \
    firstName VARCHAR(100) NULL, \
    lastName VARCHAR(100) NULL, \
    profilePic VARCHAR(100) NOT NULL DEFAULT "default.jpg",\
    email VARCHAR(100) NULL, \
    department VARCHAR(100) NULL, \
    role VARCHAR(100) NULL, \
    cell VARCHAR(100) NULL, \
    permissions VARCHAR(100) NULL, \
    PRIMARY KEY (idProfile), \
    UNIQUE INDEX idProfile_UNIQUE (idProfile ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.permissions_table + ' ( \
    idPermission INT NOT NULL AUTO_INCREMENT, \
    permission VARCHAR(100) NULL, \
    PRIMARY KEY (idPermission), \
    UNIQUE INDEX idPermission_UNIQUE (idPermission ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.permissions_table+" (permission) VALUES " +
    "('BASIC'), " +
    "('SUPERVISOR'), " +
    "('ADMIN') "
    , function (err, result) {
        if (err)
            console.log("Error inserting : %s ", err); });

//APPLICATION ENGINEERING TABLES
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
    UNIQUE INDEX layoutID_UNIQUE (layoutID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' +  dbConfig.database + '.' + dbConfig.quote_section_type + ' (\
    secTypeID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    secType VARCHAR(100) NULL, \
    PRIMARY KEY (secTypeID), \
    UNIQUE INDEX secTypeID_UNIQUE (secTypeID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.quote_section_type+" (secType) VALUES " +
    "('BOLTSWITCH'), " +
    "('CONTROL'), " +
    "('DC DISCONNECT'), " +
    "('PANELBOARD'), " +
    "('PASSTHROUGH'), " +
    "('SWITCHBOARD/ SWITCHGEAR'), " +
    "('UTILITY METERING'), " +
    "('XFMR')"

    , function (err, result) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_layout_dropdown + ' ( \
    dropdownID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    dropdownType VARCHAR(100) NULL,\
    dropdownValue VARCHAR(100) NULL,\
    dropdownRestrictions JSON NULL,\
    PRIMARY KEY (dropdownID), \
    UNIQUE INDEX dropdownID_UNIQUE (dropdownID ASC)) \
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.quote_layout_dropdown+" (dropdownType, dropdownValue, dropdownRestrictions) VALUES " +
    //Layout Type
    "(" +
        "'Layout Type', " +
        "'LV Panelboard', " +
        "'{" +
            "\"ULListing\": \"UL 891\", " +
            "\"SystemType\": [\"480Y/277V - 3PH 4W\", \"480V - 3PH 3W\"], " +
            "\"SystemAmp\": [\"800A\", \"1000A\", \"1200A\", \"1600A\"], " +
            "\"MainBusAmp\": [\"800A\", \"1000A\", \"1200A\", \"1600A\"], " +
            "\"BusBracing\": [\"65kA\", \"85kA\", \"100kA\"], " +
            "\"kAICRating\": [\"65kAIC\", \"85kAIC\", \"100kAIC\"]" +
        "}'" +
    "), " +

    "(" +
        "'Layout Type', " +
        "'LV Switchboard', " +
        "'{" +
            "\"ULListing\": \"UL 891\", " +
            "\"SystemType\": [\"480Y/277V - 3PH 4W\", \"480V - 3PH 3W\"], " +
            "\"SystemAmp\": [\"800A\", \"1000A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\", \"5000A\", \"6000A\"], " +
            "\"MainBusAmp\": [\"800A\", \"1000A\", \"1200A\", \"1600A\", \"2000A\", \"2500A\", \"3000A\", \"3200A\", \"4000A\", \"5000A\", \"6000A\"], " +
            "\"BusBracing\": [\"65kA\", \"85kA\", \"100kA\", \"150kA\", \"200kA\"], " +
            "\"kAICRating\": [\"65kAIC\", \"85kAIC\", \"100kAIC\", \"150kAIC\", \"200kAIC\"]" +
        "}'" +
    "), " +

    "('Layout Type', 'LV Switchgear', '{}'), " +
    "('Layout Type', 'MV Switchgear - SAI', '{}'), " +
    "('Layout Type', 'MV Switchgear - Buyout', '{}'), " +
    "('Layout Type', 'Retrofit', '{}'), " +
    "('Layout Type', 'Control Box', '{}'), " +

    //UL Listing
    "('UL Listing', 'UL 891', '{}'), " +
    "('UL Listing', 'UL 1558', '{}'), " +
    "('UL Listing', 'SAI MV UL', '{}'), " +

    //SystemType
    "('System Type', '480Y/277V - 3PH 4W', '{}'), " +
    "('System Type', '480V - 3PH 3W', '{}'), " +
    "('System Type', '5kV - 3PH 3W', '{}'), " +
    "('System Type', '15kV - 3PH 3W', '{}'), " +
    "('System Type', '31.5kV - 3PH 3W', '{}'), " +

    //Enclosure
    "('Enclosure', 'NEMA 1', '{}'), " +
    "('Enclosure', 'NEMA 3R', '{}'), " +

    //Access
    "('Access', 'Front/Rear Access', '{}'), " +
    "('Access', 'Front Access Only', '{}'), " +

    //Cable Entry
    "('Cable Entry', 'Top', '{}'), " +
    "('Cable Entry', 'Bottom', '{}'), " +
    "('Cable Entry', 'Top or Bottom', '{}'), " +
    "('Cable Entry', 'Undefined', '{}'), " +

    //Paint
    "('Paint', 'ANSI 61', '{}'), " +
    "('Paint', 'RAL 7035', '{}'), " +

    //System Amp
    "('System Amp', '800A', '{}'), " +
    "('System Amp', '1000A', '{}'), " +
    "('System Amp', '1200A', '{}'), " +
    "('System Amp', '1600A', '{}'), " +
    "('System Amp', '2000A', '{}'), " +
    "('System Amp', '2500A', '{}'), " +
    "('System Amp', '3000A', '{}'), " +
    "('System Amp', '3200A', '{}'), " +
    "('System Amp', '4000A', '{}'), " +
    "('System Amp', '5000A', '{}'), " +
    "('System Amp', '6000A', '{}'), " +

    //Main Bus Amp
    "('Main Bus Amp', '800A', '{}'), " +
    "('Main Bus Amp', '1000A', '{}'), " +
    "('Main Bus Amp', '1200A', '{}'), " +
    "('Main Bus Amp', '1600A', '{}'), " +
    "('Main Bus Amp', '2000A', '{}'), " +
    "('Main Bus Amp', '2500A', '{}'), " +
    "('Main Bus Amp', '3000A', '{}'), " +
    "('Main Bus Amp', '3200A', '{}'), " +
    "('Main Bus Amp', '4000A', '{}'), " +
    "('Main Bus Amp', '5000A', '{}'), " +
    "('Main Bus Amp', '6000A', '{}'), " +

    //Bus Bracing
    "('Bus Bracing', '65kA', '{}'), " +
    "('Bus Bracing', '85kA', '{}'), " +
    "('Bus Bracing', '100kA', '{}'), " +
    "('Bus Bracing', '150kA', '{}'), " +
    "('Bus Bracing', '200kA', '{}'), " +

    //kAIC Rating
    "('kAIC Rating', '65kAIC', '{}'), " +
    "('kAIC Rating', '85kAIC', '{}'), " +
    "('kAIC Rating', '100kAIC', '{}'), " +
    "('kAIC Rating', '150kAIC', '{}'), " +
    "('kAIC Rating', '200kAIC', '{}'), " +

    //Bussing Type
    "('Bussing Type', 'Silver Plated Copper', '{}'), " +
    "('Bussing Type', 'Insulated Silver Plated Copper', '{}'), " +
    "('Bussing Type', 'Tin Plated Copper', '{}'), " +
    "('Bussing Type', 'Insulated Tin Plated Copper', '{}') "

    , function (err, result) {
        if (err)
            console.log("Error inserting : %s ", err);
    }
);

//parts and labor
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_parts_labor_table + ' ( \
    partsLaborID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    title VARCHAR(100) NULL, \
    partsLaborNum INT UNSIGNED NULL,\
    PRIMARY KEY (partsLaborID), \
        UNIQUE INDEX partsLaborID_UNIQUE (partsLaborID ASC)) \
        ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

//field service
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
        UNIQUE INDEX fieldServiceID_UNIQUE (fieldServiceID ASC)) \
        ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

//freight
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
    UNIQUE INDEX freightID_UNIQUE (freightID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

//warranty
connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_warranty_table + ' ( \
    warrantyID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    title VARCHAR(100) NULL, \
    warrantyNum INT UNSIGNED NULL, \
    PRIMARY KEY (warrantyID), \
    UNIQUE INDEX warrantyID_UNIQUE (warrantyID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_breaker_table + ' ( \
    devID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    layoutNum INT UNSIGNED NULL, \
    devDesignation VARCHAR(100) NULL, \
    devApp VARCHAR(100) NULL, \
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
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_brkAcc_table + ' ( \
    brkAccID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT NULL,\
    idDev INT NULL,\
    brkAccQty INT NULL,\
    brkAccType VARCHAR(100) NULL,\
    brkAccMfg VARCHAR(100) NULL,\
    brkAccDesc VARCHAR(160) NULL,\
    brkAccPN VARCHAR(100) NULL,\
    PRIMARY KEY (brkAccID), \
        UNIQUE INDEX brkAccID_UNIQUE (brkAccID ASC))\
        ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

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
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.quote_common_items+" (itemType, itemMfg, itemDesc, itemPN, unitOfIssue, catCode, price, lastUpdatedPrice, hrsEE, hrsME, hrsTEST, hrsFAB, hrsASSY, hrsWIRE) VALUES " +
    // METER COMMON PARTS
    "('METER', 'SQUARE D', 'PM8000 BASE METER PQM', 'METSEPM8244', 'EA', '26-METER', 2382.62, '2019-07-22', 2, 0, 0, 0, 0, 0.84), " +
    "('METER', 'SQUARE D', 'ION9000 BASE METER PQM', 'METSEION92040', 'EA', '26-METER', 8038.71, '2019-08-13', 2, 0, 0, 0, 0, 0.84) "
    , function (err, result) {
        if (err)
            console.log("Error inserting : %s ", err);
    });





connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_user_items + ' ( \
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
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_item_table + ' ( \
    itemSumID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    comItemID VARCHAR(100) NULL,\
    userItemID VARCHAR(100) NULL,\
    quoteID VARCHAR(100) NULL, \
    itemQty INT UNSIGNED NULL, \
    PRIMARY KEY (itemSumID), \
    UNIQUE INDEX itemSumID_UNIQUE (itemSumID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_control_assemblies + ' ( \
    quoteCtrlAsmID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    layoutID INT UNSIGNED NULL, \
    controlAsmID INT UNSIGNED NULL, \
    PRIMARY KEY (quoteCtrlAsmID), \
    UNIQUE INDEX quoteCtrlAsmID_UNIQUE (quoteCtrlAsmID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.control_assemblies_table + ' ( \
    controlAsmID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    asmName VARCHAR(100) NULL, \
    asmDesc VARCHAR(100) NULL, \
    jobScopeStdNum VARCHAR(100) NULL, \
    controlItems VARCHAR(100) NULL, \
    PRIMARY KEY (controlAsmID), \
    UNIQUE INDEX controlAsmID_UNIQUE (controlAsmID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.control_items_table + ' ( \
    controlItemID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    itemName VARCHAR(100) NULL, \
    itemDesc VARCHAR(100) NULL, \
    itemPN VARCHAR(100) NULL, \
    lastPurchased DATE NULL, \
    PRIMARY KEY (controlItemID), \
    UNIQUE INDEX controlItemID_UNIQUE (controlItemID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.quote_section_table + ' ( \
    secID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    quoteID INT UNSIGNED NULL, \
    layoutNum INT UNSIGNED NULL, \
    sectionNum VARCHAR(100) NULL, \
    compA VARCHAR(100) NULL, \
    compB VARCHAR(100) NULL, \
    compC VARCHAR(100) NULL, \
    compD VARCHAR(100) NULL, \
    compAType VARCHAR(100) NULL, \
    compBType VARCHAR(100) NULL, \
    compCType VARCHAR(100) NULL, \
    compDType VARCHAR(100) NULL, \
    itemSumID VARCHAR(100) NULL, \
    controlAsmID VARCHAR(100) NULL, \
    secType VARCHAR(100) NULL, \
    secHeight INT NULL, \
    secWidth INT NULL, \
    secDepth INT NULL, \
    PRIMARY KEY (secID), \
    UNIQUE INDEX secID_UNIQUE (secID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// MECHANICAL ENGINEERING TABLES
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

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_user_items + ' ( \
    userItemID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    mbomID VARCHAR(100) NULL, \
    itemType VARCHAR(100) NULL, \
    itemMfg VARCHAR(100) NULL, \
    itemDesc VARCHAR(160) NULL, \
    itemPN VARCHAR(100) NULL, \
    unitOfIssue VARCHAR(100) NULL, \
    catCode VARCHAR(100) NULL, \
    PRIMARY KEY (userItemID), \
    UNIQUE INDEX itemID_UNIQUE (userItemID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_item_table + ' ( \
    itemSumID INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    comItemID VARCHAR(100) NULL,\
    userItemID VARCHAR(100) NULL,\
    mbomID VARCHAR(100) NULL, \
    itemQty INT UNSIGNED NULL, \
    shipLoose VARCHAR(1) NULL, \
    PRIMARY KEY (itemSumID), \
    UNIQUE INDEX itemSumID_UNIQUE (itemSumID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_breaker_table + ' ( \
    idDev INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    mbomID VARCHAR(100) NULL, \
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
    UNIQUE INDEX idDev_UNIQUE (idDev ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_brkAcc_table + ' ( \
    brkAccID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    mbomID INT NULL,\
    idDev INT NULL,\
    brkAccQty INT NULL,\
    brkAccType VARCHAR(100) NULL,\
    brkAccMfg VARCHAR(100) NULL,\
    brkAccDesc VARCHAR(160) NULL,\
    brkAccPN VARCHAR(100) NULL,\
    PRIMARY KEY (brkAccID), \
        UNIQUE INDEX brkAccID_UNIQUE (brkAccID ASC))\
        ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.MBOM_section_sum + ' ( \
    secID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    sectionNum VARCHAR(100) NULL, \
    mbomID VARCHAR(100) NULL, \
    idDev VARCHAR(100) NULL, \
    itemSumID VARCHAR(100) NULL, \
    PRIMARY KEY (secID), \
    UNIQUE INDEX secID_UNIQUE (secID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query('\
CREATE TABLE IF NOT EXISTS ' + dbConfig.database + '.' + dbConfig.solution_log + ' ( \
    solutionLogID INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    fileName VARCHAR(100) NULL, \
    lastUpdated DATE NULL,\
    PRIMARY KEY (solutionLogID), \
    UNIQUE INDEX solutionLogID_UNIQUE (solutionLogID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

connection.query("INSERT INTO "+dbConfig.database+"."+dbConfig.solution_log+" (fileName) VALUES " +
    "('catMeme.jpg') "
    , function (err, result) {
        if (err)
            console.log("Error inserting : %s ", err);
});


console.log('Success: Schema Created!');

connection.end();
