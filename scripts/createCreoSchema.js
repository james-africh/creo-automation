let mysql = require('mysql');
let dbConfig = require('../app/config/database');
let host = dbConfig.connection.host;
let user = dbConfig.connection.user;
let password = dbConfig.connection.password;
let database = dbConfig.connection.database;
let port = dbConfig.connection.port;

let connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    port : port,
    multipleStatements: true,
});



//connection.query('DROP SCHEMA IF EXISTS ' + database, function(err,rows) { if(err) throw err; }); // DROPS RESIDUAL DATABASE/TABLES

//connection.query('CREATE DATABASE ' + database, function(err,rows) { if(err) throw err; }); // CREATES creoDB SCHEMA

connection.query('USE ' + database, function(err,rows) { if(err) throw err; });


// baseFrames
connection.query('\
CREATE TABLE IF NOT EXISTS ' + database + '.' + dbConfig.baseFrame_table + ' ( \
    idFrame INT NOT NULL AUTO_INCREMENT, \
    frameType VARCHAR(100) NOT NULL, \
    frameWidth INT NOT NULL, \
    frameDepth INT NOT NULL, \
    asmCsys VARCHAR(100) NOT NULL, \
    auxAsmCsys VARCHAR(100) NOT NULL, \
    partFrontRear VARCHAR(100) NOT NULL, \
    partSide VARCHAR(100) NOT NULL, \
    frameAsm VARCHAR(100) NOT NULL, \
    PRIMARY KEY (idFrame), \
    UNIQUE INDEX idFrame_UNIQUE (idFrame ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


// cornerPosts
connection.query('\
CREATE TABLE IF NOT EXISTS ' + database + '.' + dbConfig.cornerPost_table + ' ( \
    idCPost INT NOT NULL AUTO_INCREMENT, \
    CPostType VARCHAR(100) NOT NULL, \
    CPostHeight DOUBLE NOT NULL, \
    CPostDepth DOUBLE NOT NULL, \
    gndCutout VARCHAR(1) NOT NULL, \
    wireCutout VARCHAR(1) NOT NULL, \
    asmCsys VARCHAR(100) NOT NULL, \
    partGeneric VARCHAR(100) NOT NULL, \
    partInstance VARCHAR(100) NOT NULL, \
    PRIMARY KEY (idCPost), \
    UNIQUE INDEX idCPost_UNIQUE (idCPost ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// brkCompartments_NW
connection.query('\
CREATE TABLE IF NOT EXISTS ' + database + '.' + dbConfig.brkCompartment_NW_table + ' ( \
    idCompICCB INT NOT NULL AUTO_INCREMENT, \
    iccbType VARCHAR(100) NOT NULL, \
    mounting VARCHAR(100) NOT NULL, \
    poles INT NOT NULL, \
    frame VARCHAR(100) NOT NULL, \
    maxAmps INT NOT NULL, \
    ul489 VARCHAR(1) NOT NULL, \
    ul1066 VARCHAR(1) NOT NULL, \
    position VARCHAR(100) NOT NULL, \
    compHeight DOUBLE NOT NULL, \
    secWidth INT NOT NULL, \
    iccbAsmPN VARCHAR(100) NOT NULL, \
    cbMountPN VARCHAR(100) NULL, \
    rabbetPN VARCHAR(100) NULL, \
    backsheetPN VARCHAR(100) NULL, \
    asmCsys VARCHAR(100) NOT NULL, \
    doorGenericPN VARCHAR(100) NULL, \
    doorInstancePN VARCHAR(100) NULL, \
    PRIMARY KEY (idCompICCB), \
    UNIQUE INDEX idCompICCB_UNIQUE (idCompICCB ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// brkLugLandings
connection.query('\
CREATE TABLE IF NOT EXISTS ' + database + '.' + dbConfig.brk_lugLanding_table + ' ( \
    lugID INT NOT NULL AUTO_INCREMENT, \
    devType VARCHAR(100) NOT NULL, \
    devMfg VARCHAR(100) NOT NULL, \
    devFrame VARCHAR(100) NOT NULL, \
    frameAmp INT NOT NULL, \
    lugQty INT NOT NULL, \
    lugType VARCHAR(100) NOT NULL, \
    lugSize VARCHAR(100) NOT NULL, \
    PRIMARY KEY (lugID), \
    UNIQUE INDEX lugID_UNIQUE (lugID ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


// iccbNW
connection.query('\
CREATE TABLE IF NOT EXISTS ' + database + '.' + dbConfig.brk_NW_table + ' ( \
    idICCB INT NOT NULL AUTO_INCREMENT, \
    iccbType VARCHAR(100) NOT NULL, \
    mounting VARCHAR(100) NOT NULL, \
    poles INT NOT NULL, \
    frame VARCHAR(100) NOT NULL, \
    ul489 VARCHAR(1) NOT NULL, \
    ul1066 VARCHAR(1) NOT NULL, \
    maxAmps INT NOT NULL, \
    provision VARCHAR(1) NOT NULL, \
    asmPN VARCHAR(100) NOT NULL, \
    iccbGenericPN VARCHAR(100) NOT NULL, \
    iccbInstancePN VARCHAR(100) NOT NULL, \
    compD VARCHAR(1) NOT NULL, \
    compBC VARCHAR(1) NOT NULL, \
    compC VARCHAR(1) NOT NULL, \
    compB VARCHAR(1) NOT NULL, \
    compA VARCHAR(1) NOT NULL, \
    asmCsys VARCHAR(100) NOT NULL, \
    PRIMARY KEY (idICCB), \
    UNIQUE INDEX idICCB_UNIQUE (idICCB ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

// mccbPowerpact
connection.query('\
CREATE TABLE IF NOT EXISTS ' + database + '.' + dbConfig.brk_powerpact_table + ' ( \
    idMCCB INT NOT NULL AUTO_INCREMENT, \
    mfgProductLine VARCHAR(100) NOT NULL, \
    cnxnType VARCHAR(100) NOT NULL, \
    cbRightFrame VARCHAR(100) NULL, \
    cbRightMaxAmps INT NULL, \
    cbLeftFrame VARCHAR(100) NULL, \
    cbLeftMaxAmps INT NULL, \
    poles INT NOT NULL, \
    panelWires INT NOT NULL, \
    unitSpaceQty INT NOT NULL, \
    unitSpace DOUBLE NOT NULL, \
    mount VARCHAR(100) NOT NULL, \
    genericAsm VARCHAR(100) NOT NULL, \
    instanceAsm VARCHAR(100) NOT NULL, \
    asmCsys VARCHAR(100) NOT NULL, \
    PRIMARY KEY (idMCCB), \
    UNIQUE INDEX idMCCB_UNIQUE (idMCCB ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

//oneLineParts
connection.query('\
CREATE TABLE IF NOT EXISTS ' + database + '.' + dbConfig.oneLineParts_table + ' ( \
    idOneLine INT NOT NULL AUTO_INCREMENT, \
    description VARCHAR(100) NOT NULL, \
    secType VARCHAR(100) NOT NULL, \
    PN VARCHAR(100) NOT NULL, \
    asmCsys VARCHAR(100) NOT NULL, \
    devSum VARCHAR(1) NOT NULL, \
    PRIMARY KEY (idOneLine), \
    UNIQUE INDEX idOneLine_UNIQUE (idOneLine ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

//standardPanels
connection.query('\
CREATE TABLE IF NOT EXISTS ' + database + '.' + dbConfig.standardPanel_table + ' ( \
    idPanel INT NOT NULL AUTO_INCREMENT, \
    unitSpacing DOUBLE NOT NULL, \
    panelType VARCHAR(100) NOT NULL, \
    poles INT NOT NULL, \
    maxAmpFull INT NOT NULL, \
    maxAmpSplit INT NOT NULL, \
    totalUnitSpace INT NOT NULL, \
    panelHeight DOUBLE NOT NULL, \
    panelFrame VARCHAR(100) NOT NULL, \
    busLam_1 VARCHAR(100) NULL, \
    busLam_2 VARCHAR(100) NULL, \
    busLam_3 VARCHAR(100) NULL, \
    panelAsm VARCHAR(100) NOT NULL, \
    PRIMARY KEY (idPanel), \
    UNIQUE INDEX idPanel_UNIQUE (idPanel ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });


//enclosureRules
connection.query('\
CREATE TABLE IF NOT EXISTS ' + database + '.' + dbConfig.panel_enclosureRules_table + ' ( \
    id INT NOT NULL AUTO_INCREMENT, \
    panelType VARCHAR(100) NOT NULL, \
    branch VARCHAR(100) NOT NULL, \
    breakerFrame VARCHAR(100) NOT NULL, \
    breakerAmp INT NOT NULL, \
    minWidth INT NOT NULL, \
    PRIMARY KEY (id), \
    UNIQUE INDEX id_UNIQUE (id ASC))\
    ENGINE = InnoDB;', function(err,rows) { if(err) throw err; });

console.log("createCreoSchema successful");

connection.end();
