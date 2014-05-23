/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/05/14, at 21:27.
 */
require('../model/site');
var mongoose = require('mongoose')
    , Site = mongoose.model('Site')
    , properties = require('../properties')
    , meli = require('mercadolibre')
    , meliObject = new meli.Meli(properties.ml.appId, properties.ml.secretKey);

exports.findAll = function (req, res, callback) {
    var getSites = function (callback) {
        meliObject.get('/sites', {}, callback);
    };

    if (req && res) {

        getSites(function (error, data) {
            //  TODO : Performance : Save this sites and check against ML once a week or something similar.

            if (error) {
                console.log('An error occurred while getting ML sites:' + error);
                res.send(500, error);
            } else {
                console.log('Obtained sites: ' + data.length);
                res.send(200, data);
            }
        });

    } else {
        Site.find(function (error, sites) {
            if (error) {
                console.log('An error occurred while getting ML sites:' + error);
                callback(error, sites);
            } else {
                if (sites.length === 0) {
                    getSites(function (error, data) {
                        data.forEach(function (each) {
                            new Site({id: each.id, name: each.name}).save();
                        });
                        callback(error, data);
                    });
                } else {
                    callback(error, sites);
                }
            }
        });
    }
};