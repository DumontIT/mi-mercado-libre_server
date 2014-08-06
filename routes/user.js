/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 15/04/14, at 12:10.
 */
require('../model/user');
var _ = require('underscore')
    , mongoose = require('mongoose')
    , User = mongoose.model('User')
    , auth = require('../controllers/authentication')
    , product = require('./product');

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


    var query = _.find(req.user.queries, function (eachQuery) {
        return eachQuery.userQuery === userQuery;
    });
    console.log('Updating user subscriptions for query: %s', query.userQuery);

    query.subscriptions = _.chain(query.subscriptions).union(selectedSubscriptions).compact().value();

    next();
}

function updateFilters(query, filters) {
    console.log('Updating filters for query: %s', query.userQuery);

    if (query.filters) {
        console.log('Merging existent filters with new ones...');

        filters.forEach(function (newFilter) {

            var storedFilter = _.find(query.filters, function (filter) {
                return filter.id === newFilter.id;
            });
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

function updateUserQueriesAndFilters(req, res, next) {
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

function isRequestValid(req, res, next) {
    var errors = []
        , body = req.body;

    if (!body.query) {
        errors.push('Body must contain "query" attribute.');
    }

    if (!body.selectedFilters) {
        errors.push('Body must contain "selectedFilters" attribute.');
    }

    if (!body.selectedSubscriptions) {
        errors.push('Body must contain "selectedSubscriptions" attribute.');
    }

    if (errors.length > 0) {
        res.send(400, {errors: errors});
    } else {
        next();
    }
}

function updateProductQueriesAndFilters(req, res, next) {
    req.params.query = req.body.query;

    var update = function (req, res) {
        product.update(req, res, next);
    };
    product.findOrCreate(req, res, update);
}

function sendDummyResponse(req, res) {
    res.send(200);
}

module.exports = function (app) {
    app.get('/users', findAll);
    app.post('/users/:id/subscriptions', auth.basicAuth, isRequestValid, findOrCreateUser, updateUserQueriesAndFilters, addSubscriptions,
             updateProductQueriesAndFilters, sendDummyResponse);
};

module.exports.sendUpdates = function (userId, product) {
    console.log('Analyzing items for product: %s, to send updates if needed to user (model._id): %s', product.query, userId);

    User.findById(userId, function (error, user) {
        if (!errorsHandler.handle(error, 'Finding a user by model._id')) {
            var userQuery = _.find(user.queries, function (eachQuery) {
                return eachQuery.query === product.query;
            });

            _.each(product.items, function (eachItem) {


                if (!user.knowsItem(userQuery, eachItem)) {
                    console.log('Sending notification to user: %s, about item id: %s', user.id, eachItem.id);
                }
            });
        }
    });
}