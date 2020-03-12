const creosonController = require('../controllers/creosonController.js');


module.exports = function(app, passport) {

    //Submittal GET request
    app.get('/submittal', isLoggedIn, creosonController.submittal);

    //PDF, DXF, BIN BOM Script GET request
    app.get('/PDF-DXF-BIN_BOM', isLoggedIn, creosonController.pdfDxfBinBom);

    //Set Working Directory POST request
    app.post('/setWD', isLoggedIn, creosonController.setWD);

    //Load Drawings from current working directory
    app.post('/loadDesign', isLoggedIn, creosonController.loadDesign);

    //Generate Drawings POST request
    app.post('/generateDrawings', isLoggedIn, creosonController.generateDrawings);

    //Generate BIN BOMS POST request
    app.post('/generateBinBoms', isLoggedIn, creosonController.generateBinBoms);


    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/login');
    }
};