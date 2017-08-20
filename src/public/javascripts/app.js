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
        .when('/books', {
            templateUrl: '/partials/books.jade',
            reloadOnSearch: false
        })
        .otherwise({ redirectTo: '/home' });
});

client.run(['$rootScope', '$window', function($rootScope, $window) {
    'use strict';
}]);

client.controller('AppController', function($scope, $location, $window, $http) {
    
    $scope.background = 'body-image-' + Math.floor(Math.random()*3);

    $scope.locationSearch = ($location.search());
    $scope.searchApplied = _.keys(($location.search())).length > 0;

    $scope.$on('$locationChangeStart', function() {
        $scope.locationSearch = ($location.search());
        $scope.searchApplied = _.keys(($location.search())).length > 0;
    });
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

client.controller('TrackerController', function($scope, $location, $window, $http) {
    $scope.input = {
        weight: undefined
    };
    $scope.submitInput = function() {
        $http.put('/api/weight', {weight: $scope.input.weight}).then(function(res) {
            $http.get('/api/weight').then(function(res) {
                $scope.weights = res.data;
            });
        });
        $scope.input.weight = undefined
    };
    $http.get('/api/weight').then(function(res) {
        $scope.weights = res.data;
    });
});

client.controller('CountdownController', function($scope, $timeout) {
    var endDate = new Date(2018, 2, 12);
    var startDate = new Date(2017, 2, 12);
    var totalDiff = endDate - startDate;

    function pad(value) {
        return value < 10 ? '0' + value : value;
    }
    
    function getTime() {
        
        var date = new Date();
        // var months = -1;
        // while (date < endDate) {
        //     date.setMonth(date.getMonth()+1);
        //     months = months + 1
        // }
        // date.setMonth(date.getMonth() - 1);

        var diff = endDate - date;
        var days = Math.floor(diff / 1000 / 60 / 60 / 24);
        diff = diff - days * 1000 * 60 * 60 * 24;
        var hours = Math.floor(diff / 1000 / 60 / 60);
        diff = diff - hours * 1000 * 60 * 60;
        var minutes = Math.floor(diff / 1000 / 60);
        diff = diff - minutes * 1000 * 60;
        var seconds = Math.floor(diff / 1000);

        var done = (new Date()) - startDate;
        var percentage = Math.round(done / totalDiff * 1000000000) / 10000000;


        return {
            percentage: percentage,
            // months: months,
            days: days,
            hours: hours,
            minutes: pad(minutes),
            seconds: pad(seconds)
        };
    }
    $scope.time = getTime();

    function setTime() {
        $timeout(function () {
            $scope.time = getTime();
            setTime()
        }, 1000)
    }
    setTime();
});


