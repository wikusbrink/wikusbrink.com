var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.headers.host.indexOf('localhost') !== -1 || req.headers.host.indexOf('wikusbrink') !== -1 ) {
        res.render('index', {title: 'Wikus Brink'});
    }
    if(req.headers.host.indexOf('brink4x4') !== -1 ) {
        res.render('brink4x4', {title: 'BRINK 4x4'});
    }
});

router.get('/weather', function(req, res, next) {
    if(req.headers.host.indexOf('wikusbrink') !== -1 ) {
        res.render('weather', {title: 'Weather'});
    }
});

router.get('/countdown', function(req, res, next) {
    if(req.headers.host.indexOf('wikusbrink') !== -1 ) {
        res.render('countdown', {title: 'Countdown'});
    }
});

router.get('/tracker', function(req, res, next) {
    if(req.headers.host.indexOf('wikusbrink') !== -1 ) {
        res.render('tracker', {title: 'Tracker'});
    }
});

router.get('/partials/:name', function(request, response) {
  'use strict';
  var name = request.params.name;
  response.render('partials/' + name);
});

module.exports = router;
