const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'Abab@abab.io',
        pass: 'Abab777Abab'
    }
});
function send(to, subject, text, html, cb) {

    transporter.sendMail({
        from: '"Abab@abab.io" <Abab@abab.io>',
        to: to,
        subject: subject,
        text: text,
        html: html
    }, (error, info) => {
        if (error) {
            cb && cb(error, null);
            return console.error(error);
        }
        cb && cb(null, info)
    });
}
exports.send = send;