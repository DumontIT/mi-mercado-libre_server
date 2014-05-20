/**
 * Main configuration.
 * @type {{localPort: number}}
 */
var configuration = {
    localPort: 5000
};

/**
 * Module dependencies.
 */
var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');

//  Load Mongoose and each schema definition
var mongoose = require('mongoose');
require('./model/user');

//  Load own modules
var user = require('./routes/user');
var product = require('./routes/product');

//  Set-Up ExpressJS server.
var app = express();

//=============================================================================
//                      Configure server
//=============================================================================
app.set('port', process.env.PORT || configuration.localPort);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//  Development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//=============================================================================
//                      Prepare public resources to expone
//=============================================================================

//  Expose resources.
app.get('/', function (req, res) {
    res.send('Welcome to Super Mercado Libre server.');
});

app.get('/users', user.findAll);

//======    Resources for Precio Promedio module
app.get('/pp/averagePrice/:query', product.calculateAveragePrice);

//=============================================================================
//                      Connect to database
//=============================================================================
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';
mongoose.connect(mongoUri);

//=============================================================================
//                      Finally creates the server
//=============================================================================
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

/*****************************************************************************/
/*****************************************************************************/
/*  Populate database                                                        */
/*****************************************************************************/
var User = mongoose.model('User');

User.find(function (err, users) {
    var populate = function () {
        var createUser = function (name, lastName, email) {
            return new User({ name: name, lastName: lastName, email: email });
        };
        var users = [
            createUser('Nahuel', 'Barrios', 'barrios.nahuel@gmail.com'), createUser('Nombre', 'Apellido', 'email@gmail.com')
        ];

        users.forEach(function (item, index) {
            item.save(function (err, storedItem) {
                if (err) {
                    console.log('An error ocurred while storing user: ' + users[index].email + ', error: ' + err);
                } else {
                    console.log('Stored item: ' + users[index].email);
                }
            })
        });
    };

    if (err) {
        console.log('An error occurred while finding users, populating DB...');
    } else {
        if (users.length > 0) {
            for (var i = 0; i < users.length; i++) {
                users[i].remove();
            }
        }
    }
    populate();
});