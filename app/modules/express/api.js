/**
 * Created by bogdanmedvedev on 30.06.16.
 */
const crypto = require('crypto');
const querystring = require('querystring');

const jade = require('jade');
const fs = require('fs');
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
const error = require('../error/api');

var multer = require('multer');
var s3 = require('../aws-amazon-s3');

var busboy = require('connect-busboy');
module.exports = function (app, express) {


    var config_local = {
        api_path: '/api/v1/',
        domain: config.get('domain'),
        project_name: config.get('project_name'),
        shema: 'http://'
    };

    app.delete('/api/v1/upload_image_s3/', function (req, res) {
    });
    app.post('/api/v1/upload_image_s3/', multer({storage: multer.memoryStorage()}).single('file'), function (req, res) {

        res.setHeader('Access-Control-Allow-Origin', '*');
        // res.setEncoding('utf8');
        console.log('/api/v1/s3/upload/image/');

        let array_mimetype = req.file.mimetype.split('/');
        if (array_mimetype[0] !== 'image') {
            return res.end && res.end(JSON.stringify({
                    error: error.api('File is not format png,jpg,jpeg,git', 'param', {param: param}, 10),
                    success: false
                }));
        }
        if (req.file.size > 5 * 1024 * 1024) {
            return res.end && res.end(JSON.stringify({
                    error: error.api('File big size > 5mb', 'param', {}, 0),
                    success: false
                }));
        }
        let sha1_for_file = crypto.createHash('sha1').update(req.file.buffer).digest('hex');
        req.file.sha1 = sha1_for_file;
        s3.upload_img(req.file, req.file.buffer, sha1_for_file + '.jpeg' , function (err, result_s3) {
            if (err)
                return res.end && res.end(JSON.stringify({
                        error: error.api('File big size > 5mb', 'param', {}, 0),
                        success: false
                    }));
            return res.end && res.end(JSON.stringify({
                    "files": [{
                        "url": result_s3.url,
                        "deleteType":"DELETE",
                        "deleteUrl": "/api/v1/delete_image_s3/?hash=" + result_s3.file.sha1,
                        "name": result_s3.file.filename,
                        "sha1":  result_s3.file.sha1,
                        "size": result_s3.file.size,
                        "thumbnailUrl": result_s3.url,
                        "type": result_s3.file.mimetype
                    }]
                }));
        });
    });
    app.use('/api/v1/', function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        var param = Object.assign({}, req.body, req.query);
        if (param.method) {

            if (typeof param.api_key === 'string') {

                db.users.findOne({
                    "api.status": true,
                    "api.key": param.api_key,
                }).then(function (document) {
                    if (!document) {
                        return res.end && res.end(JSON.stringify({
                                error: error.api('user not auth', 'auth', {pos: 'express/api.js:42'}, 0),
                                success: false
                            }));

                    }
                    API.API.emit(param.method, document, param, function (err, result) {
                        if (err) {
                            return res.end && res.end(JSON.stringify({
                                    error: error.api('API call error', 'api', {err: err}, 0),
                                    success: false
                                }));
                        } else {
                            result.demo_api_auth_not_serure = true;
                            if (result)
                                res.end(JSON.stringify(result));
                            else
                                return res.end && res.end(JSON.stringify({
                                        error: error.api('API result of null', 'api', {param: param}, 10),
                                        success: false
                                    }));
                        }
                    }, 'http');
                }).catch(function (err) {
                    return res.end && res.end(JSON.stringify({
                            error: error.api('Server error', 'api', {
                                err: err,
                                code: 'call this method error',
                                param: param
                            }, 10),
                            success: false
                        }));
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
                    res.end('{"success":false,"status":false,"error":"user not auth", "code":"auth","n":3}');

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
        res.end(jade.renderFile(path.join(_path_root, '_API' + '/home.jade'), {
            methods: {all: API.API.docs},
            config: config_local,
            admin: false
        }));
    });
}
;