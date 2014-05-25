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
    var sendResponse = function (req, res, callback, sites) {
        if (req && res) {
            console.log('Obtained sites: ' + sites.length);
            res.send(200, sites);
        } else {
            callback(error, sites);
        }
    };

    var getSitesBasicInfo = function (callback) {
        console.log('Getting sites from ML REST API...');
        meliObject.get('/sites', {}, callback);
    };

    var afterGettingSitesBasicInfo = function (error, sites) {
        if (error) {
            console.log('An error occurred while getting ML sites:' + error);
            res.send(500, error);
        } else {

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

                sendResponse(req, res, callback, sitesForResponse);
            };

            var functions = sites.map(function (eachSite) {
                return doForEachSite.bind(undefined, eachSite);
            });

            async.parallel(functions, afterHavingAllSites);
        }
    };

    Site.find(function (error, sites) {
        if (error) {
            console.log('An error occurred while getting ML sites from DB:' + error);
            getSitesBasicInfo(afterGettingSitesBasicInfo);
        } else if (sites.length > 0) {
            console.log('Returning stored ML sites...');
            sendResponse(req, res, callback, sites);
        } else {
            console.log('There are NOT any site stored in DB');
            getSitesBasicInfo(afterGettingSitesBasicInfo);
        }
    });
};