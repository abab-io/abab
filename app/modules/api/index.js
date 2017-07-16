"use strict";
var config = require('../config');
var request = require('../request');
var async = require("async");
var crypto = require('crypto');
var querystring = require('querystring');
var db = require('../db');
var path = require('path');
var fs = require('fs');

var API;
if (config.get('redis.status'))
    var redis = require('redis').createClient(config.get('redis.port'), config.get('redis.host'));

function ethplorer(name,address, get, post, callback) {
    let data_get = ''; // user_id=500150&
    let data_post = ''; // user_id=500150&
    for (let i in get) {
        if (get.hasOwnProperty(i))
            data_get += i + '=' + get[i] + '&';
    }
    for (let i1 in post) {
        if (post.hasOwnProperty(i1))
            data_post += i1 + '=' + post[i1] + '&';
    }
    let option = {
        rejectUnauthorized: false,
        host: 'api.ethplorer.io',
        port: 443,
        path: '/' + name + '/'+address+'?' + data_get,
        method: 'POST',
        formData: data_post,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    request.getJSON(option, (statusCode, response) => {
        if (statusCode == 200 && Object.prototype.isPrototypeOf(response)) {
        callback && callback(null, response);
    } else {
        console.error('response', Object.prototype.isPrototypeOf(response), response);
        callback && callback('Error ethplorer API [' + '/en/api/' + ']. ( https://' + option.host + option.path + '?' + option.formData + ' ) Response code: ' + statusCode, null);
    }
});
}
var controller={};
API = {
    on(name, _public, cb, docs){
        if (typeof _public == 'function') {
            docs = cb;
            cb = _public;
            _public = false
        }
        if (_public) name = 'public_' + name;
        controller[name] = cb;
        if (docs) {
            docs.method = name;
            if (_public)
                docs.access = 1;
            else
                docs.access = 2;

            docs.code = cb.toString();
            setTimeout(function () {
                API.docs.push(docs);
            }, 1)
        }
    },
    emit(name, user, param, cb, type){
        var initTimestamp = (new Date()).getTime();
        var err = null;
        if (!name) {
            err = {error: '[api] method name null'};
            console.error(err);
            cb && cb(err);
        }

        if (!param) param = {};
        if (controller.hasOwnProperty(name)) {
            controller[name](user, param, function (err, json) {
                if (err) {
                    console.error('API->emit(name, user, param, cb, type)->controller[name]->err:', err)
                }
                if(!json) {
                    json = {error: 'server error 500'};
                }
                json.latency_ms = (new Date()).getTime() - initTimestamp;
                if (!type) type = 'server';
                if ('get_cards_info' != name && 'get_finance_data_this_user' != name)
                    if (!user || !user.webtransfer_id) user.webtransfer_id = 1;
                new db.logsAPI({
                    user_id: +user.webtransfer_id,
                    method: name,
                    param: param,
                    response: json,
                    error: err,
                    user: {
                        paramConnect: user.paramConnect,
                        role: user.role,
                        last_name: user.last_name,
                        first_name: user.first_name,
                        email: user.email,
                        avatar_path: user.avatar_path,
                        ip: user.ip,
                        webtransfer_id: user.webtransfer_id,
                        room: user.room,
                    },
                    latency_ms: json.latency_ms,
                    type_req: type
                }).save(function (err, res) {
                    if (!err) {
                        json.latency_ms = (new Date()).getTime() - initTimestamp;
                        json.requestId = res._id;
                    }
                    cb && cb(err, json);
                    if (err) console.error('db-> db.logsAPI(logs).save ->,', err, {
                        user_id: user.webtransfer_id,
                        method: name,
                        param: param,
                        response: json,
                        error: err,
                        user: {
                            paramConnect: user.paramConnect,
                            role: user.role,
                            last_name: user.last_name,
                            first_name: user.first_name,
                            email: user.email,
                            avatar_path: user.avatar_path,
                            ip: user.ip,
                            webtransfer_id: user.webtransfer_id,
                            room: user.room,
                        },
                        latency_ms: json.latency_ms,
                        type_req: type
                    })

                });
            });
        } else {
            err = {error: '[api] method404'};
            console.error(err);
            cb && cb(err);
        }
    },
    docs: [], config: {
        secure: {
            ws: 'WS-4FeESmF75a-Rc2J80YJ3z-UM28pPJ03u',
            http: '5po40445Qm-4FeESmF75a-Rc2J80YJ3z-UM28pPJ03u',
            webfin: '5po40445Qm-4FeESmF75a-ynjgnYUuiRzR-QTzestc6iXWT',
            api_server_key: 'o40445Qm-4FeESmF75a-Rc2J80YJ3z-UM28p',
            api_server_secret: '5po40445Qm',
            api_docs: {login: config.loginAPI, pass: config.passAPI}
        }

    },
    proxy: {
        ethplorer:ethplorer
    },
    cache: {}
};

fs.readdir('./app/api', function(err, items) {
    console.log(items);

    for (var i=0; i<items.length; i++) {
        console.log(items[i]);
        require('../../api/'+items[i])(API,redis);
    }
});
module.exports.controller = controller;
module.exports.API = API;