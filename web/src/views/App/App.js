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


ractiveComponent['rootApp'].on('register_modal', function () {
    console.log('register_modal click');
});

ractiveComponent['rootApp'].on('login', function () {
    console.log('login click');
    console.log($('#auth_form').serializeArray());

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

function init_daterangepicker(selector,callback) {
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

        callback && callback(start,end,+moment(end).diff(moment(start),'days'));
        console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' , count_days: '+moment(end).diff(moment(start),'days')+'(predefined range: ' + label + ')');
    });

}