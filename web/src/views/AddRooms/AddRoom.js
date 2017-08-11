var reactiveAddRooms = Ractive.extend({
    oninit: function () {
        console.log('reactiveAddRooms oninit');
    }
});
ractiveComponent['reactive-RoomsApp'].on('submitRoom',function () {
    console.log($('#AddRoom').serializeArray());
});
