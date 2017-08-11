var reactiveAddRoom = Ractive.extend({
    oninit: function () {
        console.log('reactiveAddRoom oninit');
    }
});
ractiveComponent['reactive-AddRoomApp'].on('submitRoom', function () {
    var formarr = $('#AddRoom').serializeArray();
    var form_obj = {};
    for (var i in formarr) {
        if (form_obj[formarr[i].name] && typeof form_obj[formarr[i].name] === 'string') {
            form_obj[formarr[i].name] = [form_obj[formarr[i].name], formarr[i].value];
        } else if (form_obj[formarr[i].name] && typeof form_obj[formarr[i].name] === 'object') {
            form_obj[formarr[i].name].push(formarr[i].value);
        } else
            form_obj[formarr[i].name] = formarr[i].value
    }
    var dateRanges = ractiveComponent['reactive-AddRoomApp'].get('rangesDate');
    delete dateRanges._ractive;
    form_obj.dateRanges = dateRanges;

    console.log(form_obj);
    API('UpsertRoom', {}, false, function () {

    }, true);
    swal({
        title: ('Обработка данных...'),
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
    setTimeout(function () {
        swal({
            title: 'Подтверждение',
            type: 'question',
            confirmButtonText: 'Да',
            cancelButtonText: 'Нет',
            showCancelButton: true,
            text: "Отправить обект в SmartContract (Abab.io)? ",
            showLoaderOnConfirm: true,
            preConfirm: function () {
            }
        });

    }, 3000);

});
$('.timeInput').timepicker({'timeFormat': 'H:i'});
ractiveComponent['reactive-AddRoomApp'].on('removeDate', function (i, index) {
    var arrDates = ractiveComponent['reactive-AddRoomApp'].get('rangesDate');
    arrDates.splice(index, 1);
    ractiveComponent['reactive-AddRoomApp'].set('rangesDate', arrDates);
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
$("#fileuploader").uploadFile({
    url: "#111",
    fileName: "myfile",
    allowedTypes: 'jpg,png,jpeg',
    uploadStr: 'Добавить фото',
    acceptFiles: 'image/*',
    showPreview: true,
    previewHeight: "120px",
    previewWidth: "120px",
    autoSubmit: false,
    showAbort: false,
    returnType: 'json',
    showDone: false,
    showFileCounter: false,
    showError: false,
    showStatusAfterSuccess: false,
    onSelect: function (files) {
        console.log('onSelect', files);
    }
});