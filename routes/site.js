/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/05/14, at 21:27.
 */
var meli = require('mercadolibre');
var meliObject = new meli.Meli(5646442879385929, 'wvJMSiGIhAXLyFTochnHuZ2vssZ4D0wh');

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