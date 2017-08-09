/**
 * Created by bogdanmedvedev on 01.01.17.
 * npm install aws-sdk
 * Access Key ID:
 *                      AKIAJH755MDQQ5YUK4HQ
 * Secret Access Key:
 *                      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
 */
"use strict";


// var Uploader = require('s3-image-uploader');
// var uploader = new Uploader({
//     aws: {
//         key: 'AKIAJH755MDQQ5YUK4HQ',
//         secret: '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'
//     },
//     websocketServer: false,
//     websocketServerPort: 3004,
//     s3Params : { 'CacheControl' : 'max-age=3600', 'ACL': 'public-read'}
// });
var path = require('path');
var config = require('./conf');

const bucket = config.get('aws-s3.bucket'); // хранилише
const region = config.get('aws-s3.region'); // регион
const width = 120;// ширина
const height = width;// висота
const quality = 80;// качество
var aws_s3 = require('s3-image-uploader');
var uploader = new aws_s3({
    aws: {
        key: config.get('aws-s3.key'),
        secret: config.get('aws-s3.secret')
    },
    websocketServer: false,
    // websocketServerPort: 3004
});

var AWS = require('aws-sdk');

// For dev purposes only
AWS.config.update({accessKeyId: config.get('aws-s3.key'), secretAccessKey: config.get('aws-s3.secret')});
module.exports.upload_img = function (file, mimetype, cb, success_cb_server) {

    const fileId = file;
    // file = '../tmp/logo/' +file;
    console.log(file);
    let types = ["image/jpeg", "image/jpg", "image/png"];
    if (uploader.validateType({mimetype: mimetype}, fileId, types)) {
        uploader.resize({
            fileId: fileId,
            width: width,
            height: height,
            quality: quality,
            square: true, // обрезать до нужных размеров
            source: path.resolve(__dirname, '../tmp/logo/' + file),
            destination: path.resolve(__dirname, '../tmp/uploads/' + file)
        }, function (destination) {
            uploader.upload({
                    fileId: fileId,
                    bucket: bucket,
                    source: destination,
                    name: 'avatar/' + file,
                    maxFileSize: 1
                },
                function (data) { // success
                    if (data.type == 'result') {
                        data.url = 'https://s3-' + region + '.amazonaws.com/' + data.path;
                        setTimeout(function () {
                            cb && cb(null, data);
                            success_cb_server && success_cb_server(null, data);
                        }, 1);
                    }
                },
                function (errMsg, errObject) { //error
                    cb && cb(null, {error: 'AWS: ' + errMsg, code: 'errupload'});
                    console.error('unable to upload: ' + errMsg + ':', errObject);
                    // execute error code
                });
        }, function (errMsg, err) {
            console.error('aws-amazon.js:77 uploader.resize:', errMsg, err);
            cb && cb(null, {error: 'Resize error', code: 'resize'});

            // execute error code
        });
    } else {
        cb && cb(null, {error: 'Failed support types:' + "'image/jpeg', 'image/jpg', 'image/png'", code: 'type'});

    }

};
module.exports.upload_json = function (file_name, json, cb) {

    json =  new Buffer.from(JSON.stringify(json));
    let s3 = new AWS.S3();
    s3.putObject({
        Bucket: bucket,
        Key: 'rooms/' + file_name,
        Body: json,
        ACL: 'public-read'
    }, function (err,res) {
       if(err){
           return cb && cb(null, {
               success: false,
               err: err,
               error: err.message
           });
       }
        cb && cb(null, {
            success: true,
            url: 'https://s3-' + region + '.amazonaws.com/' + bucket + '/' + 'rooms/' + file_name,
            attach_path: 'rooms/' + file_name
        });

    });
};
module.exports.path = 'https://s3-' + region + '.amazonaws.com/' + bucket + '/';
module.exports.uploader = uploader;
module.exports.s3 = aws_s3;