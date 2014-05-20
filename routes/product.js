/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 19/05/14, at 23:02.
 */
var meli = require('mercadolibre');
var meliObject = new meli.Meli(5646442879385929, 'wvJMSiGIhAXLyFTochnHuZ2vssZ4D0wh');


exports.calculateAveragePrice = function (req, res) {
    console.log('Calculating average price for query: ' + req.params.query);

    meliObject.get('/sites/MLA/search', {q: req.params.query}, function (error, data) {

        if (!error) {
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
                minimumPrice: minimum,
                maximumPrice: maximum
            });
        }

    });

};