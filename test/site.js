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
            expect(response.body).to.be.an('object');
            expect(response.body.sites).to.be.an('array');
            expect(response.body.sites.length).to.be.equal(SITES_LENGTH);

            done();
        });
    });
});