/**
 * Created by bogdanmedvedev on 30.06.16.
 */
const crypto = require('crypto');
const querystring = require('querystring');

const jade =require('jade');
const path = require('path');
const config = require('../config');
const db = require('../db');
const log = require('../log');
const API = require('../api');
const geoip = require('../geoip');
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

            if (param.api_key === "597236bd4f0c16129a8af55f") {

                db.users.findOne({
                    "api.status": true,
                    "api.key": param.api_key,
                }).then(function (document) {
                    if(!document){
                        return res.end('{"success":false,"status":false,"error":"user not auth", "code":"auth"}');
                    }
                    API.API.emit(param.method, document, param, function (err, result) {
                        if (err) {
                            res.end('{"success":false,"status":false,"error":' + JSON.stringify(err) + '}');
                        } else {
                            result.demo_api_auth_not_serure= true;
                            if (result)
                                res.end(JSON.stringify(result));
                            else
                                res.end('{"success":false,"status":false,"error":"not result"}');
                        }
                    }, 'http');
                }).catch(function (err) {
                    return res.end('{"success":false,"status":false,"error":"user not auth", "code":"auth"}');
                });

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