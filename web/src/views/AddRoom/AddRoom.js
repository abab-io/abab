var reactiveAddRoom = Ractive.extend({
    oninit: function () {
        console.log('reactiveAddRoom oninit');
    }
});
ractiveComponent['reactive-AddRoomApp'].on('submitRoom', function () {
    console.log($('#AddRoom').serializeArray());
});
ractiveComponent['reactive-AddRoomApp'].on('addDate', function () {

    var arrDates = ractiveComponent['reactive-AddRoomApp'].get('rangesDate');
    arrDates.push({
        startDate: ractiveComponent['reactive-AddRoomApp'].get('startDate'),
        endDate: ractiveComponent['reactive-AddRoomApp'].get('endDate'),
        priceDay: ractiveComponent['reactive-AddRoomApp'].get('priceDay'),
        discountWeek: ractiveComponent['reactive-AddRoomApp'].get('discountWeek'),
        discountMonth: ractiveComponent['reactive-AddRoomApp'].get('discountMonth'),
        intervalDate: ractiveComponent['reactive-AddRoomApp'].get('intervalDate'),
    });

    ractiveComponent['reactive-AddRoomApp'].set('rangesDate', arrDates);

    ractiveComponent['reactive-AddRoomApp'].set('priceDay', 0);
    ractiveComponent['reactive-AddRoomApp'].set('discountWeek', 0);
    ractiveComponent['reactive-AddRoomApp'].set('discountMonth', 0);
});
ractiveComponent['reactive-AddRoomApp'].set('rangesDate', []);
ractiveComponent['reactive-AddRoomApp'].set('priceDay', 0);
ractiveComponent['reactive-AddRoomApp'].set('discountWeek', 0);
ractiveComponent['reactive-AddRoomApp'].set('discountMonth', 0);


init_daterangepicker('#period-input-date', function (start, end, days) {
    console.log(start, end, days);
    ractiveComponent['reactive-AddRoomApp'].set('intervalDate', days);
    ractiveComponent['reactive-AddRoomApp'].set('startDate', start.format('DD.MM.YY'));
    ractiveComponent['reactive-AddRoomApp'].set('endDate', end.format('DD.MM.YY'));
});
$('[data-toggle="tooltip"]').tooltip();