var express = require('express');
var process = require('process');
var underscore = require('underscore');
var router = express.Router();
var request = require('request');
var fs = require('fs');


function utcDate(year, month, day, hour, minute) {
    d = new Date();
    d.setUTCFullYear(year);
    d.setUTCMonth(month);
    d.setUTCDate(day);
    d.setUTCHours(hour);
    d.setUTCMinutes(minute);
    return d;
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

var winds = [];
var tides = [];
var temps = [];
var sunTimes = [];
var swell = [];

function getSwell(retries) {
    var key = process.env.WORLD_WEATHER_KEY;
    request.get('http://api.worldweatheronline.com/premium/v1/marine.ashx?key=' + key + '&q=-34.1089267,18.8107929&format=json&tp=1', function (error, res, body) {
        if (error || !isJsonString(body) || JSON.parse(body).data === undefined || JSON.parse(body).data.weather === undefined) {
            console.log('ERROR: worldweatheronline');
            if (retries < 10) {
                getSwell(retries + 1);
            }
        } else {
            swell = [];
            JSON.parse(body).data.weather.forEach(function(day) {
                var date = day.date;
                day.hourly.forEach(function(hour) {
                    var time = utcDate(date.substring(0, 4), parseInt(date.substring(5, 7)) - 1, date.substring(8, 10), hour.time.substring(0, hour.time.length - 2), 0);
                    swell.push({time: time.getTime(), waterTemp: hour.waterTemp_C, height: hour.swellHeight_m})
                })
            });
            swell = underscore.sortBy(swell, function(d) {
                return d.time
            });
        }
    });
}

function getSunTimes() {
    var dates = [new Date()];
    while(dates.length < 10) {
        var previous = dates[dates.length - 1];
        dates.push(addDays(previous, 1))
    }
    dates.forEach(function(date) {
        var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var dateString = date.getFullYear() + '-' + month + '-' +  day;
        request('http://api.sunrise-sunset.org/json?lat=-34.1089267&lng=18.8107929&date=' + dateString, function (error, response, body) {
            if (error || !isJsonString(body) || JSON.parse(body).results === undefined) {
                console.log('ERROR: sunrise-sunset')
            } else {
                body = JSON.parse(body);
                var result = {};
                var time = body.results.sunrise.split(':');
                date.setUTCHours(parseInt(time[0]));
                date.setMinutes(parseInt(time[1]));
                result.rise = new Date(date).getTime();
                var time = body.results.sunset.split(':');
                date.setUTCHours(parseInt(time[0]) + 12);
                date.setMinutes(parseInt(time[1]));
                result.set = new Date(date).getTime();
                sunTimes.push(result);
            }
        })
    });
}

function getWindsAndTemps() {
    request('http://api.wunderground.com/api/6439d50809d94634/hourly10day/q/pws:IWESTERN678.json', function (error, response, body) {
        if (error || !isJsonString(body) || JSON.parse(body).hourly_forecast === undefined) {
            console.log('ERROR: wunderground - hourly10day')
        } else {
            winds = [];
            temps = [];
            JSON.parse(body).hourly_forecast.forEach(function(forecast) {
                var date = forecast.FCTTIME;
                date = utcDate(date.year, date.mon - 1, date.mday, date.hour - 2, date.min);
                winds.push({time: date.getTime(), wind: forecast.wspd.metric});
                temps.push({time: date.getTime(), temp: forecast.temp.metric});
            });
        }
    });
}

function getTides() {
    request('https://www.worldtides.info/api?extremes&length=604800&lat=-34.1089267&lon=18.8107929&key=d82c29d0-58c0-4141-9055-92fc85d093c3', function (error, response, body) {
        if (error || !isJsonString(body) || JSON.parse(body).extremes === undefined) {
            console.log('ERROR: worldtides')
        } else {
            tides = [];
            JSON.parse(body).extremes.forEach(function(tide) {
                var date = new Date(tide.date);
                tides.push({type: tide.type, time: date.getTime()});
            });
        }
    });
}


function updateHourly() {

}
function update2Hourly() {
    getSwell(0);
    getWindsAndTemps();
}
function update6Hourly() {
    getTides();
    getSunTimes();
}

function checkTime() {
    setTimeout(function() {
        checkTime();
        var now = new Date();
        if (now.getMinutes() === 0) {
            console.log('Hourly update');
            updateHourly()
        }
        if (now.getMinutes() === 0 && now.getHours() % 2 === 0) {
            console.log('2 hourly update');
            update2Hourly()
        }
        if (now.getMinutes() === 0 && now.getHours() % 6 === 0) {
            console.log('6 hourly update');
            update6Hourly()
        }
    }, 1000 * 60);
}
checkTime();
updateHourly();
update2Hourly();
update6Hourly();

router.get('/weather', function(req, response) {
    'use strict';
    var body = {};
    body.winds = winds;
    body.tides = tides;
    body.temps = temps;
    body.swell = swell;
    body.sunTimes = sunTimes;
    response.status(200);
    response.send(body);
});

module.exports = router;
