
module.exports = function (app, express) {
    app.use(
        '/',
        express.static('web')
    );
};
