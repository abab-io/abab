var config = require('../config');
var mongoose = require('mongoose');
var mongo_db = mongoose.createConnection(config.get('database:mongodb_url'), {
    useMongoClient: true,
    /* other options */
});
var db;


var Schema = mongoose.Schema;
var schemas = {
    logsAPI: new Schema({

        user_id: {
            type: Number,
            index: true
        },
        method: {
            type: String,
            default: null
        },
        param: {
            type: Schema.Types.Mixed,
        },
        response: {
            type: Schema.Types.Mixed,
        },
        error: {
            type: Schema.Types.Mixed,
            default: null,
        },
        user: {
            type: Schema.Types.Mixed,
        },
        latency_ms: {
            type: String,
            default: null
        },

        type_req: {
            type: String,
            default: null
        },
        create_at: {
            type: Date,
            default: Date.now
        }
    }),
    users: new Schema({

        email: {
            type: String,
            default: null,
            index: true
        },
        phone: {
            type: String,
            default: null,
            index: true
        },
        name: {
            type: String,
            default: null
        },
        surname: {
            type: String,
            default: null
        },
        activate_hash: {
            type: String,
            default: null
        },
        password: {
            type: String,
            default: null
        },
        birthday: {
            type: String,
            default: null
        },
        address: {
            type: String,
            default: null
        },
        last_ip: {
            type: String,
            default: null
        },
        api: {
            key: {
                type: String,
                default: null
            },
            secret: {
                type: String,
                default: null
            },
            white_ip: {
                type: String,
                default: '*.*.*.*'
            },
            status: {
                type: Boolean,
                default: false
            }
        },
        settings: {
            type: Schema.Types.Mixed,
        },
        activate: {
            type: Boolean,
            default: false
        },
        create_at: {
            type: Date,
            default: Date.now
        },
        update_at: {
            type: Date,
            default: Date.now
        }
    }),
    wallets: new Schema({

        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },

        active: {
            type: Boolean,
            default: true
        },
        type: {
            type: String,
            default: 'ETH'
        },
        wallet: {
            type: Schema.Types.Mixed,
            default: {},
        },
        create_at: {
            type: Date,
            default: Date.now
        },
        update_at: {
            type: Date,
            default: Date.now
        }
    }),
    tx: new Schema({

        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },

        currency: {
            type: String,
            default: 'USD',
        },
        tx: {
            type: Schema.Types.Mixed,
            default: {},
        },
        wallet: {
            type: String,
            default: '0x',
        },
        callback_url: {
            type: String,
            default: null,
        },
        nonce: {
            type: Number,
            default: 1
        },
        status: {
            type: Number,
            default: 0 //0- send tx to geth , 1 - wait confirm, 2 -confirm
        },
        create_at: {
            type: Date,
            default: Date.now
        },
        update_at: {
            type: Date,
            default: Date.now
        }
    }),
    rooms: new Schema({

        _index: {
            type: Number,
            default: null,
        },
        _hash: {
            type: String,
            default: null,
        },
        title: {
            type: String,
            default: '',
        },
        limit_time_min: {
            type: String,
            default: '',
        },
        limit_time_max: {
            type: String,
            default: '',
        },
        people_count: {
            type: String,
            default: '',
        },
        startTimeCheckIn: {
            type: String,
            default: '',
        },
        startTimeCheckOut: {
            type: String,
            default: '',
        },
        endTimeCheckIn: {
            type: String,
            default: '',
        },
        endTimeCheckOut: {
            type: String,
            default: '',
        },
        children_count: {
            type: String,
            default: '',
        },
        bedroom_count: {
            type: String,
            default: '',
        },
        bed_count: {
            type: String,
            default: '',
        },
        bathroom_count: {
            type: String,
            default: '',
        },
        bathroom: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        photo: {
            type: Array,
            default: [],
        },
        facilities: {
            type: Array,
            default: [],
        },
        wallet: {
            type: String,
            default: '0x',
        },
        txHash: {
            type: String,
            default: '0x',
        },
        dateRanges: {
            type: Array,
            default: [], //Date ranges when you can book example: unix
        },
        address: {
            country:  {
                type: String,
                default: null,
            },
            state:  {
                type: String,
                default: null,
            },
            city:  {
                type: String,
                default: null,
            },
            street:  {
                type: String,
                default: null,
            },
            address:  {
                type: String,
                default: null,
            },
            index:  {
                type: String,
                default: null,
            },
        },
        location: {
            type: Array,
            default: [],
        },
        status: {
            type: Number,
            default: 0 //0 - draft , 1 - wait confirm, 2 - send to blockchain, 3 -success publick
        },
        create_at: {
            type: Date,
            default: Date.now //filter this param p2p
        },
        update_at: {
            type: Date,
            default: Date.now
        }
    })
};

module.exports.open = mongo_db;
mongo_db.then(function (db_) {
    db = db_;
    db.on('error', function (err) {
        console.error('Connection error [Mongo DB]:', err.message);
    });

    for (let name in schemas) {
        if (schemas.hasOwnProperty(name)) {
            module.exports[name] = db.model(name, schemas[name]);

        }
    }


    module.exports.Schema = Schema;
    module.exports.mongoose = mongoose;
});