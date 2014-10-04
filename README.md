NodeJS server for "Mi Mercado Libre" Android app.
===
This is the server of [My Mercado Libre](https://play.google.com/store/apps/details?id=com.nbempire.mimercadolibre) Android app.

<a href="https://play.google.com/store/apps/details?id=com.nbempire.mimercadolibre">
  <img alt="Get it on Google Play"
       src="/images/brand/en_generic_rgb_wo_60.png" />
</a>

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