/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 13/06/14, at 16:40.
 */
var express = require('express')
    , properties = require('../properties');

// Asynchronous authentication
exports.basicAuth = express.basicAuth(function (username, password, callback) {
    console.log('Trying to login username: ' + username);

    callback(undefined, username === properties.auth.user && password == properties.auth.pass);
});

