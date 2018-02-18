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
    var days = 65;

    var listDate = [];
    var dateMove = new Date();

    for (var i = 0; i < days; i++) {
        listDate.push(dateMove.toISOString().slice(0,10));
        dateMove.setDate(dateMove.getDate()-2);
    }
    var dataSet = [];
    function getData() {
        var date = listDate.splice(0,1)[0];
        $http.get('https://api.fixer.io/' + date + '?base=AUD&symbols=ZAR').then(function(res) {
            dataSet.unshift({date: date, rate: res.data.rates.ZAR});
            if(listDate.length > 0){
                getData();
            } else {
                $http.get('https://api.fixer.io/latest?base=AUD&symbols=ZAR').then(function(res) {
                    $scope.rates = {
                        history: dataSet,
                        latest: res.data.rates.ZAR
                    };
                    $scope.ready = true;
                    console.log($scope.rates)
                })
            }
        });
    }
    getData();
});
