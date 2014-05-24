/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/05/14, at 21:27.
 */
require('../model/site');
var mongoose = require('mongoose')
    , Site = mongoose.model('Site')
    , async = require('async')
    , properties = require('../properties')
    , meli = require('mercadolibre')
    , meliObject = new meli.Meli(properties.ml.appId, properties.ml.secretKey);

var findById = function (id, callback) {
    meliObject.get('/sites/' + id, {}, callback);
};

exports.findAll = function (req, res, callback) {
    var getSitesBasicInfo = function (callback) {
        console.log('Getting sites from ML REST API...');
        meliObject.get('/sites', {}, callback);
    };

    if (req && res) {
        var afterGettingSitesBasicInfo = function (error, data) {
            if (error) {
                console.log('An error occurred while getting ML sites:' + error);
                res.send(500, error);
            } else {
                console.log('Obtained sites: ' + data.length);
                res.send(200, data);
            }
        };

        Site.find(function (error, sites) {
            if (error) {
                console.log('An error occurred while getting ML sites from DB:' + error);
                getSitesBasicInfo(afterGettingSitesBasicInfo);
            } else if (sites.length > 0) {
                console.log('Returning stored ML sites...');
                res.send(200, sites);
            } else {
                getSitesBasicInfo(afterGettingSitesBasicInfo);
            }
        });
    } else {
        Site.find(function (error, sites) {
            if (error) {
                console.log('An error occurred while getting ML sites:' + error);
                callback(error, sites);
            } else {
                if (sites.length === 0) {
                    console.log('There no sites stored in DB, getting them from ML API...');
                    getSitesBasicInfo(function (error, sites) {

                        var doForEachSite = function (eachSite, callback) {
                            findById(eachSite.id, callback);
                        };
                        var afterHavingAllSites = function (error, sites) {
                            var sitesForResponse = [];

                            for (var i = 0; i < sites.length; i++) {
                                var completeSite = sites[i];
                                var reducedSite = {id: completeSite.id, name: completeSite.name, currencies: completeSite.currencies};

                                new Site(reducedSite).save();
                                console.log('Saved site: ' + reducedSite.id + ', currencies: ' + reducedSite.currencies.length);

                                sitesForResponse.push(reducedSite);
                            }

                            callback(error, sitesForResponse);
                        };

                        var functions = sites.map(function (eachSite) {
                            return doForEachSite.bind(undefined, eachSite);
                        });

                        async.parallel(functions, afterHavingAllSites);
                    });
                } else {
                    console.log('There are stored sites in DB, returning...');
                    callback(error, sites);
                }
            }
        });
    }
};