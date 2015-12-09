/**
 * Created by wikusbrink on 15/07/17.
 */

angular.module('controllers', [])
    .controller('main', function ($scope, $http, $rootScope) {
        'use strict';

        $scope.mode = 'preview';

        function shuffle(array) {
            var i = array.length,
                j = 0,
                temp;
            while (i--) {
                j = Math.floor(Math.random() * (i + 1));

                // swap randomly chosen element with current element
                temp = array[i];
                array[i] = array[j];
                array[j] = temp;

            }
            return array;
        }

        var thumbs = [];
        shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]).slice(1, 9).forEach(function(i) {
            thumbs.push('../images/2008-malawi/preview/' + String(i) + '.jpg')
        });

        var malawi = {
            title: 'Malawi - 2008',
            route: '../maps/2008-malawi.csv',
            features: [
                {lat: -15.376560000, long: 35.336040000, name: 'Zomba'},
                {lat: -14.016750000, long: 34.850120000, name: 'Cape Maclear'},
                {lat: -15.767610000, long: 35.014160000, name: 'Blantyre'},
                {lat: -16.026680000, long: 35.507740000, name: 'Mulanje'}
            ],
            previewImages: thumbs
        };
        thumbs = [];
        shuffle([1,2,3,4,5,6,7,8,9,10]).slice(1, 9).forEach(function(i) {
            thumbs.push('../images/2014-patagonia/preview/' + String(i) + '.JPG')
        });
        var patagonia = {
            title: 'Patagonia - 2014',
            route: '../maps/2014-patagonia.csv',
            features: [
                {lat: -50.337969000, long: -72.264798100, name: 'El Calafate'},
                {lat: -49.331494100, long: -72.886325000, name: 'El Chaltén'},
                {lat: -51.730893500, long: -72.497740700, name: 'Puerto Natales'},
                {lat: -54.801912100, long: -68.302951100, name: 'Ushuaia'}
            ],
            previewImages: thumbs
        };
        thumbs = [];
        shuffle([1,2,3,4,5,6,7,8,9,10]).slice(1, 9).forEach(function(i) {
            thumbs.push('../images/2015-namibia/preview/' + String(i) + '.JPG')
        });
        var namibia = {
            title: 'Namibia - 2015',
            route: '../maps/2015-namibia.csv',
            features: [
                {lat: -33.932104500, long: 18.860152000, name: 'Stellenbosch'},
                {lat: -24.486698000, long: 15.801144500, name: 'Sesriem'},
                {lat: -22.646742700, long: 14.600491100, name: 'Swakopmund'},
                {lat: -21.110720400, long: 14.662660400, name: 'Brandberg'},
                {lat: -21.825171000, long: 15.169201000, name: 'Spitzkoppe'},
                {lat: -27.922242400, long: 17.489869900, name: 'Ais-Ais'}
            ],
            previewImages: thumbs,
            scaleFactor: 65
        };

        $scope.tours = [namibia, patagonia, malawi];

        $scope.select = function(i) {
            console.log($scope.tours[i].title);
            $scope.mode = 'tour';
            $scope.selectedTour = $scope.tours[i];
        };
        //$scope.select(0);
        d3.json('../maps/world-50m.json', function(world) {
            $scope.world = world;
            $scope.$digest();

        })
    });