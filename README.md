NodeJS server for "Mi Mercado Libre" Android app.
===
This is the server of [My Mercado Libre](https://play.google.com/store/apps/details?id=com.nbempire.mimercadolibre) Android app.

The client (Android app) is: https://github.com/barriosnahuel/mi-mercado-libre_android

Before deploy
===
Update the following properties in `properties.js`:

* `environment` ==> value: `production`
* `ml.appId`
* `ml.secretKey`
* `exports.monitoring.rollbar.accessToken`

License
===
Copyright (c) 2014 Nahuel Barrios <barrios.nahuel@gmail.com>
