/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/05/14, at 22:43.
 */
var expect = require('expect.js')
    , request = require('request').defaults({ json: true })
    , site = require('../routes/site')
    , properties = require('../properties');

var SITES_LENGTH = 13;

describe('GET /sites', function () {
    it('Should return all sites: ' + SITES_LENGTH, function (done) {
        request.get(properties.uri + '/sites', function (error, response) {

            expect(error).to.not.be.ok();
            expect(response.statusCode).to.be.equal(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.equal(SITES_LENGTH);

            done();
        });
    });
});

describe('site.findAll', function () {
    it('Should return all sites: ' + SITES_LENGTH, function (done) {
        require('mongoose').connect('mongodb://' + properties.db.host + '/' + properties.db.schema);

        site.findAll(undefined, undefined, function (error, sites) {
            expect(error).to.not.be.ok();
            expect(sites).to.be.an('array');
            expect(sites.length).to.be.equal(SITES_LENGTH);

            var aSite = sites[0];
            expect(aSite).to.have.property('id');
            expect(aSite).to.have.property('name');
            expect(aSite).to.have.property('currencies');

            expect(aSite.currencies).to.be.an('array');
            expect(aSite.currencies.length).to.be.equal(0);
//            expect(aSite.currencies[0]).to.have.property('id');
//            expect(aSite.currencies[0]).to.have.property('symbol');

            done();
        });
    });
});