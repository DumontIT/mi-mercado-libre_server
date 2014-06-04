/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 19/05/14, at 23:02.
 */
var properties = require('../properties')
    , meli = require('mercadolibre')
    , meliObject = new meli.Meli(properties.ml.appId, properties.ml.secretKey);


exports.calculateAveragePrice = function (req, res) {
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