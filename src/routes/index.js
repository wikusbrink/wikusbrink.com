var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', {title: 'Wikus Brink'});
});

router.get('/weather', function(req, res, next) {
    res.render('weather', {title: 'Weather'});
});

router.get('/aud', function(req, res, next) {
    res.render('aud', {title: 'ZAR to AUD'});
});

router.get('/countdown', function(req, res, next) {
    res.render('countdown', {title: 'Countdown'});
});

router.get('/partials/:name', function(request, response) {
  'use strict';
  var name = request.params.name;
  response.render('partials/' + name);
});

module.exports = router;
