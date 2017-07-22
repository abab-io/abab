/**
 * Created by bogdanmedvedev on 30.06.16.
 */
var crypto = require('crypto');
var querystring = require('querystring');

var jade =require('jade');
var path = require('path');
var config = require('../config');
var log = require('../log');
var API = require('../api');
var geoip = require('../geoip');
function apiResponse(req, res, json) {
    json.server_latency_ms = (new Date()).getTime() - req.initTimestamp;
    res.json(json);
}
module.exports = function (app,express) {


    var config_local = {
        api_path: '/api/v1/',
        domain: config.get('domain'),
        project_name: config.get('project_name'),
        shema: 'http://'
    };
    app.use('/api/v1/', function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        var param = Object.assign({}, req.body, req.query);
        if (param.method) {

            if (param.auth === 'true') {


            } else {
                if (param.method.split('_')[0] == 'public')
                    API.API.emit(param.method, {}, param, function (err, result) {
                        if (err) {
                            res.end('{"success":false,"status":false,"error":' + JSON.stringify(err) + '}');
                        } else {
                            if (result)
                                res.end(JSON.stringify(result));
                            else
                                res.end('{"success":false,"status":false,"error":"not result"}');
                        }
                    }, 'http');
                else {
                    res.end('{"success":false,"status":false,"error":"user not auth", "code":"auth"}');

                }
            }
        } else
            res.end('{"error":"method 404 send Get param [method]"}');

    });
    app.use(
        '/_API',
        express.static('_API')
    );

    app.get('/api/docs/', function (req, res) {
        res.set('Content-Type', 'text/html');
        res.end(jade.renderFile(path.join(_path_root,  '_API' + '/home.jade'), {
            methods: {all: API.API.docs},
            config: config_local,
            admin: false
        }));
    });
};