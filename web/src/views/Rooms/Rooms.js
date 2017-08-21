var reactiveRooms = Ractive.extend({
    oninit: function () {
        console.log('reactiveRooms oninit');
        API('GetRooms',true,{},function (res) {
            ractiveComponent['reactive-RoomsApp'].set('rooms', res.rooms);
        })
    }
});
