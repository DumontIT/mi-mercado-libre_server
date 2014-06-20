/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/05/14, at 22:47.
 */
var environment = 'production';
var port = 5000;
var ml = {
    appId: 5646442879385929,
    secretKey: 'wvJMSiGIhAXLyFTochnHuZ2vssZ4D0wh'
};

exports.ml = ml;
exports.port = port;
exports.uri = 'http://localhost:' + port;
exports.db = {
    host: 'localhost',
    schema: 'mi-mercado-libre'
};
exports.auth = {
    user: 'test',
    pass: 'test'
};

exports.monitoring = {
    rollbar: {
        accessToken: '1931a61e5e544b9a9e96b5aec04f25e2',
        configuration: {
            environment: environment
        },
        callback: function (rollbarError) {
            if (rollbarError) {
                console.log("Problem sending message to rollbar: " + rollbarError);
            } else {
                console.log("Recorded message to rollbar");
            }
        }
    }
};