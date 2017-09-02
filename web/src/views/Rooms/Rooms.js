var map = false;
var markers = [];
var reactiveRooms = Ractive.extend({
    oninit: function () {
        ABAB.map.call_wait_auth(function () {
            geocode = new google.maps.Geocoder();
            map = new google.maps.Map(document.getElementById('map-canvas'), {
                zoom: 2,
                center: {lat: 0, lng: -20}
            });
            ABAB.event['update_filter']({page: 1}, false);
            procent = 0.25;
        });

        console.log('reactiveRooms oninit');

    }
});

ractiveComponent['reactive-RoomsApp'].on('pageset', function (e, page) {
    ABAB.event['update_filter']({page: page}, false);
});


ractiveComponent['reactive-RoomsApp'].on('update_filter', function (e, id) {
    var formarr = $('#' + id).serializeArray();
    var form_obj = {};
    for (var i in formarr) {
        if (form_obj[formarr[i].name] && typeof form_obj[formarr[i].name] === 'string') {
            form_obj[formarr[i].name] = [form_obj[formarr[i].name], formarr[i].value];
        } else if (form_obj[formarr[i].name] && typeof form_obj[formarr[i].name] === 'object') {
            form_obj[formarr[i].name].push(formarr[i].value);
        } else
            form_obj[formarr[i].name] = formarr[i].value
    }
    if (form_obj.facilities) form_obj.facilities = {$all: form_obj.facilities};

    ABAB.event['update_filter'](form_obj, true);

});
let filter_rooms = {};
ABAB.on('update_filter', function (param, save) {
    if (!param) param = {};
    if (!param.page && save) {
        Object.assign(filter_rooms, param);
    }
    if (!param.page) param.page = 1;
    console.log('GetRooms filter:',filter_rooms);

    API('GetRooms', {page: param.page, find: filter_rooms}, true, function (res) {
        console.log(res);
        ractiveComponent['reactive-RoomsApp'].set('rooms', res.rooms);
        ractiveComponent['reactive-RoomsApp'].set('rooms_count', res.count);


        markers = res.rooms.map(function (room, i) {
            if (room.location[0] && room.location[1]) {
                var infowindow = new google.maps.InfoWindow({
                    content: '<div id="content">' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<h1 id="firstHeading" class="firstHeading">' + room.title + '</h1>' +
                    '<div id="bodyContent">' +
                    '<p><b>' + room.title + '</b></p>' +
                    '<p>Transaction: <a href="' + ractiveComponent['reactive-RoomsApp'].get('blockchain_url') + 'tx/' + room.txHash + '" target="_blank">' +
                    room.txHash + '</a>' +
                    '<br>' +
                    '(last update ' + room.update_at.split('T')[0] + ').</p>' +
                    '</div>' +
                    '</div>',
                    maxWidth: 250
                });
                var marker = new google.maps.Marker({
                    position: {lat: room.location[0] * 1, lng: room.location[1] * 1},
                    // label: ''
                    animation: google.maps.Animation.DROP,
                    map: map

                });
                marker.addListener('click', function () {
                    infowindow.open(map, marker);
                });
                return marker;
            }
            else return false;
        });
        new MarkerClusterer(map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

        procent = 0.30;

    }, true);
});