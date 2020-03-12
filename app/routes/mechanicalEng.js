const mechEngController = require('../controllers/mechanicalEngController.js');

module.exports = function(app, passport) {

    //Mechanical BOM GET request
    app.get('/MBOM', isLoggedIn, mechEngController.MBOM);

    //MBOM Create POST request
    app.post('/createMBOM', isLoggedIn, mechEngController.createMBOM);

    //MBOM Copy POST request
    app.post('/copyMBOM', isLoggedIn, mechEngController.copyMBOM);

    //Edit MBOM POST request
    app.post('/editMBOM/', isLoggedIn, mechEngController.editMBOM);

    //MBOM Search GET request
    app.get('/searchMBOM/', isLoggedIn, mechEngController.searchMBOMGet);

    //Add Brk Accessory POST request
    app.post('/addBreakerAcc', isLoggedIn, mechEngController.addBreakerAcc);

    //Add Brk Accessory From Edit POST request
    app.post('/addBreakerAccFromEdit', isLoggedIn, mechEngController.addBrkAccFromEdit);

    //Edit Brk Accessory POST request
    app.post('/editBreakerAcc', isLoggedIn, mechEngController.editBreakerAcc);

    //Add Brk Accessory From Edit POST request
    app.post('/editBreakerAccFromEdit', isLoggedIn, mechEngController.editBrkAccFromEdit);

    //Delete Brk Accessory POST request
    app.post('/deleteBreakerAcc', isLoggedIn, mechEngController.deleteBreakerAcc);

    //Delete Brk Accessory From Edit POST request
    app.post('/deleteBreakerAccFromEdit', isLoggedIn, mechEngController.deleteBrkAccFromEdit);

    //Create Com Defined Item POST request
    app.get('/createComItem', isLoggedIn, mechEngController.createComItemGET);

    //Create Com Defined Item POST request
    app.post('/createComItem', isLoggedIn, mechEngController.createComItemPOST);

    //Create User Defined Item POST request
    app.post('/createUserItem', isLoggedIn, mechEngController.createUserItem);

    //Add Commonly Used Item POST request
    app.post('/addItem', isLoggedIn, mechEngController.addItem);

    //Copy item POST request
    app.post('/copyItem/', isLoggedIn, mechEngController.copyItem);

    //Edit common item GET request
    app.get('/editComItem/', isLoggedIn, mechEngController.editComItemGET);

    //Edit common item POST request
    app.post('/MBOMeditComItem/', isLoggedIn, mechEngController.editComItemPOST);

    //Save common item changes POST request
    app.post('/saveComItemChanges/', isLoggedIn, mechEngController.saveComItemChanges);

    //Save common item changes POST request
    app.post('/MBOMsaveComItemChanges/', isLoggedIn, mechEngController.MBOMsaveComItemChanges);

    //Edit user item POST request
    app.post('/editUserItem/', isLoggedIn, mechEngController.editUserItem);

    //Save user item changes POST request
    app.post('/saveUserItemChanges/', isLoggedIn, mechEngController.saveUserItemChanges);

    //Delete item POST request
    app.post('/deleteItem/', isLoggedIn, mechEngController.deleteItem);

    //Add Breaker POST request
    app.post('/addBrk', isLoggedIn, mechEngController.addBrk);

    //Copy breaker POST request
    app.post('/copyBreaker/', isLoggedIn, mechEngController.copyBreaker);

    //Edit breaker POST request
    app.post('/editBreaker/', isLoggedIn, mechEngController.editBreaker);

    //Save breaker changes POST request
    app.post('/saveBreakerChanges/', isLoggedIn, mechEngController.saveBreakerChanges);

    //Delete breaker POST request
    app.post('/deleteBreaker/', isLoggedIn, mechEngController.deleteBreaker);

    //Add sections POST request
    app.post('/mbomAddSection', isLoggedIn, mechEngController.mbomAddSection);

    //Reset sections POST request
    app.post('/mbomResetSection', isLoggedIn, mechEngController.mbomResetSection);

    //Delete section POST request
    app.post('/mbomDeleteSection/', mechEngController.mbomDeleteSection);

    //Save sections POST request
    app.post('/sectionConfigure', isLoggedIn, mechEngController.sectionConfigure);

    //Generate MBOM POST request
    app.post('/generateMBOM', isLoggedIn, mechEngController.generateMBOM);

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/login');
    }
};