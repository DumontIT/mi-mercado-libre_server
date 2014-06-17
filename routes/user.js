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

    var updateRequestAndCallNext = function (error, user) {
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
                afterUpdatingUser(error, user, 1, updateRequestAndCallNext)
            });
        } else {
            console.log('User found: %s', user.id);
            updateRequestAndCallNext(undefined, user);
        }
    });
};

function addSubscriptions(req, res, next) {
    var userQuery = req.body.query
        , selectedSubscriptions = req.body.selectedSubscriptions;
    console.log('Adding %s subscription/s for user: %s', selectedSubscriptions.length, req.user.id);

    var product = findQuery(req.user.queries, userQuery);
    console.log('Updating user subscriptions for product: %s', product.userQuery);

    next();
}

function findQuery(queries, userQuery) {
    for (var index = 0; index < queries.length; index++) {
        var eachQuery = queries[index];

        if (eachQuery.userQuery === userQuery) {
            return eachQuery;
        }
    }
}

function updateFilters(query, filters) {
    console.log('Updating filters for query: %s', query.userQuery);

    if (query.filters) {
        console.log('Merging existent filters with new ones...');

        filters.forEach(function (newFilter) {

            var storedFilter;
            for (var i = 0; i < query.filters.length; i++) {
                if (query.filters[i].id === newFilter.id) {
                    storedFilter = query.filters[i];
                    break;
                }
            }

            if (storedFilter) {
                console.log('Existent filter, merging its values...');

                newFilter.values.forEach(function (newValue) {
                    if (storedFilter.values.every(function (eachCurrentValue) {
                        return newValue.id !== eachCurrentValue.id;
                    })) {
                        storedFilter.values.push(newValue);
                    }
                });
            } else {
                console.log('Adding new filter to the query.');
                query.filters.push(newFilter);
            }
        });

    } else {
        console.log('Wow! An error occurred. Query must have .filters attribute if you\'re calling this function. Adding all filters to query.');
        query.filters = filters;
    }
}

/**
 * Basic callback for calling after updating a user. It can be called after creating a new one, or after an update/save process.
 * @param error
 * @param user
 * @param numberAffected
 * @param next If passed, then this callback will be executed with error, user parameters.
 */
function afterUpdatingUser(error, user, numberAffected, next) {
    if (error) {
        console.log('An error occurred while updating the user on storage: %s', error);
    } else {
        console.log('User updated succesfully: %s', user.id);
    }

    if (next) {
        next(error, user);
    }
}

function updateQueriesAndFilters(req, res, next) {
    var userQuery = req.body.query
        , found
        , index = 0;

    for (index; index < req.user.queries.length; index++) {
        var eachQuery = req.user.queries[index];

        if (eachQuery.userQuery === userQuery) {
            found = true;
            console.log('User already has the saved query: %s', userQuery);
            updateFilters(eachQuery, req.body.selectedFilters);
            break;
        }
    }

    if (!found) {
        console.log('Adding a new saved query: %s', userQuery);
        req.user.queries.push({
                                  userQuery: userQuery,
                                  filters: req.body.selectedFilters
                              });

        console.log('Updating user on storage...');
    }

    req.user.markModified('queries');
    req.user.save(afterUpdatingUser);

    //  Called now and not after calling afterUpdatingUser to return to the user as soon as possible.
    next();
}

function sendDummyResponse(req, res) {
    res.send(200);
}

module.exports = function (app) {
    app.get('/users', findAll);
    app.post('/users/:id/subscriptions', auth.basicAuth, findOrCreateUser, updateQueriesAndFilters, addSubscriptions, sendDummyResponse);
};