/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 19/05/14, at 23:02.
 */
require('../model/product');
var properties = require('../properties')
    , rollbar = require('rollbar')
    , meli = require('mercadolibre')
    , meliObject = new meli.Meli(properties.ml.appId, properties.ml.secretKey)
    , mongoose = require('mongoose')
    , Product = mongoose.model('Product');


var calculateAveragePrice = function (req, res) {
    console.log('Calculating average price in site: ' + req.params.siteId + ' for query: ' + req.params.query);

    meliObject.get('/sites/' + req.params.siteId + '/search', {q: req.params.query, limit: 200}, function (error, data) {

        if (error || !data.results) {
            var errorMessage = error ? error : 'Response body has no "results" attribute';
            console.log('An error ocurred while calling Mercado Libre API: ' + errorMessage);

            var statusCode = 500;
            if (error && error.code == 'ECONNRESET') {
                statusCode = 504;
            }
            rollbar.reportMessage('Error calling ML API: ' + errorMessage, 'critical', req, properties.monitoring.rollbar.callback);

            res.send(statusCode, {
                message: error.message,
                response: data
            });
        } else {
            var total = 0;
            var minimum;
            var maximum;
            var responseBody = {};

            if (data.results.length > 0) {
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

                responseBody.averagePrice = Math.round(total / data.results.length);
                responseBody.minimumPrice = Math.round(minimum);
                responseBody.maximumPrice = Math.round(maximum);
                responseBody.currencyId = data.results[0].currency_id;
                responseBody.filters = data.filters;
                responseBody.availableFilters = data.available_filters;
            }

            res.send(200, responseBody);
        }

    });

};

module.exports = function (app) {
    app.get('/:siteId/averagePrice/:query', calculateAveragePrice);
};

module.exports.findOrCreate = function (req, res, next) {
    console.log('Finding product w/ query: %s', req.params.query);

    Product.findOne({query: req.params.query}, function (error, product) {
        var updateRequestAndCallNext = function (product) {
            req.product = product;
            next();
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