/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/05/14, at 22:45.
 */
var properties = require('../properties')
    , expect = require('expect.js')
    , request = require('request').defaults({json: true})
    , product = require('../routes/product');

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
            expect(response.body).to.have.property('filters');
            expect(response.body.filters).to.be.an('array');
            expect(response.body).to.have.property('availableFilters');
            expect(response.body.availableFilters).to.be.an('array');

            done();
        });
    });
});

describe("product.findOrCreate", function () {
    it("Must return a new product when there is no existing product for the specified query", function (done) {

        product.findOrCreate({params: {query: 'this query does not exists'}}, undefined, function (req, res) {
            expect(req).to.be.ok();
            expect(req.product).to.be.ok();
            expect(req.product).to.have.property('_id');
        });

        done();
    });
});