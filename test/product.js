/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/05/14, at 22:45.
 */
var expect = require('expect.js')
    , request = require('request').defaults({json: true})
    , properties = require('../properties');

describe("GET /:siteId/averagePrice/:query", function () {
    it("Must return an object with product information when searching valid values", function (done) {

        request.get(properties.uri + '/MLB/averagePrice/gol power', function (error, response) {
            expect(error).to.not.be.ok();
            expect(response.statusCode).to.be.equal(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('averagePrice');
            expect(response.body).to.have.property('minimumPrice');
            expect(response.body).to.have.property('maximumPrice');
            expect(response.body).to.have.property('currencyId');

            done();
        });
    });
});