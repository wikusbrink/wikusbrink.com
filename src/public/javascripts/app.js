/**
 * Created by wikusbrink on 2016/08/21.
 */


var client = angular.module('clientApp' , ['ngResource', 'ngRoute']);

client.config(function($routeProvider) {
    'use strict';
    $routeProvider
        .when('/home', {
            templateUrl: '/partials/home.jade',
            reloadOnSearch: false
        })
        .when('/about', {
            templateUrl: '/partials/about.jade',
            reloadOnSearch: false
        })
        .when('/cv', {
            templateUrl: '/partials/cv.jade',
            reloadOnSearch: false
        })
        .when('/kayak', {
            templateUrl: '/partials/kayak.jade',
            reloadOnSearch: false
        })
        .when('/workshop', {
            templateUrl: '/partials/workshop.jade',
            reloadOnSearch: false
        })
        .when('/travel', {
            templateUrl: '/partials/travel.jade',
            reloadOnSearch: false
        })
        .when('/hikes', {
            templateUrl: '/partials/hikes.jade',
            reloadOnSearch: false
        })
        .otherwise({ redirectTo: '/home' });
});

client.run(['$rootScope', '$window', function($rootScope, $window) {
    'use strict';
}]);

client.controller('AppController', function($scope, $location, $window, $http) {
    $scope.background = 'body-image-' + Math.floor(Math.random()*3);
});

client.controller('WeatherController', function($scope, $location, $window, $http) {

    function getData() {
        $http.get('/api/weather/').then(function(res) {
            $scope.winds = res.data.winds;
            $scope.tides = res.data.tides;
            $scope.temps = res.data.temps;
            $scope.swell = res.data.swell;
            $scope.sunTimes = res.data.sunTimes;
            $scope.ready = true;
        }, function() {
            getData();
        });
    }
    getData();
});

client.controller('CountdownController', function($scope, $timeout) {

});




client.controller('AudController', function($scope, $location, $window, $http) {

    var errorDelayCounter = 0;

    function getAudRate(date, callback) {
        $http.get('https://api.fixer.io/' + date + '?base=AUD&symbols=ZAR').then(function(res) {
            errorDelayCounter = 0;
            callback({date: date, rate: res.data.rates.ZAR})
        }, function(error) {
            errorDelayCounter = errorDelayCounter + 1;
            console.log(error);
            setTimeout(function(){
                getAudRate(date, callback);
            }, errorDelayCounter * 20);

        })
    }
    function getAudRates(dates, callback) {
        var rateList = [];

        var complete = _.after(dates.length, function(){
            rateList = _.sortBy(rateList, function(d){return d.date});
            callback(rateList)
        });

        dates.forEach(function(date){
            getAudRate(date, function(rate){
                rateList.push(rate);
                complete();
            })
        })
    }

    var thisDate = new Date();
    var weeksRates = [];
    for (var i = 0; i < 21; i++) {
        weeksRates.unshift(thisDate.toISOString().slice(0,10));
        thisDate.setDate(thisDate.getDate()-1);
    }
    thisDate = new Date();
    var monthDateList = [];
    for (var i = 0; i < 40; i++) {
        monthDateList.unshift(thisDate.toISOString().slice(0,10));
        thisDate.setDate(thisDate.getDate()-5);
    }
    getAudRates(monthDateList, function(monthsRates) {
        getAudRates(weeksRates, function(weeksRates) {
            getAudRate('latest', function(latestRate){
                $scope.rates = {
                    weeks: weeksRates,
                    months: monthsRates,
                    latest: latestRate
                };
                $scope.ready = true;
                console.log($scope.rates)
            })
        })
    });
});
