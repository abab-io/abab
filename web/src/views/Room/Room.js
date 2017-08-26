var map3;
var marker_homeThis;
var reactiveRoom = Ractive.extend({
    oninit: function () {
        console.log('reactiveAddRoom oninit');

        API('GetRooms', {find: {_id: ABAB.pageObj.tab_page}}, true, function (res) {
            map3 = new google.maps.Map(document.getElementById('map-canvas3'), {
                zoom: 11,
                center: {lat: 1*res.rooms[0].location[0], lng: 1*res.rooms[0].location[0]}
            });
            marker_homeThis = new google.maps.Marker({
                position:  {lat: 1*res.rooms[0].location[0], lng: 1*res.rooms[0].location[0]},
                map: map3,
                title:"This room!"
            });
            console.log(res);
            if (res.error || !res.rooms || res.rooms.length !== 1) {
                ABAB.setPage('Rooms', 'all');
                return swal('Уппс...', 'Не удалось загрузить комнату', 'error')
            }
            ractiveComponent['reactive-RoomApp'].set('room', res.rooms[0]);
            var minimalPriceDay = 99999999999;
            for (var k in  res.rooms[0].dateRanges) {
                if (minimalPriceDay > res.rooms[0].dateRanges[k].priceDay) {
                    minimalPriceDay = res.rooms[0].dateRanges[k].priceDay
                }
            }
            ractiveComponent['reactive-RoomApp'].set('minimalPriceDay', minimalPriceDay);

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


        init_daterangepicker('#period-input-date-booking', function (start, end, days) {
            var room_data = ractiveComponent['reactive-RoomApp'].get('room');
            console.log(start, end, days);
            console.log(room_data);
            ractiveComponent['reactive-RoomApp'].set('intervalDate', days);
            ractiveComponent['reactive-RoomApp'].set('startDate', start.format('DD.MM.YY'));
            ractiveComponent['reactive-RoomApp'].set('endDate', end.format('DD.MM.YY'));
            var sd = +(moment.utc(start.format('DD.MM.YY'), 'DD.MM.YY').unix() / (24 * 60 * 60)).toFixed(0);
            var ed = +(moment.utc(end.format('DD.MM.YY'), 'DD.MM.YY').unix() / (24 * 60 * 60)).toFixed(0);
            ractiveComponent['reactive-RoomApp'].set('startDateDay',sd);
            ractiveComponent['reactive-RoomApp'].set('endDateDay', ed);
            ractiveComponent['reactive-RoomApp'].set('loadingCost', true);

            API('fn_CalcTotalCost',{_host:room_data.wallet,_roomIndex:room_data._index,_from:sd,_to:ed},true,function (res) {
                console.log(res);
                ractiveComponent['reactive-RoomApp'].set('cost', res.result.result);
                ractiveComponent['reactive-RoomApp'].set('loadingCost', false);

            },true)
        });



    }
});
ractiveComponent['reactive-RoomApp'].on('submitRoom', function () {
    console.log($('#AddRoom').serializeArray());
});

ractiveComponent['reactive-RoomApp'].on('booking', function () {
    swal({
        title: 'Подтверждение',
        type: 'question',
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
        showCancelButton: true,
        text: "Вы действительно хотите забронировать данный обект с "+ractiveComponent['reactive-RoomApp'].get('startDate')+' по '+ractiveComponent['reactive-RoomApp'].get('endDate'),
        showLoaderOnConfirm: true,
        preConfirm: function () {
            swal({
                title: ('Бронирование...'),
                closeOnConfirm: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: true,
                showCancelButton: false,
                showLoaderOnConfirm: true,
                text: _chat_e('Может занять несколько секунд'),
                preConfirm: function () {
                    return new Promise(function (resolve, reject) {
                        // here should be AJAX request
                        setTimeout(function () {
                            resolve();
                        }, 30000);
                    });
                },
            });
            swal.showLoading();
            var room_data = ractiveComponent['reactive-RoomApp'].get('room');
            var sd = ractiveComponent['reactive-RoomApp'].get('startDateDay');
            var ed = ractiveComponent['reactive-RoomApp'].get('endDateDay');
            API('fn_CalcTotalCost',{_host:room_data.wallet,_roomIndex:room_data._index,_from:sd,_to:ed},true,function (res) {
                if(!res.result.result || +res.result.result <= 0){
                    swal({
                        title: 'Ошибка',
                        type: 'error',
                        text: 'Обект не готов принимать гостей в данные числа попробуйте другие  или выбирите другой обект',
                        confirmButtonText: 'Ок',
                        showCancelButton: false
                    });
                }

            },true)
        }
    });

});
//
//

//
//
