/**
 * Created by bogdanmedvedev on 29.06.16.
 */
'use strict';
var config = require('../config');
var error = require('../error');
var log = require('../log');
var geoip = require('../geoip');

var express = require('express'),
    app = express();
var bodyParser = require('body-parser'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    Cookies = require("cookies");
var Session = require('../session');

var compress = require('compression');
var helmet = require('helmet');
app.use(helmet());
app.use(compress({level: 9}));

app.use(cookieParser());
// app.use(bodyParser.urlencoded({extended: false}));
//
// app.use(config.get('server:url:path'), session({
//     secret: config.get('server:session:secret'),
//     name: config.get('server:session:name'),
//     store: Session.store,
//     proxy: true,
//     httpOnly: true,
//     resave: false,
//     saveUninitialized: true
// }));
var path_url = config.get('server:url:path');
app.use(path_url, function (req, res, next) {
    req.initTimestamp = (new Date()).getTime();
    var IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '0.0.0.0';
    IP = IP.replace('::ffff:', '');
    if (IP.split(',').length != 1) {
        IP = IP.split(',')[0]
    }
    if (IP == '::1') IP = '178.151.183.225';
    var infoIP = geoip(IP);

    if (config.get('application:server:logs:express')) log.info('Express request: \n\t\tUrl: ' + req.protocol + '://' + req.get('Host') + req.url + '\n\t\tClient: ' + JSON.stringify(infoIP));
    req.infoClient = infoIP;
    // req.infoClient.lang = req.params.lang;
    if (false == infoIP.success){
        res.end('[express] infoIP undefined please contact support');
        log.error('{express} client dont load page reason:[infoIP] : ',infoIP)
    }else{
        res.set('charset', 'utf8');
        next();
    }

});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

require('./api')(app,express);


var isPortTaken = function (port, fn) {
    var net = require('net');
    var tester = net.createServer()
        .once('error', function (err) {
            if (err.code != 'EADDRINUSE') return fn(err);
            fn(null, true)
        })
        .once('listening', function () {
            tester.once('close', function () {
                fn(null, false)
            }).close()
        })
        .listen(port)
};
var http_port = config.get('server:http:port');
var http = require('http').createServer(app).listen(http_port);
require('./web')(app,express);


module.exports.http = http;
module.exports.app = app;