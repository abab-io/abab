var auth_timeout, ncoonect,
    port = 3001,
    host = "ws.abab.io",
    pathSoket = "socket/v1",
    typeAPI = 'http', /* ws,http */
    paramURL = param_url_this(), socket,
    countConn = 0, deleyConnect = [500, 2000, 4000, 6000, 10000, getRandomInt(15000, 25000)],
    WebSocket = window.WebSocket || window.MozWebSocket;

if (!window._version_app) window._version_app = '0.0.1';

var paramSocket = {
    version_app: window._version_app,
    api_key: paramURL.api_key,
};

var onEmiter = {};
// animate css =>
$.fn.extend({
    animateCss: function (animationName, cb) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        $(this).addClass('animated ' + animationName).one(animationEnd, function () {
            $(this).removeClass('animated ' + animationName);
            cb && cb();
        });
    }
});

function param_url_this() {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}

function jsonToUrl(json) {
    var paramURL = "";
    for (var key in json) paramURL += "&" + key + "=" + json[key];
    return paramURL.replace('&', "?");
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Emit(json) {
    try {
        var str = JSON.stringify(json);
        if (socket && socket.send)
            socket.send(str);
    } catch (e) {
        console.warn('[WSS] EMIT No valid JSON:,', e, '\n\t', json);
    }
}
function API(method, param, _public, cb, reset_cb) {
    if (!method || typeof method != 'string' || method == '')
        return console.error('[API] error emit ,', method, param, _public);
    if (typeof _public == 'function') {
        reset_cb = cb;
        cb = _public;
        _public = false
    }
    if (typeAPI === 'ws') {

        if (_public) {
            Emit({event: 'api/public', data: {method: method, data: param}});
        } else {
            Emit({event: 'api', data: {method: method, data: param}});
        }
        if (typeof cb == 'function') {

            if (_public) {
                if (!onEmiter.hasOwnProperty('API_Response_public_' + method))
                    onEmiter['API_Response_public_' + method] = cb;
            }
            else {
                if (!onEmiter.hasOwnProperty('API_Response_' + method))
                    onEmiter['API_Response_' + method] = cb;
            }
            if (reset_cb) {
                if (_public)
                    onEmiter['API_Response_public_' + method] = cb;
                else
                    onEmiter['API_Response_' + method] = cb;
            }
        }
    } else {
        if(_public) method = 'public_'+method;
        $.ajax({
            url: "http://localhost:8000/api/v1/?method="+method+"&api_key=DJUQU-PkRT1Upz-SNgol-Y4gdX-dD7OC3-1500657341036",
            type: "get", //send it through get method
            data: param,
            success: function (response) {
                if(response && typeof response === 'string')  response = JSON.parse(response);
                if(!response) response= {};

                cb && cb(response)
            },
            error: function (xhr) {
                console.error('[API] Error $.ajax:', xhr)
            }
        });


    }
}
function updatePlugins() {



    $(document).on("click.bs.dropdown.data-api", ".noclose", function (e) {
        e.stopPropagation()
    });


    jQuery('.showsl').click(function () {
        jQuery('.showsl').toggleClass("str-full");
    });


    $.datepicker._defaults.onAfterUpdate2 = null;
    var datepicker__updateDatepicker2 = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function (inst) {
        datepicker__updateDatepicker2.call(this, inst);
        var onAfterUpdate2 = this._get(inst, 'onAfterUpdate2');
        if (onAfterUpdate2)
            onAfterUpdate2.apply((inst.input ? inst.input[0] : null),
                [(inst.input ? inst.input.val() : ''), inst]);
    };
    var cur2 = -1, prv2 = -1;
    $('.jrange2 div')
        .datepicker({
            //numberOfMonths: 3,

            changeMonth: true,
            changeYear: true,

            beforeShowDay: function (date) {
                return [true, ( (date.getTime() >= Math.min(prv2, cur2) && date.getTime() <= Math.max(prv2, cur2)) ? 'date-range-selected' : '')];
            },
            onSelect: function (dateText, inst) {
                var d1, d2;
                prv2 = cur2;
                cur2 = (new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay)).getTime();
                if (prv2 == -1 || prv2 == cur2) {
                    prv2 = cur2;
                    $('.jrange2 input').val(dateText);
                } else {
                    d1 = $.datepicker.formatDate('mm/dd/yy', new Date(Math.min(prv2, cur2)), {});
                    d2 = $.datepicker.formatDate('mm/dd/yy', new Date(Math.max(prv2, cur2)), {});
                    $('.jrange2 input').val(d1 + ' - ' + d2);
                }
            },
            onChangeMonthYear: function (year, month, inst) {
                //prv2 = cur2 = -1;
            },
            onAfterUpdate2: function (inst) {
                $('<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click">Done</button>')
                    .appendTo($('.jrange2 div .ui-datepicker-buttonpane'))
                    .on('click', function () {
                        $('.jrange2 div').hide();
                    });
            }
        })

        .hide();
    $('.jrange2 input').on('focus', function (e) {
        var v = this.value,
            d;
        try {
            if (v.indexOf(' - ') > -1) {
                d = v.split(' - ');
                prv2 = $.datepicker.parseDate('mm/dd/yy', d[0]).getTime();
                cur2 = $.datepicker.parseDate('mm/dd/yy', d[1]).getTime();
            } else if (v.length > 0) {
                prv2 = cur2 = $.datepicker.parseDate('mm/dd/yy', v).getTime();
            }
        } catch (e) {
            cur2 = prv2 = -1;
        }
        if (cur2 > -1)
            $('.jrange2 div').datepicker('setDate', new Date(cur2));
        $('.jrange2 div').datepicker('refresh').show();
    });


    jQuery('<div class="quantity-nav"><div class="quantity-button quantity-up">+</div><div class="quantity-button quantity-down">-</div></div>').insertAfter('.quantity input');
    jQuery('.quantity').each(function () {
        var spinner = jQuery(this),
            input = spinner.find('input[type="number"]'),
            btnUp = spinner.find('.quantity-up'),
            btnDown = spinner.find('.quantity-down'),
            min = input.attr('min'),
            max = input.attr('max');

        btnUp.click(function () {
            var oldValue = parseFloat(input.val());
            if (oldValue >= max) {
                var newVal = oldValue;
            } else {
                var newVal = oldValue + 1;
            }
            spinner.find("input").val(newVal);
            spinner.find("input").trigger("change");
        });

        btnDown.click(function () {
            var oldValue = parseFloat(input.val());
            if (oldValue <= min) {
                var newVal = oldValue;
            } else {
                var newVal = oldValue - 1;
            }
            spinner.find("input").val(newVal);
            spinner.find("input").trigger("change");
        });

    });
}
var ABAB = {
    event: {},
    page: null,
    on: function (event, fn) {
        ABAB.event[event] = fn;
    },
    setPage: function (page, tabPage, historyAdd) {

        if (ractiveComponent && ABAB.page && ractiveComponent[ABAB.page] && ractiveComponent[ABAB.page].fragment.rendered) {
            ractiveComponent[ABAB.page].unrender();
        }


        var page_param = page.split(':');
        page = page_param[0];
        console.log('setPage:', page, page_param[1]
            , tabPage);
        if (page_param[1]) tabPage = page_param[1];
        if (page_param[2]) tabPage = page_param[1];
        ractiveComponent.rootApp.set('pageActive', 'contentApplication');
        if ('Rooms' == page) {
            if (!tabPage) tabPage = 'all';
            requireElement({name: 'Rooms', ver: '1.1.0', element: '#content_block'}, {
                cnt: 0,
                afterlast: function (name) {

                    if (name) name = name + 'App';
                    ABAB.page = name;
                    if (ractiveComponent && ABAB.page && ractiveComponent[ABAB.page] && !ractiveComponent[ABAB.page].fragment.rendered) {
                        ractiveComponent[ABAB.page].render();

                    }
                }
            });
        }else if('Create' === page && tabPage === 'Room'){
            requireElement({name: 'AddRoom', ver: '1.1.0', element: '#content_block'}, {
                cnt: 0,
                afterlast: function (name) {

                    if (name) name = name + 'App';
                    ABAB.page = name;
                    if (ractiveComponent && ABAB.page && ractiveComponent[ABAB.page] && !ractiveComponent[ABAB.page].fragment.rendered) {
                        ractiveComponent[ABAB.page].render();

                    }
                }
            });
        }else{

            requireElement({name: page, ver: '1.1.0', element: '#content_block'}, {
                cnt: 0,
                afterlast: function (name) {

                    if (name) name = name + 'App';
                    ABAB.page = name;
                    if (ractiveComponent && ABAB.page && ractiveComponent[ABAB.page] && !ractiveComponent[ABAB.page].fragment.rendered) {
                        ractiveComponent[ABAB.page].render();

                    }
                }
            });
        }
        setTimeout(updatePlugins,100);
        if (!historyAdd)
            history.pushState({}, "ABAB.io | " + page, "#" + page + '-' + tabPage);
        ractiveComponent['rootApp'].set('page', page);
    },
    auth_action: {
        status: false,
        cb_function_arr: [],
        call_wait_auth: function (fn) {
            if (!ABAB.auth_action.status) {
                ABAB.auth_action.cb_function_arr.push(fn);
            } else {
                fn();
            }
        },
        auth_emit: function () {
            if (!ABAB.auth_action.status) {
                ABAB.auth_action.status = true;
                for (var k in  ABAB.auth_action.cb_function_arr) {
                    ABAB.auth_action.cb_function_arr[k]();
                }
                ABAB.auth_action.cb_function_arr = [];
            }
        }
    },
    auth: function (data) {

        if (data.status && data.status == 'success') {
            ABAB.auth_action.auth_emit();
        } else {

            swal({
                title: _chat_e('Opps...'),
                text: _chat_e("Try to log in again or restart the app."),
                customClass: 'swal-telegraf-modal',
                buttonsStyling: false,
                confirmButtonClass: 'button-n',
                cancelButtonClass: 'cansel-btns',
                showCancelButton: true,
                type: 'error',
                cancelButtonText: _chat_e('Reload'),
                confirmButtonText: _chat_e('Logout'),
                showLoaderOnConfirm: true,
                preConfirm: function () {


                    return new Promise(function (resolve, reject) {
                        var t = setTimeout(function () {
                            reject(_chat_e('Error! Server unavailable.'));
                        }, 10000);

                    })
                },
                allowOutsideClick: false
            }).then(function () {
                location.reload();
                swal.closeModal()
            }, function () {
                location.reload();
                swal.closeModal()
            });


        }
    },
    serverDisconnect: function () {
        console.warn('server:serverDisconnect');
    }
};

function start() {


    socket = new WebSocket("wss://" + host + "/" + pathSoket + jsonToUrl(paramSocket), ["soap", "wamp"]);
    socket.onopen = function () {
        console.log("[WSS] Соединение установлено.", paramSocket);
        countConn = 0;

        clearTimeout(auth_timeout);
        auth_timeout = setTimeout(function () {
            ABAB.auth({status: false, error: 'client timeout auth App.element.js (157)'})
        }, 30000);
        if (ncoonect && ncoonect.close) ncoonect.close();
        // ncoonect = noty({
        //     text: _chat_e('Соединение установлено.'),
        //     type: 'information',
        //     theme: 'metroui',
        //     layout: 'top',
        //     timeout: 2000,
        //     progressBar: true,
        //     animation: {
        //         open: 'animated fadeInDown',
        //         close: 'animated fadeOutUp'
        //     }
        // });
    };
    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log('[WSS] Соединение закрыто чисто');
        } else {
            setTimeout(function () {
                if (countConn < 5)
                    countConn++;
                start()
            }, deleyConnect[countConn]);
            console.log('[WSS] Обрыв соединения'); // например, "убит" процесс сервера
        }
        if (ncoonect && ncoonect.close) ncoonect.close();
        if (countConn > 1) {
            ncoonect = noty({
                text: _chat_e('Impossible to establish connection. Check connection to the Internet'),
                type: 'error',
                theme: 'metroui',
                layout: 'top',
                timeout: deleyConnect[countConn] - 100,
                progressBar: true
            });
        }
        clearTimeout(auth_timeout);
        console.log('[WSS] Close Connection. Code:' + event.code + ' Reason:' + event.reason);
    };
    socket.onmessage = function (event) {
        try {
            var object = JSON.parse(event.data);
        } catch (e) {
            console.warn('[WSS] onmessage No valid JSON:\n\t', event.data);

        }
        console.log(object);
        if (object && object.event && onEmiter.hasOwnProperty(object.event)) {
            if (object.data) {
                onEmiter[object.event](object.data);
            } else {
                onEmiter[object.event]();
            }
        } else console.warn("[WSS] Warn onEmiter(event) \n\tObject: ", object)


    };

    socket.onerror = function (error) {
        ABAB.serverDisconnect();
        clearTimeout(auth_timeout);
        // procent = 0.30;
        console.log("[WSS] Error " + error.message);
    };
}
// start();

if (config_lang[localStorage.getItem('lang')])
    $.getScript("lang/" + config_lang[localStorage.getItem('lang')] + ".js", function () {
        procent = 0.10;
        $.getScript("src/js/init.js?ver=1.0.0", function () {
            init();
        });
    });
else {
    $.getScript("lang/" + config_lang.default + ".js", function () {
        procent = 0.10;
        $.getScript("src/js/init.js?ver=1.0.0", function () {
            init();
        });
    });
}