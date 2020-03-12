module.exports = function(app, passport) {

    const applicationEngController = require('../controllers/applicationEngController.js');

    //New Quote GET request
    app.get('/newQuote', isLoggedIn, applicationEngController.newQuote);

    //Add Quote POST request
    app.post('/addQuote', isLoggedIn, applicationEngController.addQuote);

    //Edit Quote POST request
    app.post('/editQuote/', isLoggedIn, applicationEngController.editQuote);

    //Selected Slide POST request
    app.post('/selectedSlide', isLoggedIn, applicationEngController.selectedSlide);

    //Quote Detail GET request
    app.get('/quoteDetail/', isLoggedIn, applicationEngController.quoteDetail);

    //Add Layout POST request
    app.post('/quoteAddLayout/', isLoggedIn, applicationEngController.quoteAddLayout);

    //Edit Layout POST request
    app.post('/quoteEditLayout/', isLoggedIn, applicationEngController.quoteEditLayout);

    //Add Parts and Labor POST request
    app.post('/quoteAddPartsLabor/', isLoggedIn, applicationEngController.quoteAddPartsLabor);

    //Add Field Service
    app.post('/quoteAddFieldService/', isLoggedIn, applicationEngController.quoteAddFieldService);

    //Edit Field Service
    app.post('/quoteEditFieldService/', isLoggedIn, applicationEngController.quoteEditFieldService);

    //Add Freight
    app.post('/quoteAddFreight/', isLoggedIn, applicationEngController.quoteAddFreight);

    //Edit Freight
    app.post('/quoteEditFreight/', isLoggedIn, applicationEngController.quoteEditFreight);

    //Add Warranty
    app.post('/quoteAddWarranty/', isLoggedIn, applicationEngController.quoteAddWarranty);

    //Delete Board POST request
    app.post('/quoteDeleteLayout/', isLoggedIn, applicationEngController.quoteDeleteLayout);

    //Copy Layout POST request
    app.post('/quoteCopyLayout/', isLoggedIn, applicationEngController.quoteCopyLayout);

    //Add Section POST request
    app.post('/quoteAddSection/', isLoggedIn, applicationEngController.quoteAddSection);

    //Delete Section POST request
    app.post('/quoteDeleteSection/', isLoggedIn, applicationEngController.quoteDeleteSection);

    //Reset Sections
    app.post('/quoteResetSections/', isLoggedIn, applicationEngController.quoteResetSections);

    //Save Section Properties
    app.post('/quoteSectionProperties/', isLoggedIn, applicationEngController.quoteSectionProperties);

    //Add Device POST request
    app.post('/addDevice', isLoggedIn, applicationEngController.addDevice);

    //Copy Device POST request
    app.post('/quoteCopyDevice/', isLoggedIn, applicationEngController.quoteCopyDevice);

    //Edit Device POST request
    app.post('/quoteEditDevice/', isLoggedIn, applicationEngController.quoteEditDevice);

    //Delete Device POST request
    app.post('/quoteDeleteDevice/', isLoggedIn, applicationEngController.quoteDeleteDevice);

    //Save Device POST request
    app.post('/saveDevice', isLoggedIn, applicationEngController.saveDevice);

    //Save Changes
    app.post('/quoteSaveChanges', isLoggedIn, applicationEngController.quoteSaveChanges);


    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/login');
    }

};