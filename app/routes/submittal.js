const submittalController = require('../controllers/submittalController.js');


module.exports = function(app) {

    app.get('/submittal', submittalController.submittal);

    app.post('/createSubmittal', submittalController.createSubmittal);

    app.get('/searchSubmittal/', submittalController.searchSubmittal);

    app.post('/addLayout/', submittalController.addLayout);

};