
var map2 = new google.maps.Map(document.getElementById('map-canvas2'), {
    zoom: 1,
    center: {lat: 20, lng: 20}
});
var geocode =new google.maps.Geocoder();
var marker_home = new google.maps.Marker({
    position: {lat: 0, lng: -20},
    map: map2,
    draggable:true,
    title:"Drag me!"
});
var reactiveAddRoom = Ractive.extend({
    oninit: function () {
        console.log('reactiveAddRoom oninit');
    }
});
ractiveComponent['reactive-AddRoomApp'].set('photos', []);

ractiveComponent['reactive-AddRoomApp'].on('address', function () {
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
    geocode.geocode({address:form_obj['address_address']+','+form_obj['address_city']+','+form_obj['address_state']+','+form_obj['address_country']}, function(results, status) {

        // console.log(results[0].geometry.location.lat(),status,form_obj);
        // console.log(results[0].geometry.location.lng(),status,form_obj);
        if (status == 'OK') {
            if(form_obj['address_country']  && form_obj['address_country']!== '')
                map2.setZoom(4);
            if(form_obj['address_state']  && form_obj['address_state']!== '')
                map2.setZoom(6);
            if(form_obj['address_city']  && form_obj['address_city']!== '')
                map2.setZoom(8);
            if(form_obj['address_address']  && form_obj['address_address']!== '')
                map2.setZoom(11);
            map2.setCenter({lng:results[0].geometry.location.lng(),lat:results[0].geometry.location.lat()});
            marker_home.setPosition({lng:results[0].geometry.location.lng(),lat:results[0].geometry.location.lat()});
        } else {
            // alert('Geocode was not successful for the following reason: ' + status);
        }});
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
    var photos = ractiveComponent['reactive-AddRoomApp'].get('photos');
    delete dateRanges._ractive;
    form_obj.dateRanges = dateRanges;
    form_obj.photo = photos;
    form_obj.wallet = '0xa1b1d9551211755165a677c5e9d4b1041f4b5fd6';


    console.log(form_obj);
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
    API('UpsertRoom', form_obj, false, function (resAPI) {
        console.log(resAPI);
        swal({
            title: ('Отправка транзакции...'),
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
        swal({
            title: 'Подтверждение',
            type: 'question',
            confirmButtonText: 'Да',
            cancelButtonText: 'Нет',
            showCancelButton: true,
            text: "Отправить обект [" + resAPI.room._id + "]в SmartContract (Abab.io)? ",
            showLoaderOnConfirm: true,
            preConfirm: function () {
                API('UpsertRoom', {_id: resAPI.room._id, status: 2}, false, function (resAPI) {
                    console.log(resAPI);
                    if (!resAPI || !resAPI.room || !resAPI.room.txHash)
                        swal({
                            title: 'Ошибка',
                            type: 'error',
                            confirmButtonText: 'Ok',
                            showCancelButton: false
                        });
                    swal({
                        title: 'Отправленно',
                        type: 'success',
                        confirmButtonText: 'Okay',
                        showCancelButton: false,
                        html: "<div style='position: initial; width: 100%; vertical-align: bottom;text-overflow: ellipsis;overflow: hidden;'>Ropsten Ethereum TxHash: <a href='https://ropsten.etherscan.io/tx/" + resAPI.room.txHash + "' target='_blank' title='" + resAPI.room.txHash + "'>" + resAPI.room.txHash + "</a></div>",
                    });
                }, true);

            }
        });
    }, true);

});
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
    url: "/api/v1/upload_image_s3/",
    type: "POST",
    fileName: "file",
    allowedTypes: 'jpg,png,jpeg',
    uploadStr: 'Добавить фото',
    acceptFiles: 'image/*',
    showPreview: true,
    previewHeight: "120px",
    previewWidth: "120px",
    autoSubmit: true,
    showAbort: false,
    returnType: 'json',
    // showDone: false,
    showFileCounter: false,
    multiple: true,
    showDelete: true,
    showProgress: true,
    onSuccess:function (files,res) {
        var arrPhoto = ractiveComponent['reactive-AddRoomApp'].get('photos');
        arrPhoto.push(res.files[0].sha1);
        delete arrPhoto._ractive;

        ractiveComponent['reactive-AddRoomApp'].set('photos', arrPhoto);

        console.log(files,res.files[0].sha1)

    }
    // showError: false,
    // showStatusAfterSuccess: false,

});

$('.timeInput').timepicker({'timeFormat': 'H:i'});