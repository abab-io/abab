const random = require('random-node');
const passwordHash = require('password-hash');
const db = require('../modules/db');
const mail = require('../modules/mail');
const error = require('../modules/error/api');

module.exports = (API, redis) => {
    API.on('registration_email', true, (user, param, callback) => {
        if (!param.email && typeof param.email !== 'string')
            return callback && callback(null, {
                    error: error.api('Request param "email" incorrect', 'param', {
                        pos: 'api/auth.js(registration_email):#1',
                        param: param
                    }, 0),

                    success: false
                });
        if (!param.name && typeof param.name !== 'string')
            return callback && callback(null, {
                    error: error.api('Request param "name" incorrect', 'param', {
                        pos: 'api/auth.js(registration_email):#2',
                        param: param
                    }, 0),
                    success: false
                });
        if (!param.surname && typeof param.surname !== 'string')
            return callback && callback(null, {
                    error: error.api('Request param "surname" incorrect', 'param', {
                        pos: 'api/auth.js(registration_email):#3',
                        param: param
                    }, 0),
                    success: false
                });
        if (!param.password && typeof param.password !== 'string')
            return callback && callback(null, {
                    error: error.api('Request param "password" incorrect', 'param', {
                        pos: 'api/auth.js(registration_email):#4',
                        param: param
                    }, 0),
                    success: false
                });

        param.password = passwordHash.generate(param.password);
        db.users.find({
            email: param.email,
        }).count().then(function (cnt) {
            if (cnt !== 0) {
                return callback && callback(null, {
                        error: error.api('This "email" already in use', 'param', {
                            pos: 'api/auth.js(registration_email):#5',
                            param: param
                        }, 1),
                        success: false
                    });
            }
            db.users({

                email: param.email,
                phone: null,
                name: param.name,
                surname: param.surname,
                password: param.password,
                birthday: '00.00.0000',
                address: '',
                last_ip: '0.0.0.0',
                api: {
                    key: random.key(5, 5, 5, 8) + '-' + (new Date().getTime()),
                    secret: random.str(20, 25),
                    white_ip: '*.*.*.*',
                    status: false
                },
                activate_hash: random.key(4, 6, 6, 8) + '-' + (new Date().getTime()),

                settings: {},
                activate: false
            }).save().then(function (document) {
                mail.send(param.email,
                    'Activate you account Abab.io',
                    'Hi ' + document.email + ', You have successfully created an Abab.io account. To complete the process, activate your account. https://abab.io/api/v1/?method=public_activate_email&email=' + document.email + '&hash=' + document.activate_hash + ' If you have any questions about this email, contact us. https://abab.io/support Regards, The Abab team',
                    'Hi ' + document.email + ', You have successfully created an Abab.io account. To complete the process, activate your account. <br>https://abab.io/api/v1/?method=public_activate_email&email=' + document.email + '&hash=' + document.activate_hash + ' <br><br>If you have any questions about this email, contact us. <br>https://abab.io/support <br><br>Regards, The Abab team');
                return callback && callback(null, {
                        user: document,
                        success: true
                    });
            }).catch(function (err) {
                return callback && callback(null, {
                        error: error.api(err.message, 'db', err, 5),
                        success: false
                    });
            });

        }).catch(function (err) {
            return callback && callback(null, {
                    error: error.api(err.message, 'db', err, 5),
                    success: false
                });
        });


    }, {
        title: 'Registration user for email',
        description: 'Registration user for email method send verify message to "email" smtp ',
        param: [
            {
                name: 'email',
                type: "string",
                title: 'user Email',
                necessarily: true
            }, {
                name: 'password',
                type: "string",
                title: 'user password',
                necessarily: true
            }, {
                name: 'name',
                type: "string",
                title: 'user name',
                necessarily: true
            }, {
                name: 'surname',
                type: "string",
                title: 'user name',
                necessarily: true
            },

        ],
        response: [
            {name: 'success', type: "string", title: 'Status request method', default: 'true, false'},
            {name: 'user_id', type: "string", title: 'user id', default: '12345'},
            {name: 'error', type: "string", title: '', default: 'Example: Error code'},
            {name: 'latency_ms', type: "int(11)", title: 'Request processing time in ms', default: '122'}
        ]
    });
    API.on('auth_email', true, (user, param, callback) => {
        if (!param.email)
            return callback && callback(null, {
                    error: error.api('Request param "email" incorrect', 'param', {
                        pos: 'api/auth.js(auth_email):#1',
                        param: param
                    }, 0),

                    success: false
                });
        if (!param.password)
            return callback && callback(null, {
                    error: error.api('Request param "password" incorrect', 'param', {
                        pos: 'api/auth.js(auth_email):#2',
                        param: param
                    }, 0),
                    success: false
                });


        db.users.findOne({
            email: param.email,
        }).then(function (document) {
            if (!document) {
                return callback && callback(null, {
                        error: error.api('"email" or "password" incorrect', 'param', {
                            pos: 'api/auth.js(auth_email):#3',
                            param: param
                        }, 1),
                        success: false
                    });
            }
            if (!passwordHash.verify(param.password, document.password))
                return callback && callback(null, {
                        error: error.api('"email" or "password" incorrect', 'param', {
                            pos: 'api/auth.js(auth_email):#4',
                            param: param
                        }, 1),
                        success: false
                    });
            if (!document.activate) {
                mail.send(param.email,
                    'Activate you account Abab.io',
                    'Hi ' + document.email + ', You have successfully created an Abab.io account. To complete the process, activate your account. https://abab.io/api/v1/?method=public_activate_email&email=' + document.email + '&hash=' + document.activate_hash + ' If you have any questions about this email, contact us. https://abab.io/support Regards, The Abab team',
                    'Hi ' + document.email + ', You have successfully created an Abab.io account. To complete the process, activate your account. <br>https://abab.io/api/v1/?method=public_activate_email&email=' + document.email + '&hash=' + document.activate_hash + ' <br><br>If you have any questions about this email, contact us. <br>https://abab.io/support <br><br>Regards, The Abab team');

                return callback && callback(null, {
                        error: error.api('This account not activate. We resend the message for activate account', 'param', {
                            pos: 'api/auth.js(auth_email):#5',
                            param: param
                        }, 1),
                        success: false
                    });
            }
            return callback && callback(null, {
                    user: filterObject(document._doc, [
                        '_id',
                        'name',
                        'surname',
                        'birthday',
                        'email',
                        'phone',
                        'address',
                        'last_ip',
                        'update_at',
                        'create_at',
                    ]),
                    success: true
                });
        }).catch(function (err) {
            return callback && callback(null, {
                    error: error.api(err.message, 'db', err, 5),
                    success: false
                });
        });


    }, {
        title: 'Login user for email',
        description: 'Login user for email method send verify message to "email" from smtp smtp',
        param: [
            {
                name: 'email',
                type: "string",
                title: 'user Email',
                necessarily: true
            }, {
                name: 'password',
                type: "string",
                title: 'user password',
                necessarily: true
            },

        ],
        response: [
            {name: 'success', type: "string", title: 'Status request method', default: 'true, false'},
            {name: 'user', type: "object", title: 'data user info', default: '{_id)}'},
            {name: 'error', type: "string", title: '', default: 'Example: Error code'},
            {name: 'latency_ms', type: "int(11)", title: 'Request processing time in ms', default: '122'}
        ]
    });
    API.on('activate_email', true, (user, param, callback) => {
        if (!param.email)
            return callback && callback(null, {
                    error: error.api('Request param "email" incorrect', 'param', {
                        pos: 'api/auth.js(activate_email):#1',
                        param: param
                    }, 0),

                    success: false
                });

        db.users.findOne({
            email: param.email,
        }).then(function (document) {
            if (!document) {
                return callback && callback(null, {
                        error: error.api('"email" not found', 'param', {
                            pos: 'api/auth.js(activate_email):#2',
                            param: param
                        }, 1),
                        success: false
                    });
            }
            if (document.activate_hash !== param.hash) {
                return callback && callback(null, {
                        error: error.api('Request param "hash" incorrect', 'param', {
                            pos: 'api/auth.js(activate_email):#3',
                            param: param
                        }, 1),
                        success: false
                    });
            }
            if (document.activate) {
                return callback && callback(null, {
                        error: error.api('Account already active', 'param', {
                            pos: 'api/auth.js(activate_email):#4',
                            param: param
                        }, 1),
                        success: false
                    });
            }
            db.users.update({email: document.email}, {activate: true}).then(function () {


                return callback && callback(null, {
                        message: 'Activate success',
                        success: true
                    });
            }).catch(function (err) {
                return callback && callback(null, {
                        error: error.api(err.message, 'db', err, 6),
                        success: false
                    });
            });
        }).catch(function (err) {
            return callback && callback(null, {
                    error: error.api(err.message, 'db', err, 5),
                    success: false
                });
        });


    }, {
        title: 'Login user for email',
        description: 'Login user for email method send verify message to "email" from smtp smtp',
        param: [
            {
                name: 'email',
                type: "string",
                title: 'user Email',
                necessarily: true
            }, {
                name: 'password',
                type: "string",
                title: 'user password',
                necessarily: true
            },

        ],
        response: [
            {name: 'success', type: "string", title: 'Status request method', default: 'true, false'},
            {name: 'user', type: "object", title: 'data user info', default: '{_id)}'},
            {name: 'error', type: "string", title: '', default: 'Example: Error code'},
            {name: 'latency_ms', type: "int(11)", title: 'Request processing time in ms', default: '122'}
        ]
    });
};