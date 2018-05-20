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

client.controller('TrackerController', function($scope, $location, $window, $http) {
    function getData() {
        $http.get('api/visa/').then(function(res) {
            $scope.data = res.data;
            console.log(res.data);
            $http.get('https://free.currencyconverterapi.com/api/v5/convert?q=AUD_ZAR&compact=y').then(function(res) {
                $scope.data.exchanceRate = res.data['AUD_ZAR'].val.toFixed(2);
                $scope.ready = true;
            })
        }, function() {
            getData();
        });
    }
    getData();
});


client.controller('AudController', function($scope, $location, $window, $http) {

    var errorDelayCounter = 0;
    $scope.currencies = {
        from: 'ZAR',
        to: 'AUD'
    };
    $scope.currencyList = ['AUD', 'CNY', 'EUR', 'GBP', 'USD', 'ZAR'];

    function getAudRate(date, callback) {
        $http.get('https://api.fixer.io/' + date + '?base=' + $scope.currencies.to + '&symbols=' + $scope.currencies.from).then(function(res) {
            errorDelayCounter = 0;
            callback({date: date, rate: res.data.rates[$scope.currencies.from]})
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
    function getLatest(callback) {
        $http.get('https://free.currencyconverterapi.com/api/v5/convert?q=' + $scope.currencies.to + '_' + $scope.currencies.from + '&compact=y').then(function(res) {
            console.log('https://free.currencyconverterapi.com/api/v5/convert?q=' + $scope.currencies.to + '_' + $scope.currencies.from + '&compact=y')
            var today = new Date();
            callback({date: today.toISOString().slice(0,10), rate: res.data[$scope.currencies.to + '_' + $scope.currencies.from].val.toFixed(2)})
        })
    }

    $scope.update = function() {
        $scope.ready = false;
        var thisDate = new Date();
        var weeksRates = [];
        for (var i = 0; i < 21; i++) {
            weeksRates.unshift(thisDate.toISOString().slice(0, 10));
            thisDate.setDate(thisDate.getDate() - 1);
        }
        thisDate = new Date();
        var monthDateList = [];
        for (var i = 0; i < 40; i++) {
            monthDateList.unshift(thisDate.toISOString().slice(0, 10));
            thisDate.setDate(thisDate.getDate() - 5);
        }
        getAudRates(monthDateList, function (monthsRates) {
            getAudRates(weeksRates, function (weeksRates) {
                getLatest(function (latestRate) {
                    $scope.rates = {
                        from: $scope.currencies.from,
                        to: $scope.currencies.to,
                        weeks: weeksRates,
                        months: monthsRates,
                        latest: latestRate
                    };
                    $scope.ready = true;
                    console.log($scope.rates)
                })
            })
        });
    };
    $scope.update()
});
