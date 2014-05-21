/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/05/14, at 21:27.
 */
var meli = require('mercadolibre')
    , properties = require('../properties');
var meliObject = new meli.Meli(properties.ml.appId, properties.ml.secretKey);

exports.findAll = function (req, res) {
    meliObject.get('/sites', {}, function (error, data) {

        //  TODO : Performance : Save this sites and check against ML once a week or something similar.

        if (error) {
            console.log('An error occurred while getting ML sites:' + error);
            res.send(500, error);
        } else {
            console.log('Obtained sites: ' + data.length);
            res.send(200, data);
        }
    });
};