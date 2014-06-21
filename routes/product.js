/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 19/05/14, at 23:02.
 */
require('../model/product');
var properties = require('../properties')
    , errorsHandler = require('../utilities/errorsHandler')
    , rollbar = require('rollbar')
    , moment = require('moment')
    , async = require('async')
    , _ = require('underscore')
    , util = require('util')
    , meli = require('mercadolibre')
    , meliObject = new meli.Meli(properties.ml.appId, properties.ml.secretKey)
    , mongoose = require('mongoose')
    , Product = mongoose.model('Product');

/**
 * TODO : Documentation for findArticles
 * @param siteId
 * @param query
 * @param all
 * @param filters
 * @param map
 * @param callback
 */
function findArticles(siteId, query, all, filters, map, callback) {
    var url = '/sites/' + siteId + '/search'
        , queryStringParameters = {
            q: query,
            limit: 200
        };

    if (filters) {
        _.each(filters, function (eachFilter) {
            queryStringParameters[eachFilter.id] = eachFilter.value;
        });
    }

    if (all) {
        queryStringParameters.offset = 0;
        var articles = [];

        var findAll = function (pages) {
            console.log('Finding all other pages for product: %s', query);

            /**
             * @param offset
             * @param callback This is the callback function that must be called with "error, result". Every result will be passed to the "afterAll" function.
             */
            var doForEachPage = function (offset, callback) {
                queryStringParameters.offset = offset;
                meliObject.get(url, queryStringParameters, function (error, response) {
                    if (!errorsHandler.handleMeliResponse(error, response, util.format('Finding remaining pages for product: %s', query), 'error')) {
                        callback(undefined, response.results.map(map));
                    } else {
                        callback(error || response, undefined);
                    }
                });
            };

            var functions = []
                , afterAll = function (error, results) {
                    for (var i = 0; i < results.length; i++) {
                        articles = _.merge(articles, results, 'id');
                    }

                    console.log('Total articles: %d', articles.length);
                    callback(error, articles);
                };

            for (var pageNumber = 1; pageNumber <= pages; pageNumber++) {
                console.log('Adding function for page: %d', pageNumber);
                functions.push(doForEachPage.bind(undefined, pageNumber));
            }

            async.parallel(functions, afterAll);
        };

        meliObject.get(url, queryStringParameters, function (error, response) {
            if (!errorsHandler.handleMeliResponse(error, response, 'Finding articles', 'critical')) {
                articles = response.results.map(map);

                findAll(Math.ceil(response.paging.total / response.paging.limit));
            }
        });
    } else {
        meliObject.get(url, queryStringParameters, callback);
    }
}

var calculateAveragePrice = function (req, res) {
    console.log('Calculating average price in site: ' + req.params.siteId + ' for query: ' + req.params.query);

    findArticles(req.params.siteId, req.params.query, false, undefined, undefined, function (error, data) {

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
    if (!errorsHandler.handle(error, 'Finding product')) {
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

        var finish = function () {
            var endTime = moment()
                , milliseconds = endTime.subtract(startTime).milliseconds()
                , duration = moment.duration(milliseconds).humanize();
            console.log('Finishing cron job at: %s. It has taken: %s milliseconds (%s)', endTime, milliseconds, duration);

            //  TODO : Uncomment cron job duration rollbar report
//        rollbar.reportMessage('Cron job has taken ' + duration, 'info', undefined, properties.monitoring.rollbar.callback)
        };

        console.log('Searching products...');
        Product.find(function (error, products) {
            if (!errorsHandler.handle(error, 'Finding products')) {
                console.log('Products found: %s', products.length);


                //  finishCronJob is run once, after calling it product.length times
                var finishCronJob = _.after(products.length, finish);
                _.each(products, function (aProduct) {
                    var items = [];

                    var totalRequests = 0;
                    _.each(aProduct.filters, function (eachFilter) {
                        totalRequests += eachFilter.values.length;
                    });
                    var doAfterAllProductRequests = _.after(totalRequests, function (publications) {
                        console.log('Finishing with current product, items: ' + publications.length);

                        finishCronJob();
                    });

                    _.each(aProduct.filters, function (aFilter) {
                        _.each(aFilter.values, function (eachValue) {

                            //  TODO : Unhard-code the site when looking for new articles!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                            findArticles('MLA', aProduct.query, true, [
                                {id: aFilter.id, value: eachValue}
                            ], function (article) {
                                return {
                                    id: article.id,
                                    price: article.price
                                }
                            }, function (error, newItems) {
                                items = _.merge(items, newItems, 'id');
                                doAfterAllProductRequests(items);
                            });
                        });
                    });
                });
            }
        });
    };

    //  TODO : Unhard-code cron job execution
    job();
//    new cronJob({
//                    cronTime: '*/30 * * * * *',
//                    onTick: job,
//                    start: true//  Starts the job right now
//                });
};