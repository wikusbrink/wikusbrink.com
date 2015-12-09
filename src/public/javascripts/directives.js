/**
 * Created by wikusbrink on 15/07/17.
 */

angular.module('directives', [])
    .directive('wbMap', function () {
    'use strict';

    function link(scope, element) {
        var width = scope.width;
        var height = scope.height;
        var scaleFactor  = scope.scaleFactor ? scope.scaleFactor : 30;

        var projection = d3.geo.mercator()
            .center([24, -29])
            .scale(5000)
            .translate([width / 2, height / 2]);

        if (scope.features) {
            var latMin = _.min(scope.features, function(d) {return d.lat}).lat;
            var latMax = _.max(scope.features, function(d) {return d.lat}).lat;
            var longMin = _.min(scope.features, function(d) {return d.long}).long;
            var longMax = _.max(scope.features, function(d) {return d.long}).long;
            projection.center([(longMin + longMax) / 2, (latMin + latMax) / 2]);

            if (scaleFactor / (longMax - longMin) * height < scaleFactor / (latMax - latMin) * width) {
                projection.scale(scaleFactor / (longMax - longMin) * height)
            } else {
                projection.scale(scaleFactor / (latMax - latMin) * width)
            }
        }


        var lineFunction = d3.svg.line()
            .x(function(d) { return projection([d.long, d.lat])[0]; })
            .y(function(d) { return projection([d.long, d.lat])[1]; })
            .interpolate("linear");

        var color = d3.scale.category20();
        var graticule = d3.geo.graticule();

        var path = d3.geo.path()
            .projection(projection);

        var svg = d3.select(element[0]).append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', height)
            .attr('width', width)
            .style('fill', 'white')
            .style('opacity', 0.4);

        var mapGroup = svg.append('g');

//        svg.append('rect')
//            .attr('x', 1)
//            .attr('y', 1)
//            .attr('height', height - 2)
//            .attr('width', width - 2)
//            .style('fill', 'none')
//            .style('stroke', 'black')
//            .style('stroke-width', 2)
//            .style('stroke-dasharray', '6 6');

        scope.$watch('world', function() {
            if (scope.world) {
                var countries = topojson.feature(scope.world, scope.world.objects.countries).features;

                mapGroup.selectAll('.country')
                    .data(countries)
                    .enter().insert('path', '.graticule')
                    .attr('class', 'country')
                    .attr('d', path);

                if (scope.route) {
                    path = mapGroup.append('path');
                    d3.csv(scope.route, function(route) {
                        path.attr('class', 'route-line')
                            .attr("d", lineFunction(route))
                    })
                }

                if (scope.features) {
                    mapGroup.selectAll('circle')
                        .data(scope.features)
                        .enter()
                        .append('circle')
                        .attr('class', 'feature')
                        .attr('cx', function(d) {
                            return projection([d.long, d.lat])[0];
                        })
                        .attr('cy', function(d) {
                            return projection([d.long, d.lat])[1];
                        })
                        .attr('r', 2);

                    mapGroup.selectAll('text')
                        .data(scope.features)
                        .enter()
                        .append('text')
                        .attr('class', 'feature-name')
                        .text(function(d) {
                            return d.name;
                        })
                        .attr('x', function(d) {
                            var x = projection([d.long, d.lat])[0];
                            if (x < width / 2) {
                                return x + 4;
                            } else {
                                return x - 4;
                            }
                        })
                        .attr('y', function(d) {
                            return projection([d.long, d.lat])[1];
                        })
                        .attr('text-anchor', function(d) {
                            var x = projection([d.long, d.lat])[0];
                            if (x < width / 2) {
                                return 'start'
                            } else {
                                return 'end'
                            }
                        })
                        .attr('dy', '0.2em');
                }
            }
        })
    }
    return {
        link: link,
        restrict: 'E',
        scope: {
            world: '=',
            features: '=',
            route: '=',
            width: '=',
            height: '=',
            scaleFactor: '='
        }
    };
});