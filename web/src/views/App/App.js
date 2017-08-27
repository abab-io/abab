var reactiveApp = Ractive.extend({
    oninit: function () {
        console.log('reactiveApp oninit');
        procent = 0.30;
        if (location.hash.replace('#', '').split('-')[0] && location.hash.replace('#', '').split('-')[0] != '')
            ABAB.setPage(location.hash.replace('#', '').split('-')[0], location.hash.replace('#', '').split('-')[1], true);
        else
            ABAB.setPage('Rooms');

    },
    onrender: function () {
        console.log('reactiveApp onrender');


    },
    oncomplete: function () {
        console.log('reactiveApp oncomplete');


    }

});

ractiveComponent['rootApp'].set('auth_type', 'login');
ractiveComponent['rootApp'].on('logout', function () {
    swal({
        title: 'Подтверждение',
        type: 'question',
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        showCancelButton: true,
        text: "Вы действительно хотите выйти?",
        showLoaderOnConfirm: true,
        preConfirm: function () {
            ABAB.auth_action.logout(function () {
                swal.closeModal();
            });
        }});
});
ractiveComponent['rootApp'].on('change_type_auth_modal', function () {

    if (ractiveComponent['rootApp'].get('auth_type') === 'reg') ractiveComponent['rootApp'].set('auth_type', 'login');
    else if (ractiveComponent['rootApp'].get('auth_type') === 'login') ractiveComponent['rootApp'].set('auth_type', 'reg');
    console.log('register_modal click');
});
if (localStorage.getItem('auth')) {
    try {
        var loginData = JSON.parse(localStorage.getItem('auth'));
        API('public_auth_email', loginData, function (res) {
            console.log(res);
            if (res.error) {
                localStorage.removeItem('auth');
                return swal('Ошибка авторизации', res.error.message, 'error');
            }
            if (res.success && res.user) {
                ABAB.auth(res);

            } else {
                localStorage.removeItem('auth');
                return swal('Ошибка авторизации', res.error.message, 'error');
            }
        }, true);
    }catch (e){
        console.error('auth storage parse',e);
        localStorage.removeItem('auth');
    }
}
ractiveComponent['rootApp'].on('auth_start', function () {
    console.log('login click');
    var formarr = $('#auth_form').serializeArray();

    var form_obj = {};
    for (var i in formarr) {
        if (form_obj[formarr[i].name] && typeof form_obj[formarr[i].name] === 'string') {
            form_obj[formarr[i].name] = [form_obj[formarr[i].name], formarr[i].value];
        } else if (form_obj[formarr[i].name] && typeof form_obj[formarr[i].name] === 'object') {
            form_obj[formarr[i].name].push(formarr[i].value);
        } else
            form_obj[formarr[i].name] = formarr[i].value
    }
    console.log(form_obj);
    if (form_obj.from === 'reg') {
        API('public_registration_email', {
            email: form_obj.email,
            password: form_obj.password,
            name: form_obj.name,
            surname: form_obj.surname
        }, function (res) {
            if (res.error)
                return swal('Ошибка авторизации', res.error.message, 'error');
             swal('Успешно зарегестрированны', 'На вашу почту "'+form_obj.email+'", было отправлено письмо с ссылкой на активацию аккаунта', 'success');
            if (ractiveComponent['rootApp'].get('auth_type') === 'reg') ractiveComponent['rootApp'].set('auth_type', 'login');

            console.log(res);
        }, true)
    }
    if (form_obj.from === 'login') {
        localStorage.setItem('auth', JSON.stringify());
        API('public_auth_email', {email: form_obj.email, password: form_obj.password}, function (res) {
            console.log(res);
            if (res.error)
                return swal('Ошибка авторизации', res.error.message, 'error');
            if (res.success && res.user) {
                localStorage.setItem('auth', JSON.stringify({email: form_obj.email, password: form_obj.password}));

                ABAB.auth(res);
                $('#formModal').modal('hide');
                return swal('Добро пожаловать на Abab.io', '', 'success');

            } else {
                return swal('Ошибка авторизации', res.error.message, 'error');
            }

        }, true)

    }
});
window.onpopstate = function (event) {
    if (location.hash.replace('#', '').split('-')[0] && location.hash.replace('#', '').split('-')[0] != '')
        ABAB.setPage(location.hash.replace('#', '').split('-')[0], location.hash.replace('#', '').split('-')[1], true);

};
// if HTML DOM Element that contains the map is found...
// if (document.getElementById('map-canvas')) {
//
//     // Coordinates to center the map
//     var myLatlng = new google.maps.LatLng(52.525595, 13.393085);
//
//     // Other options for the map, pretty much selfexplanatory
//     var mapOptions = {
//         zoom: 14,
//         center: myLatlng,
//         mapTypeId: google.maps.MapTypeId.ROADMAP
//     };
//
//     // Attach a map to the DOM Element, with the defined settings
//     var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
//
// }
//

init_daterangepicker('#config-demo');

function init_daterangepicker(selector, callback) {
    var options = {};


    options.ranges = {
        '7 Days': [moment(), moment().subtract(-7, 'days').format('DD.MM.YY')],
        '15 Days': [moment(), moment().subtract(-15, 'days'), moment()],
        'This Month': [moment(), moment().endOf('month')],
        '1 Month': [moment(), moment().subtract(-1, 'month')],
        '6 Month': [moment(), moment().subtract(-6, 'month')],
        'Year': [moment(), moment().subtract(-1, 'year')]
    };

    // $('#rtl-wrap').show();
    options.locale = {
        // direction: $('#rtl').is(':checked') ? 'rtl' : 'ltr',
        format: 'DD.MM.YY',
        separator: ' - ',
        applyLabel: 'Apply',
        cancelLabel: 'Cancel',
        fromLabel: 'From',
        toLabel: 'To',
        customRangeLabel: 'Custom',
        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        firstDay: 1
    };

    options.minDate = moment();
    // $('#config-text').val("$('#demo').daterangepicker(" + JSON.stringify(options, null, '    ') + ", function(start, end, label) {\n  console.log(\"New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')\");\n});");

    $(selector).daterangepicker(options, function (start, end, label) {

        callback && callback(start, end, +moment(end).diff(moment(start), 'days'));
        console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' , count_days: ' + moment(end).diff(moment(start), 'days') + '(predefined range: ' + label + ')');
    });

}