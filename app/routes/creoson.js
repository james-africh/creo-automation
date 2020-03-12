const creosonController = require('../controllers/creosonController.js');


module.exports = function(app) {

    //PDF, DXF, BIN BOM Script GET request
    app.get('/PDF-DXF-BIN_BOM', creosonController.pdfDxfBinBom);

    //Set Working Directory POST request
    app.post('/setWD', creosonController.setWD);

    //Load Drawings from current working directory
    app.post('/loadDesign', creosonController.loadDesign);


    app.post('/generateAll', creosonController.generateAll);

    //Generate Drawings POST request
    app.post('/generateDrawings', creosonController.generateDrawings);

    //Generate BIN BOMS POST request
    app.post('/generateBinBoms', creosonController.generateBinBoms);

};