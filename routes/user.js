/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 15/04/14, at 12:10.
 */
require('../model/user');
var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , auth = require('../controllers/authentication');

var findAll = function (req, res) {
    User.find(function (err, users) {
        if (err) {
            console.log('An error occurred while finding users: ' + err);
        } else {
            res.send(200, users);
        }
    });
};

var findOrCreateUser = function (req, res, next) {
    User.findOne({id: req.params.id}, function (error, user) {

        if (error) {
            console.log('An error ocurred while finding a user by its ID: %s', req.params.id);
        } else if (!user) {
            console.log('No user found!');
        } else {
            console.log('User found: %s', user.id);
        }
    });

    next();
};

function sendDummyResponse(req, res) {
    res.send(200);
}

module.exports = function (app) {
    app.get('/users', findAll);
    app.post('/users/:id/subscriptions', auth.basicAuth, findOrCreateUser, sendDummyResponse);
};