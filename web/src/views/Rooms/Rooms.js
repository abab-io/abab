var map =false;
var markers = [];
var reactiveRooms = Ractive.extend({
    oninit: function () {

        console.log('reactiveRooms oninit');
        API('GetRooms', true, {}, function (res) {
            console.log(res);
            ractiveComponent['reactive-RoomsApp'].set('rooms', res.rooms);


            markers = res.rooms.map(function (room, i) {
                if(room.location[0] && room.location[1]) {
                    var infowindow = new google.maps.InfoWindow({
                        content: '<div id="content">' +
                        '<div id="siteNotice">' +
                        '</div>' +
                        '<h1 id="firstHeading" class="firstHeading">' + room.title + '</h1>' +
                        '<div id="bodyContent">' +
                        '<p><b>' + room.title + '</b></p>' +
                        '<p>Transaction: <a href="'+ractiveComponent['reactive-RoomsApp'].get('blockchain_url')+'tx/' + room.txHash + '" target="_blank">' +
                        room.txHash + '</a>' +
                        '<br>' +
                        '(last update ' + room.update_at.split('T')[0] + ').</p>' +
                        '</div>' +
                        '</div>',
                        maxWidth: 250
                    });
                    var marker = new google.maps.Marker({
                        position: {lat: room.location[0]*1, lng: room.location[1]*1},
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
            map = new google.maps.Map(document.getElementById('map-canvas'), {
                zoom: 2,
                center: {lat: 0, lng: -20}
            }); new MarkerClusterer(map, markers,
                {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});


        })
    }
});
