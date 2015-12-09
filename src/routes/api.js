/**
 * Created by wikusbrink on 15/07/20.
 */

var express = require('express');
var fs = require('fs');

var router = express.Router();

var imageDir = './../camera_images/';

var entropy = [];

router.get('/images/:id/', function(request, response) {
    'use strict';
    if (request.params.id === 'latest') {
        fs.readdir(imageDir, function(err, list) {
            if (list.length > 0) {
                fs.readFile(imageDir + list[list.length - 1], 'binary', function(err, original_data) {
                    var base64Image = new Buffer(original_data, 'binary').toString('base64');
                    response.send({
                        image: base64Image,
                        entropy: entropy[entropy.length - 1]
                    });
                });
            }
        });
    }
});

router.post('/images/:id/', function(request, response) {
    'use strict';
    entropy.push(request.body.entropy);
    fs.writeFile(imageDir + request.params.id + '.jpg', new Buffer(request.body.file, 'base64'), 'binary', function(){
        response.send({})
    });
});

// Exports
module.exports = router;