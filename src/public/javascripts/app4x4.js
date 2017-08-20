/**
 * Created by wikusbrink on 2016/08/21.
 */


var client = angular.module('clientApp' , ['ngResource', 'ngRoute']);


client.run(['$rootScope', '$window', function($rootScope, $window) {
    'use strict';
}]);

client.controller('AppController', function($scope, $location, $window, $http) {
    $scope.message = {
        name: undefined,
        email: undefined,
        message: undefined
    };
    $scope.incomplete = {
        name: undefined,
        email: undefined,
        message: undefined
    };
    $scope.messageStatus = {
        sent: undefined,
        sending: false
    };
    $scope.setMailTo = function() {
        $scope.mailTo = true;
    };
    $scope.cancelMailTo = function() {
        $scope.mailTo = false;
        $scope.messageStatus = {
            sent: undefined,
            sending: false
        };
    };
    $scope.sendMail = function() {
        if ($scope.message.name === undefined || $scope.message.name === '') {
            $scope.incomplete.name = true;
        }
        if ($scope.message.email === undefined || $scope.message.email === '') {
            $scope.incomplete.email = true;
        }
        if ($scope.message.message === undefined || $scope.message.message === '') {
            $scope.incomplete.message = true;
        }
        if (!($scope.incomplete.message || $scope.incomplete.message || $scope.incomplete.message)) {
            $scope.messageStatus.sending = true;
            $http.put('/api/message', $scope.message).then(function(res) {
                $scope.messageStatus.sending = false;
                $scope.messageStatus.sent=true;
                $scope.message = {
                    name: undefined,
                    email: undefined,
                    message: undefined
                };
            }, function() {
                $scope.messageStatus.sending = false;
                $scope.messageStatus.sent=false;
            });

        }
    };
    $scope.removeIncomplete = function(key) {
        $scope.incomplete[key] = false;
    } 

});
