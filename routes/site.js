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

var findById = function (id, callback) {
    meliObject.get('/sites/' + id, {}, callback);
};

exports.findAll = function (req, res, callback) {
    var getSitesBasicInfo = function (callback) {
        meliObject.get('/sites', {}, callback);
    };

    if (req && res) {

        getSitesBasicInfo(function (error, data) {
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
                    getSitesBasicInfo(function (error, sites) {

                        var updatedSites = [];
                        for (var i = 0; i < sites.length; i++) {
                            var eachSite = sites[i];

                            findById(eachSite.id, function (error, completeSite) {
                                var createdSite = new Site({id: completeSite.id, name: completeSite.name, currencies: completeSite.currencies});
                                createdSite.save();
                                console.log('Saved site: ' + completeSite.id + ', currencies: ' + completeSite.currencies.length);
                            });
                        }

                        callback(error, updatedSites);
                    });
                } else {
                    callback(error, sites);
                }
            }
        });
    }
};