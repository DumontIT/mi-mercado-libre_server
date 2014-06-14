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
    console.log('Finding user w/ id: %s', req.params.id);

    var updateRequestAndCallNext = function (user) {
        req.user = user;
        next();
    };

    User.findOne({id: req.params.id}, function (error, user) {
        if (error) {
            console.log('An error ocurred while finding a user by its ID: %s', req.params.id);
        } else if (!user) {
            console.log('No user found!');
            User.create({
                            id: req.params.id
                        }, function (error, user) {

                updateRequestAndCallNext(user);
            });
        } else {
            console.log('User found: %s', user.id);
            updateRequestAndCallNext(user);
        }
    });
};

function addSubscriptions(req, res, next) {
    console.log('Adding subscriptions for user: %s', req.user.id);

    //  TODO : Link user subscriptions to a specific product!

    next();
}

function updateQueriesAndFilters(req, res, next) {
    var userQuery = req.body.query
        , found
        , index = 0;

    for (index; index < req.user.queries.length; index++) {
        var eachQuery = req.user.queries[index];

        if (eachQuery === userQuery) {
            found = true;
            console.log('User already has the saved query: %s', userQuery);
            break;
        }
    }

    if (!found) {
        console.log('Adding a new saved query: %s', userQuery);
        req.user.queries.push(userQuery);

        console.log('Updating user on storage...');
        User.update({
                        _id: req.user._id
                    }, {
                        $set: {queries: req.user.queries}
                    }, function (error, updatedDocuments) {

            if (error) {
                console.log('An error ocurred while finding a user by its ID: %s', req.params.id);
            } else {
                console.log('Successfully updated users: %s', updatedDocuments);
            }
        });
    }

    next();
}

function sendDummyResponse(req, res) {
    res.send(200);
}

module.exports = function (app) {
    app.get('/users', findAll);
    app.post('/users/:id/subscriptions', auth.basicAuth, findOrCreateUser, updateQueriesAndFilters, addSubscriptions, sendDummyResponse);
};