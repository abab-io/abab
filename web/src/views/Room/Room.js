var reactiveRoom = Ractive.extend({
    oninit: function () {
        console.log('reactiveAddRoom oninit');
        API('GetRooms', {find: {_id: ABAB.pageObj.tab_page}}, true, function (res) {
            console.log(res);
            if (res.error || !res.rooms || res.rooms.length !== 1) {
                ABAB.setPage('Rooms', 'all');
                return swal('Уппс...', 'Не удалось загрузить комнату', 'error')
            }
            ractiveComponent['reactive-RoomApp'].set('room', res.rooms[0]);
            var minimalPriceDay = 99999999999;
            for(var k in  res.rooms[0].dateRanges){
                if(minimalPriceDay > res.rooms[0].dateRanges[k].priceDay){
                    minimalPriceDay = res.rooms[0].dateRanges[k].priceDay
                }
            }
            ractiveComponent['reactive-RoomApp'].set('minimalPriceDay',minimalPriceDay );

            if ($(window).width() > 991) {

                $('.slider-for').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    fade: true,
                    asNavFor: '.slider-nav'
                });
                $('.slider-nav').slick({
                    vertical: true,
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    asNavFor: '.slider-for',
                    dots: false,

                    focusOnSelect: true
                });


            }


            if ($(window).width() < 602) {

                $('.slider-for').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    fade: true,
                    asNavFor: '.slider-nav'
                });
                $('.slider-nav').slick({
                    vertical: false,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    asNavFor: '.slider-for',
                    dots: false,

                    focusOnSelect: true
                });


            }

            if ($(window).width() < 992) {

                $('.slider-for').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    fade: true,
                    asNavFor: '.slider-nav'
                });
                $('.slider-nav').slick({
                    vertical: false,
                    slidesToShow: 6,
                    slidesToScroll: 1,
                    asNavFor: '.slider-for',
                    dots: false,

                    focusOnSelect: true
                });


            }

        }, true);
    }
});
ractiveComponent['reactive-RoomApp'].on('submitRoom', function () {
    console.log($('#AddRoom').serializeArray());
});


init_daterangepicker('#period-input-date-booking', function (start, end, days) {
    console.log(start, end, days);
    ractiveComponent['reactive-RoomApp'].set('intervalDate', days);
    ractiveComponent['reactive-RoomApp'].set('startDate', start.format('DD.MM.YY'));
    ractiveComponent['reactive-RoomApp'].set('endDate', end.format('DD.MM.YY'));
});

//
//

//
//
