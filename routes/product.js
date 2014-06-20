/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 19/05/14, at 23:02.
 */
require('../model/product');
var properties = require('../properties')
    , rollbar = require('rollbar')
    , moment = require('moment')
    , _ = require('underscore')
    , meli = require('mercadolibre')
    , meliObject = new meli.Meli(properties.ml.appId, properties.ml.secretKey)
    , mongoose = require('mongoose')
    , Product = mongoose.model('Product');


var calculateAveragePrice = function (req, res) {
    console.log('Calculating average price in site: ' + req.params.siteId + ' for query: ' + req.params.query);

    meliObject.get('/sites/' + req.params.siteId + '/search', {q: req.params.query}, function (error, data) {

        if (error || !data.results) {
            console.log('An error ocurred while calling Mercado Libre API: ' + error);

            var statusCode = 500;
            if (error.code = 'ECONNRESET') {
                statusCode = 504;
            }
            rollbar.reportMessage('Error calling ML API: ' + error, 'critical', req, properties.monitoring.rollbar.callback);

            res.send(statusCode, {
                message: error.message,
                response: data
            });
        } else {
            var total = 0;
            var minimum;
            var maximum;

            for (var i = 0; i < data.results.length; i++) {
                var eachArticle = data.results[i];
                total += eachArticle.price;

                if (!minimum || eachArticle.price < minimum) {
                    minimum = eachArticle.price;
                }

                if (!maximum || eachArticle.price > maximum) {
                    maximum = eachArticle.price;
                }
            }

            res.send(200, {
                averagePrice: Math.round(total / data.paging.limit),
                minimumPrice: Math.round(minimum),
                maximumPrice: Math.round(maximum),
                currencyId: data.results[0].currency_id,
                filters: data.filters,
                availableFilters: data.available_filters
            });
        }

    });

};

var afterUpdatingProduct = function (error, product) {
    if (error) {
        console.log('An error ocurred while updating the product: %s', product.query);
        rollbar.reportMessage('Error updating product: ' + product.query + ', error: ' + error, 'error', undefined,
                              properties.monitoring.rollbar.callback);
    } else {
        console.log('Successfully updated product: %s', product.query);
    }
};

module.exports = function (app) {
    app.get('/:siteId/averagePrice/:query', calculateAveragePrice);
};

/**
 * Will set req.product attribute before calling next.
 * @param req Must contains params.query attribute.
 */
module.exports.findOrCreate = function (req, res, next) {
    console.log('Finding product w/ query: %s', req.params.query);

    Product.findOne({query: req.params.query}, function (error, product) {
        var updateRequestAndCallNext = function (product) {
            req.product = product;
            next(req, res);
        };

        if (error) {
            console.log('An error ocurred while finding a product by query: %s', req.params.id);
        } else if (!product) {
            console.log('No product found!');
            Product.create({
                               query: req.params.query
                           }, function (error, product) {

                updateRequestAndCallNext(product);
            });
        } else {
            console.log('Product found: %s', product.query);
            updateRequestAndCallNext(product);
        }
    });
};

module.exports.update = function (req, res, next) {
    console.log('Updating product %s', req.product.query);

    var body = req.body
        , product = req.product
        , user = req.user;

    product.filters = _.merge(product.filters, body.selectedFilters, 'id', ['values']);
    product.markModified('filters');

    if (product.subscribedUsers.indexOf(user._id) < 0) {
        product.subscribedUsers.push(user._id);
    }

    product.save(afterUpdatingProduct);

    next();
};

module.exports.runCronJobToCheckForNewPublishments = function () {
    var cronJob = require('cron').CronJob;

    var job = function () {
        var startTime = moment();
        console.log('Starting cron job at: %s', startTime);

        console.log('This message will be printed every 30 seconds...');

        var endTime = moment()
            , milliseconds = endTime.subtract(startTime).milliseconds()
            , duration = moment.duration(milliseconds).humanize();
        console.log('Finishing cron job at: %s. It has taken: %s milliseconds (%s)', endTime, milliseconds, duration);

        //  TODO : Uncomment cron job duration rollbar report
//        rollbar.reportMessage('Cron job has taken ' + duration, 'info', undefined, properties.monitoring.rollbar.callback)
    };

    //  TODO : Unhard-code cron job execution
    job();
//    new cronJob({
//                    cronTime: '*/30 * * * * *',
//                    onTick: job,
//                    start: true//  Starts the job right now
//                });
};