module.exports = function (app, express) {
    var recaptcha = require('express-recaptcha');
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    // recaptcha.init('6LeK6iwUAAAAAA2OxeSqnaEs-W_zz7h5eSkA1oNG', '6LeK6iwUAAAAADaDHGF1nPyTAtfhMI2wi7Ge1d9x');
    // app.use('/', recaptcha.middleware.render, function (req, res, next) {
    //     res.setHeader('charset', 'utf-8');
    //     res.header('Content-Type', 'text/html');
    //     res.end(recaptcha.render())
    // });

    app.use('/', express.static('web'));
};
