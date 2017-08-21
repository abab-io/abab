/**
 * Created by bogdanmedvedev on 25.07.17.
 */
const config = require('../config');

config.set('aws-s3.region', 'us-west-2', true, true);
config.set('aws-s3.bucket', 'abab-p2p', true, true);
config.set('aws-s3.key', '', true, true);
config.set('aws-s3.secret', '', true, true);
config.save();
module.exports = config;