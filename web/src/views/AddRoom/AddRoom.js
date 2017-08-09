var reactiveAddRoom = Ractive.extend({
    oninit: function () {
        console.log('reactiveAddRoom oninit');
    }
});
ractiveComponent['reactive-AddRoomApp'].on('submitRoom',function () {
    console.log($('#AddRoom').serializeArray());
});
init_daterangepicker('#period-input-date');
$('[data-toggle="tooltip"]').tooltip();