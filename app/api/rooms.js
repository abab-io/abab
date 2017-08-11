/**
 * Created by bogdanmedvedev on 24.07.17.
 */
const db = require('../modules/db');
const error = require('../modules/error/api');
const aws = require('../modules/aws-amazon-s3');
const crypto = require('crypto');

module.exports = (API, redis) => {
    API.on('GetRooms',true, (user, param, callback) => {

         db.rooms.find().then(function (documents) {


            return callback && callback(null, {
                    rooms: documents,
                    success: true
                });
        }).catch(function (err) {
            return callback && callback(null, {
                    error: error.api(err.message, 'db', err, 5),
                    success: false
                });

        });

    }, {}, {
        title: 'Get Rooms',
        description: 'Get all Rooms',
        param: [],
        response: []
    });
    API.on('UpsertRoom', (user, param, callback) => {
        if (param.dateRanges && typeof param.dateRanges !== 'string' && typeof param.dateRanges !== 'object') {
            return callback && callback(null, {
                    error: error.api('Request param "dateRanges" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#1',
                        param: param
                    }, 0),

                    success: false
                });
        }
        if (param.photo && typeof param.photo !== 'string' && typeof param.photo !== 'object') {
            return callback && callback(null, {
                    error: error.api('Request param "photo" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#2',
                        param: param
                    }, 0),

                    success: false
                });
        }
        if (param.title && typeof param.title !== 'string') {
            return callback && callback(null, {
                    error: error.api('Request param "title" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#3',
                        param: param
                    }, 0),

                    success: false
                });
        }

        if (param.description && typeof param.description !== 'string') {
            return callback && callback(null, {
                    error: error.api('Request param "description" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#4',
                        param: param
                    }, 0),

                    success: false
                });
        }
        if (param.address_country && typeof param.address_country !== 'string') {
            return callback && callback(null, {
                    error: error.api('Request param "address_country" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#5',
                        param: param
                    }, 0),

                    success: false
                });
        }
        if (param.address_country && typeof param.address_country !== 'string') {
            return callback && callback(null, {
                    error: error.api('Request param "address_country" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#6',
                        param: param
                    }, 0),

                    success: false
                });
        }
        if (!param.facilities) param.facilities = [];
        try {
            if (param.dateRanges && typeof param.dateRanges === 'string')
                param.dateRanges = JSON.parse(param.dateRanges);
            if (param.photo && typeof param.photo === 'string')
                param.photo = JSON.parse(param.photo);
            if (param.facilities && typeof param.facilities === 'string')
                param.facilities = JSON.parse(param.facilities);

        } catch (e) {
            return callback && callback(null, {
                    error: error.api('Error parse param dateRanges or photo or facilities not array', 'param', e, 0),
                    success: false
                });
        }

        if (!param._id && !param._index) {
            new db.rooms({

                title: param.title,
                description: param.description,
                photo: param.photo,
                wallet: param.wallet,
                bathroom: param.bathroom,
                bathroom_count: param.bathroom_count,
                bed_count: param.bed_count,
                bedroom_count: param.bedroom_count,
                children_count: param.children_count,
                limit_time_min: param.limit_time_min,
                limit_time_max: param.limit_time_max,
                people_count: param.people_count,
                startTimeCheckIn: param.startTimeCheckIn,
                startTimeCheckOut: param.startTimeCheckOut,
                endTimeCheckIn: param.endTimeCheckIn,
                endTimeCheckOut: param.endTimeCheckOut,
                dateRanges: param.dateRanges,
                address: {
                    country: param.address_country,
                    state: param.address_state,
                    city: param.address_city,
                    street: param.address_street,
                    address: param.address_address,
                    index: param.address_index,
                },
                facilities:param.facilities,
                location: [param.location_latitude, param.location_longitude],
                txHash: null,
                status: param.status //0 - draft , 1 - wait confirm, 2 - send to blockchain, 3 -success public
            }).save().then(function (document) {


                return callback && callback(null, {
                        room: filterObject(document._doc, [
                            '_id',
                            '_index',
                            '_hash',
                            'title',
                            'description',
                            'photo',
                            'wallet',
                            'dateRanges',
                            'address',
                            'location',
                            'status',
                            'update_at',
                        ]),
                        success: true
                    });
            }).catch(function (err) {
                return callback && callback(null, {
                        error: error.api(err.message, 'db', err, 5),
                        success: false
                    });

            });
        } else {


            if (param._id && typeof param._id === 'string') {
                db.rooms.findOne({_id: db.mongoose.Types.ObjectId(param._id)}).then(function (document) {
                    if (!document) {
                        return callback && callback(null, {
                                error: error.api('room not found', 'param', {pos: 'rooms.js#10'}, 0),
                                success: true
                            });
                    }
                    if (param.status && +param.status === 2) {
                        let _document = filterObject(document._doc, [
                            '_id',
                            'title',
                            'description',
                            'photo',
                            'wallet',
                            'dateRanges',
                            'address',
                            'location',
                            'update_at',
                        ]);
                        let _hash = '0x' + crypto.createHash('sha1').update(JSON.stringify(_document)).digest('hex');
                        aws.upload_json(_hash + '.json', _document, function () {
                            console.log('AWS_1', arguments);
                            API.emit('requestFunctionContract', user, {
                                from: document.wallet,
                                function: 'UpsertRoom',
                                param: "999999999," + _hash + ",0x0,0"
                            }, function (err, res) {
                                if (res.success === false) {
                                    return callback && callback(null, res);
                                }
                                console.log('requestFunctionContract_1', res.result.tx.hash);

                                db.rooms.findOneAndUpdate({_id: db.mongoose.Types.ObjectId(param._id)}, {
                                    txHash: res.result.tx.hash,
                                    _hash: _hash,
                                    status: 2
                                }, {new: true}).then(function (document) {
                                    console.log('findOneAndUpdate_1', arguments);
                                    return callback && callback(null, {
                                            room: filterObject(document._doc, [
                                                '_id',
                                                '_index',
                                                '_hash',
                                                'title',
                                                'description',
                                                'photo',
                                                'wallet',
                                                'dateRanges',
                                                'address',
                                                'location',
                                                'status',
                                                'update_at',
                                            ]),
                                            document: document,
                                            success: true
                                        });
                                }).catch(function (err) {
                                    return callback && callback(null, {
                                            error: error.api(err.message, 'db', err, 5),
                                            success: false
                                        });
                                });
                            });
                        });
                    } else
                        return callback && callback(null, {
                                room: document,
                                success: true
                            });


                }).catch(function (err) {
                    return callback && callback(null, {
                            error: error.api(err.message, 'db', err, 5),
                            success: false
                        });
                });

            }


            if (param._index && typeof param._index === 'string') {
                return callback && callback(null, {
                        error: error.api('api in develoment', 'server', {pos: 'rooms.js#11'}, 0),
                        success: true
                    });
            }
        }
    }, {
        title: 'Create or update Room',
        description: 'if transfer param _id or _index update room other create new room and return _id room ',
        param: [
            {name: '_id', type: "string", title: '_id room ', default: ''},
            {name: '_index', type: "string", title: '_index room of blockchain if status >2', default: ''},

            {name: 'title', type: "string", title: 'title room', default: ''},
            {name: 'description', type: "string", title: 'description room', default: ''},
            {name: 'photo', type: "Array", title: 'photo room array hash', default: '[]'},
            {name: 'wallet', type: "string", title: 'address creater', default: '0x'},
            {
                name: 'dateRanges',
                type: "Array",
                title: 'Date range array ',
                default: '[{from:Date,to:Date,price:0},...]'
            },
            {name: 'address_country', type: "string", title: 'country', default: ''},
            {name: 'address_state', type: "string", title: 'state', default: ''},
            {name: 'address_city', type: "string", title: 'city', default: ''},
            {name: 'address_street', type: "string", title: 'street', default: ''},
            {name: 'address_address', type: "string", title: 'address', default: ''},
            {
                name: 'status',
                type: "int",
                title: '0 - draft , 1 - wait confirm, 2 - send to blockchain, 3 -success publick',
                default: '0'
            },
            {name: 'location_latitude', type: "int", title: 'coordinates latitude', default: '0'},
            {name: 'location_longitude', type: "int", title: 'coordinates longitude', default: '0'},

        ],
        response: [
            {name: '_id', type: "string", title: '_id room ', default: ''},
            {name: '_index', type: "string", title: '_index room of blockchain', default: ''},
            {name: 'title', type: "string", title: 'title room', default: ''},
            {name: 'description', type: "string", title: 'description room', default: ''},
            {name: 'photo', type: "Array", title: 'photo room array', default: '[]'},
            {name: 'wallet', type: "string", title: 'address creater', default: '0x'},
            {
                name: 'dateRanges',
                type: "Array",
                title: 'Date range array ',
                default: '[{from:Date,to:Date,price:0},...]'
            },
            {name: 'address_country', type: "string", title: 'country', default: ''},
            {name: 'address_state', type: "string", title: 'state', default: ''},
            {name: 'address_city', type: "string", title: 'city', default: ''},
            {name: 'address_street', type: "string", title: 'street', default: ''},
            {name: 'address_address', type: "string", title: 'address', default: ''},
            {
                name: 'status',
                type: "int",
                title: '0 - draft , 1 - wait confirm, 2 - send to blockchain, 3 -success publick',
                default: '0'
            },
            {name: 'location_latitude', type: "int", title: 'coordinates latitude', default: '0'},
            {name: 'location_longitude', type: "int", title: 'coordinates longitude', default: '0'},
            {name: 'success', type: "string", title: 'Success ?', default: 'true, false'},
            {
                name: 'txHash',
                type: "string",
                title: 'HASH transaction blockchain if status >2 else null',
                default: '0x*******'
            },
            {name: 'error', type: "object", title: '', default: 'ERROR'},
            {name: 'latency_ms', type: "int(11)", title: 'Processing time of the request in ms', default: '122'}
        ]
    });

};