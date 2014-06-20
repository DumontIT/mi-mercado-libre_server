//=============================================================================
//                      Module dependencies
//=============================================================================
var express = require('express')
    , rollbar = require("rollbar")
    , http = require('http')
    , path = require('path')
    , mongoose = require('mongoose')
    , properties = require('./properties');

//  Set-Up ExpressJS server.
var app = express();

//=============================================================================
//                      Connect to database
//=============================================================================
console.log('Connecting to database...');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://' + properties.db.host + '/' + properties.db.schema;
mongoose.connect(mongoUri);

//=============================================================================
//                      Configure server
//=============================================================================
console.log('Configuring server common things...');
app.set('port', process.env.PORT || properties.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Use the Rollbar error handler to send exceptions to your rollbar account. Make sure this is below the app.router.
app.use(rollbar.errorHandler(properties.monitoring.rollbar.accessToken, properties.monitoring.rollbar.configuration));

require('./routes')(app);

//  Expose resources.
app.get('/', function (req, res) {
    res.send('Welcome to Super Mercado Libre server.');
});

app.configure('production', function () {
    console.log('Configuring production environment for Express server...');
});
app.configure('development', function () {
    console.log('Configuring development environment for Express server...');

    app.use(express.errorHandler());

    /*****************************************************************************/
    /*  Populate database                                                        */
    /*****************************************************************************/
    var User = mongoose.model('User');

    User.find(function (err, users) {
        var populate = function () {
            var createUser = function (id) {
                return new User({ id: id});
            };
            var users = [
                createUser('1353523sgs'), createUser('12u4hi1i1')
            ];

            users.forEach(function (item, index) {
                item.save(function (err, storedItem) {
                    if (err) {
                        console.log('An error ocurred while storing user: ' + users[index].id + ', error: ' + err);
                    } else {
                        console.log('Stored item: ' + users[index].id);
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
});

//=============================================================================
//                      Finally creates the server
//=============================================================================
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});