/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 19/05/14, at 23:02.
 */
require('../model/product');
var properties = require('../properties')
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