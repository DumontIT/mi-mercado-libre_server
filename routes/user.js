/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 15/04/14, at 12:10.
 */
var mongoose = require('mongoose')
    , User = mongoose.model('User');

exports.findAll = function (req, res) {
    User.find(function (err, users) {
        if (err) {
            console.log('An error occurred while finding users: ' + err);
        } else {
            res.send(200, users);
        }
    });
};