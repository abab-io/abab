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
module.exports.upload_img= function (file, buffer,file_name, cb) {

    let s3 = new AWS.S3();
    s3.putObject({
        Bucket: bucket,
        Key: 'rooms_image/' + file_name,
        Body: buffer,
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
            url: 'https://s3-' + region + '.amazonaws.com/' + bucket + '/' + 'rooms_image/' + file_name,
            attach_path: 'rooms/' + file_name,
            file:file
        });

    });

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