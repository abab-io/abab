var config_lang= {
    default:'en',
    ru:'ru',
    en:'en'
};
function select_lang(lang) {
    if(!lang || lang ==''){
        return swal({
            customClass: 'swal-telegraf-modal select-form text-center',
            buttonsStyling: false,
            confirmButtonClass: 'button-n',
            cancelButtonClass: 'cansel-btns',
            confirmButtonText: _chat_e('Ok'),
            showCancelButton: false,
            type: 'error',
            title: _chat_e('Error!'),
            text: _chat_e('You did not select the language you want to use!')
        });
    }
    swal({
        customClass: 'swal-telegraf-modal select-form text-center',
        showCancelButton: false,
        showConfirmButton: false,
        type: 'info',
        title: _chat_e('Loading lang wait...'),
        text: ''
    });
    localStorage.setItem('lang',lang);
    location.reload();
}