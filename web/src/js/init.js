'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _path_chat = 'src/views/';
var _path_src = './src/';
// var _chat_e = function (t) {
//     return t;
// };
var _ver = '0.0.0';
var procent = 0;
var ractiveComponent = {};

function init() {

    procent = 0.15;

    // $('body').append('<div id="ractive_chat_module" style="height: 100%"></div>');
    // $('body').append('<div id="ractive_chat_module2" style="height: 100%"></div>');
    var _componentsLoad = function _componentsLoad(cb) {
        Ractive.getHtml(_path_chat + 'templates' + '.html?ver=' + _ver).then(function (templates) {
            var arr_templts = templates.split('##!!!##');
            var parts = [];
            var name = '';
            for (var i in arr_templts) {
                if (arr_templts[i].length) {
                    parts = arr_templts[i].split('##!:!##');
                    name = parts[0];
                    Ractive.components[name] = Ractive.extend({
                        isolated: false,
                        template: parts[1],
                        nameComponents: name,
                        onrender: function () {
                            if (window.ABAB)
                                ABAB.event['ComponentsOnRender'] && ABAB.event['ComponentsOnRender'](this.nameComponents);
                            this.on('*', function (e, v1, v2, v3) {
                                if (window.ABAB && e && e.name)
                                    ABAB.event[e.name] && ABAB.event[e.name](v1, v2, v3);
                            });
                        }
                    });
                }
            }
            procent += 0.1;
            cb && cb();
        });

    };
    var requireElement = function requireElement(param, paralel, cb) {
        paralel = paralel || {
                cnt: 0, afterlast: function afterlast() {
                }
            };
        paralel.cnt++;
        var name;
        if ('string' == typeof param) {
            name = param;
            param = {name: name};
        } else {
            name = param.name;
        }

        if (!name) {
            throw new Error('You have to specify a file/name Ractive.requireElement');
        }
        var src = param.src || name;
        name = name.split("/");
        var cls = name;
        name = 'reactive-' + name.join('-');
        var fileName = cls[cls.length - 1].capitalizeFirstLetter();
        for (var i in cls) {
            cls[i] = cls[i].capitalizeFirstLetter();
        }
        cls = 'reactive' + cls.join('');

        if (!Ractive.components[name]) {
            Ractive.require(_path_chat + src + '/' + fileName + '.css');

            Ractive.getHtml(_path_chat + src + '/' + fileName + '.html').then(function (template) {

                if (Ractive.DEBUG) console.log('Element ' + name + ' loaded');
                if (fileName == 'App') {

                    ractiveComponent['rootApp'] = new Ractive({
                        el: '#ractive_chat_module',
                        template: template,
                        data: {
                            _e: _chat_e,
                            notificationCount: 0,
                            _path_src: _path_src
                        },
                        oninit: function oninit() {
                            console.log('#ractive_chat_module init!');
                            // this.on({
                            //
                            // });
                        },
                        oncomplete: function oncomplete() {
                            Ractive.require(_path_chat + src + '/' + fileName + '.js').then(function () {
                                Ractive.components[name] = window[cls].extend({
                                    template: template
                                });
                                ractiveComponent[cls] = new window[cls]();
                                paralel.cnt--;
                                setTimeout(function () {
                                    if (0 >= paralel.cnt && !paralel.ran) {
                                        paralel.ran = true;
                                        paralel.afterlast();
                                    }
                                }, 1);
                            });
                        }
                    });
                } else {


                    ractiveComponent[name + 'App'] = new Ractive({
                        el: param.element,
                        template: template,
                        data: {
                            _e: _chat_e,

                            _path_src: _path_src
                        },
                        oninit: function oninit() {
                            this.on('setPage', function (e, v1, v2, v3) {
                                if (window.ABAB) ABAB.event[e.name] && ABAB.event[e.name](v1, v2, v3);
                            });
                        },
                        oncomplete: function oncomplete() {

                            Ractive.require(_path_chat + src + '/' + fileName + '.js?ver=' + _ver).then(function () {

                                Ractive.components[name] = window[cls].extend({
                                    template: template
                                });
                                ractiveComponent[cls] = new window[cls]();
                                paralel.cnt--;
                                setTimeout(function () {
                                    if (0 >= paralel.cnt && !paralel.ran) {
                                        paralel.ran = true;
                                        paralel.afterlast(name);
                                    }
                                }, 1);
                            });
                        }
                    });
                }
            });
        } else {
            paralel.cnt--;
            if (0 >= paralel.cnt && !paralel.ran) {
                paralel.ran = true;
                paralel.afterlast(name);
            }
        }
    };
    window['requireElement'] = requireElement;
    setTimeout(function () {
        requireElement('App')
    },1)


}
String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
