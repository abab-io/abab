var mongoose = require('mongoose');
mongoose.connect(config.mongodb_url);
var db = mongoose.connection;

db.on('error', function (err) {
    console.error('Connection error [Mongo DB]:', err.message);
});
db.once('open', function callback() {
    console.log("Connection to MongoDB... success");
});
var Schema = mongoose.Schema;

exports.Schema = Schema;
exports.mongoose = mongoose;