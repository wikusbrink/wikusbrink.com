client.directive('wbMap', function ($window) {
    'use strict';

    function link(scope, element) {
        angular.element($window).on('resize', function () {
            scope.$apply();
        });

        scope.$watch('scope', function () {
            if(scope.world !== undefined && scope.route !== undefined) {
                draw()
            }
        });
        function draw() {
            d3.select(element[0]).selectAll('svg').remove();
            d3.select(element[0]).selectAll('div').remove();
            var scaleFactor  = scope.scaleFactor ? scope.scaleFactor : 30;
            var size = d3.select(element[0]).append('div')
                .style('position', 'absolute')
                .node()
                .getBoundingClientRect();

            var width = size.width;
            var height = size.height;

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

            var graticule = d3.geo.graticule();

            var path = d3.geo.path()
                .projection(projection);

            var svg = d3.select(element[0]).append('svg')
                .attr('width', width)
                .attr('height', height);

            svg.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', height)
                .attr('width', width)
                .style('fill', 'white')
                .style('opacity', 0.4);

            var mapGroup = svg.append('g');

            var countries = topojson.feature(scope.world, scope.world.objects.countries).features;

            mapGroup.selectAll('.country')
                .data(countries)
                .enter().insert('path', '.graticule')
                .attr('class', 'country')
                .attr('d', path);

            if (scope.route.length > 0) {
                mapGroup.append('path')
                    .attr('class', 'route-line')
                    .attr('d', lineFunction(scope.route));
            }

            if (scope.features) {

                mapGroup.selectAll('circle')
                    .data(_.filter(scope.features, function(d) {return d.type === undefined}))
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

                var peaks = mapGroup.selectAll('g')
                    .data(_.filter(scope.features, function(d) {return d.type === 'peak'}))
                    .enter()
                    .append('g')
                    .attr('class', 'feature')
                    .attr('transform', function(d){return 'translate(' + projection([d.long, d.lat])[0] + ',' + projection([d.long, d.lat])[1] + ')'})

                peaks.append("line")
                    .attr("x1", 0)
                    .attr("y1", -3)
                    .attr("x2", 2)
                    .attr("y2", 3)
                    .attr("stroke-width", 1.5)
                    .attr("stroke", "black")
                    .attr('stroke-linecap', 'round');
                peaks.append("line")
                    .attr("x1", 0)
                    .attr("y1", -3)
                    .attr("x2", -2)
                    .attr("y2", 3)
                    .attr("stroke-width", 1.5)
                    .attr("stroke", "black")
                    .attr('stroke-linecap', 'round');


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
    }
    return {
        link: link,
        restrict: 'E',
        scope: {
            features: '=',
            scaleFactor: '=',
            world: '=',
            route: '='
        }
    };
});

client.directive('wbGoogleMap', function ($window) {
    'use strict';

    function link(scope, element) {
        angular.element($window).on('resize', function () {
            scope.$apply();
        });
        if(scope.features !== undefined && scope.route !== undefined) {
            draw()
        }
        scope.$watch('scope', function () {
            if(scope.features !== undefined && scope.route !== undefined) {
                draw()
            }
        });
        function draw() {
            var latMin = _.min(scope.features.concat(scope.route), function(d) {return d.lat}).lat;
            var latMax = _.max(scope.features.concat(scope.route), function(d) {return d.lat}).lat;
            var longMin = _.min(scope.features.concat(scope.route), function(d) {return d.long}).long;
            var longMax = _.max(scope.features.concat(scope.route), function(d) {return d.long}).long;

            var div = d3.select(element[0]).append('div')
                .style('position', 'absolute')
                .attr('class', 'map-box');

            var map = new google.maps.Map(div.node(), {
                zoom: scope.scaleFactor,
                center: new google.maps.LatLng((latMin + latMax) / 2, (longMin + longMax) / 2),
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                // zoomControl: false,
                streetViewControl: false,
                // scaleControl: false,
                rotateControl: false,
                scrollwheel: false
            });
            var overlay = new google.maps.OverlayView();

            // Add the container when the overlay is added to the map.
            overlay.onAdd = function() {
                var layer = d3.select(this.getPanes().overlayLayer).append("div");
                var layer2 = d3.select(this.getPanes().overlayLayer).append("svg")
                    .attr('width', 15000)
                    .attr('height', 15000)
                    .attr('x', -5000)
                    .attr('y', -5000);

                // Draw each marker as a separate SVG element.
                // We could use a single SVG, but what size would it have?
                overlay.draw = function() {
                    var projection = this.getProjection(),
                        padding = 5;

                    var marker = layer.selectAll("svg")
                        .data(scope.features)
                        .each(transform)
                        .enter().append("svg")
                        .each(transform)
                        .style('position', 'absolute')
                        .attr("class", "marker");

                    // Add a circle.
                    marker.append("circle")
                        .attr("r", 4.5)
                        .attr("cx", padding)
                        .attr("cy", padding);

                    marker.append('rect')
                        .attr('x', padding + 6)
                        .attr('y', -padding - 2)
                        .attr('width', function(d){
                            return d.name.length * 5.5;
                        })
                        .attr('height', 18)
                        .attr('fill', 'white')
                        .attr('rx', 3)
                        .attr('ry', 3)
                        .style('opacity', 0.5);

                    // Add a label.
                    marker.append("text")
                        .attr("x", padding + 7)
                        .attr("y", padding)
                        .attr("dy", ".31em")
                        .text(function(d) {
                            return d.name;
                        });

                    var lineFunction = d3.svg.line()
                        .x(function(d) {
                            d = new google.maps.LatLng(d.lat, d.long);
                            d = projection.fromLatLngToDivPixel(d);
                            return d.x;
                        })
                        .y(function(d) {
                            d = new google.maps.LatLng(d.lat, d.long);
                            d = projection.fromLatLngToDivPixel(d);
                            return d.y;
                        })
                        .interpolate("linear");

                    if (scope.route.length > 0) {
                        layer2.selectAll('path').data([1])
                            .enter()
                            .append('path');
                        layer2.selectAll('path')
                            .attr('class', 'route-line')
                            .attr('d', lineFunction(scope.route));
                    }

                    function transform(d) {
                        d = new google.maps.LatLng(d.lat, d.long);
                        d = projection.fromLatLngToDivPixel(d);
                        return d3.select(this)
                            .style("left", (d.x - padding) + "px")
                            .style("top", (d.y - padding) + "px");
                    }
                }
            };
            overlay.setMap(map);
        }
    }
    return {
        link: link,
        restrict: 'E',
        scope: {
            features: '=',
            scaleFactor: '=',
            route: '='
        }
    };
});

client.directive('wbGoogleMap2', function ($window) {
    'use strict';

    function link(scope, element, attr) {
        angular.element($window).on('resize', function () {

        });
        var features;
        var route;
        var scaleFactor;
        var div = d3.select(element[0]).append('div')
            .style('width', '100%')
            .style('height', attr.height + 'px')
            .style('margin-top', '10px')
            .style('margin-bottom', '10px');
        var size = div.node()
            .getBoundingClientRect();
        var width = size.width;
        var height = attr.height;

        function RouteOverlay(map) {
            this.setMap(map);
        }

        var overlay;
        RouteOverlay.prototype = new google.maps.OverlayView();

        function initMap() {
            var latMin = _.min(features.concat(route), function(d) {
                return d.lat
            }).lat;
            var latMax = _.max(features.concat(route), function(d) {
                return d.lat
            }).lat;
            var longMin = _.min(features.concat(route), function(d) {
                return d.long
            }).long;
            var longMax = _.max(features.concat(route), function(d) {
                return d.long
            }).long;

            // var map = new google.maps.Map(div.node(), {
            //     zoom: scaleFactor,
            //     //center: new google.maps.LatLng((latMin + latMax) / 2, (latMin + latMax) / 2,
            //     center: new google.maps.LatLng(-33.9249, 18.4241)
            //     // mapTypeId: google.maps.MapTypeId.TERRAIN,
            //     // zoomControl: false,
            //     // streetViewControl: false,
            //     // scaleControl: false,
            //     // rotateControl: false,
            //     //scrollwheel: false
            // });
            var map = new google.maps.Map(div.node(), {
                zoom: scaleFactor,
                center: {lat: (latMin + latMax) / 2, lng: (longMin + longMax) / 2},
                mapTypeId: google.maps.MapTypeId.TERRAIN
            });
            overlay = new RouteOverlay(map)
        }
        RouteOverlay.prototype.onAdd = function() {
            this.svgLayer = d3.select(this.getPanes().overlayLayer).append('svg')
                .style('width', width)
                .style('height', attr.height);
        };
        RouteOverlay.prototype.draw = function() {
            var overlayProjection = this.getProjection();
            this.svgLayer.selectAll('circle')
                .data(features)
                .enter()
                .append('circle')
                .attr('r', 10)
                .style('fill', 'black');

            // this.svgLayer.selectAll('circle')
            //     .attr('cx', function(d) {
            //         //return overlayProjection.fromLatLngToDivPixel((new google.maps.LatLng(-33.9249, 18.4241))).x;
            //         return overlayProjection.fromLatLngToDivPixel((new google.maps.LatLng(d.lat, d.long))).x;
            //     })
            //     .attr('cy', function(d) {
            //         // return overlayProjection.fromLatLngToDivPixel((new google.maps.LatLng(-33.9249, 18.4241))).y;
            //         return overlayProjection.fromLatLngToDivPixel((new google.maps.LatLng(d.lat, d.long))).y;
            //     })


        };
        RouteOverlay.prototype.onRemove = function() {
            this.svgLayer.selectAll('circle').remove();
        };

        d3.json(attr.source, function(tour) {
            features = tour.features;
            route = tour.route;
            scaleFactor = tour.mapScaleFactor;
            initMap();
        })
    }
    return {
        link: link,
        restrict: 'E',
        scope: {}
    };
});

client.directive('wbElevation', function ($window) {
    'use strict';

    function link(scope, element) {
        angular.element($window).on('resize', function () {
            scope.$apply();
        });
        if(scope.features !== undefined && scope.route !== undefined) {
            draw()
        }
        scope.$watch('scope', function () {
            if(scope.features !== undefined && scope.route !== undefined) {
                draw()
            }
        });
        function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2-lat1);  // deg2rad below
            var dLon = deg2rad(lon2-lon1);
            var a =
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon/2) * Math.sin(dLon/2)
                ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in km
            return d;
        }

        function deg2rad(deg) {
            return deg * (Math.PI/180)
        }
        var div = d3.select(element[0]).append('div')
            .style('position', 'absolute')
            .style('width', '100%')
            .style('height', '100%');

        function draw() {
            d3.select(element[0]).selectAll('svg').remove();

            var data = {
                key: 'hi',
                values: []
            };
            var minElevation = _.min(scope.route, function(d) {return d.elevation}).elevation;
            scope.route.forEach(function(d, i){
                var distance;
                if(i === 0) {
                    distance = 0
                } else {
                    distance = data.values[i-1][0] + getDistanceFromLatLonInKm(d.lat, d.long, scope.route[i-1].lat, scope.route[i-1].long)
                }
                data.values.push([distance, d.elevation - minElevation])
            });

            var size = d3.select(element[0]).append('div')
                .style('position', 'absolute')
                .node()
                .getBoundingClientRect();

            var width = size.width;
            var height = size.height;

            var svg = d3.select(element[0]).append('svg')
                .attr('width', width)
                .attr('height', height);

            nv.addGraph(function() {
                var chart = nv.models.stackedAreaChart()
                    .margin({right: 100})
                    .x(function(d) { return d[0] })
                    .y(function(d) {
                        return d[1]
                    })
                    .useInteractiveGuideline(false)
                    .showControls(false)
                    .clipEdge(true)
                    .showLegend(false);

                chart.xAxis
                    .tickFormat(function(d) {
                        return parseInt(d * 10) /10 + 'km'
                    })
                    .axisLabel('Distance traveled');

                chart.yAxis
                    .tickFormat(function(d) {
                        return (parseInt(d) + parseInt(minElevation)) + 'm'
                    })
                    .axisLabel('Elevation');

                svg.datum([data]).call(chart);

                nv.utils.windowResize(chart.update);

                return chart;
            });
        }
    }
    return {
        link: link,
        restrict: 'E',
        scope: {
            features: '=',
            scaleFactor: '=',
            route: '='
        }
    };
});

client.directive('wbWeather', function ($window) {
    'use strict';

    function link(scope, element, attr) {
        var size = d3.select(element[0]).append('div')
            .style('width', '100%')
            .style('height', '100%')
            .node()
            .getBoundingClientRect();
        var weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var width = size.width;
        var height = size.height;
        d3.select(element[0]).selectAll('div').remove();

        var svg = d3.select(element[0]).append('svg')
            .attr('width', width)
            .attr('height', height);

        var interval = height / 24 / 7;
        var startTime = scope.winds[0].time;
        var windScale = width / 2 / 40;
        var tempScale = width / 4 / 30;
        var swellScale = width / 2 / 10;

        function getY(d) {
            var timeDiff = d.time - startTime;
            var hDiff = timeDiff / 1000 / 60 / 60;
            return hDiff * interval;
        }

        var tempLine = d3.svg.line()
            .x(function(d, i) { return  d.temp * tempScale + width / 4})
            .y(getY);

        var waterTempLine = d3.svg.line()
            .x(function(d, i) { return  d.waterTemp * tempScale + width / 4})
            .y(getY);

        var dayLightGroup = svg.append('g');
        var timeGroup = svg.append('g');
        var tempGroup = svg.append('g');
        tempGroup.append('path')
            .datum(scope.temps)
            .attr("class", "line")
            .attr("d", tempLine)
            .style('stroke-width', 2)
            .style('stroke', 'red')
            .style('fill', 'None');
        tempGroup.selectAll('text')
            .data(scope.temps)
            .enter()
            .append('text')
            .text(function(d){
                var time = new Date(d.time);
                if (time.getHours() == 14 || time.getHours() == 2) {
                    return d.temp + '°C';
                }
            })
            .attr('x', function(d, i) { return  d.temp * tempScale + 3 + width / 4})
            .attr('y', getY)
            .style('font-size', 10)
            .attr('text-anchor', 'start')
            .style('font-weight', 'bolder');
        tempGroup.selectAll('circle')
            .data(scope.temps)
            .enter()
            .append('circle')
            .attr('r', function(d){
                var time = new Date(d.time);
                if (time.getHours() == 14 || time.getHours() == 2) {
                    return 2;
                } else {
                    return 0;
                }

            })
            .attr('cx', function(d, i) { return  d.temp * tempScale + width / 4})
            .attr('cy', getY)
            .style('fill', 'black');

        var windGroup = svg.append('g');
        var swellGroup = svg.append('g');
        var dayGroup = svg.append('g');
        var tideGroup = svg.append('g');

        dayLightGroup.selectAll('rect')
            .data(scope.sunTimes)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('width', width)
            .attr('y', function(d){
                var timeDiff = d.rise - scope.winds[0].time;
                var hDiff = timeDiff / 1000 / 60 / 60;
                return hDiff * interval;
            })
            .attr('height', function(d, i){
                var timeDiff = d.set - d.rise;
                var hDiff = timeDiff / 1000 / 60 / 60;
                return hDiff * interval;
            })
            .style('fill', '#ddd');

        timeGroup.selectAll('rect')
            .data(scope.winds)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', function(d, i){
                return (new Date(d.time)).getHours() == 0 ? interval * i - 1.5 : interval * i - 0.5;
            })
            .attr('height', function(d){
                return (new Date(d.time)).getHours() == 0 ? 3 : 1;
            })
            .attr('width', width)
            .style('fill', '#fff');

        var windsRects = windGroup.selectAll('rect')
            .data(scope.winds);
        windsRects.enter()
            .append('rect')
            .attr('y', function(d, i){ return interval * i + 1})
            .attr('x', width)
            .attr('height', interval * 0.8)
            .attr('width', 0)
            .style('fill', function(d) {
                if (d.wind > 15 ) {
                    return 'darkred';
                } else if (d.wind > 10) {
                    return 'steelblue';
                }
                return 'darkgreen';
            })
            .style('opacity', 0.6);
        windsRects.transition()
            .duration(500)
            .attr('x', function(d) {return width - (d.wind * windScale)})
            .attr('width', function(d) {return width - (d.wind * windScale)});

        var swellRects = swellGroup.selectAll('rect')
            .data(scope.swell);
        swellRects.enter()
            .append('rect')
            .attr('y', function(d, i){ return interval * i + 1})
            .attr('x', 0)
            .attr('height', interval * 0.8)
            .attr('width', 0)
            .style('fill', function(d) {
                if (d.height < 1.5 ) {
                    return 'darkred';
                } else if (d.height < 3) {
                    return 'steelblue';
                }
                return 'darkgreen';
            })
            .style('opacity', 0.6);
        swellRects.transition()
            .duration(500)
            .attr('width', function(d) {return d.height * swellScale});

        swellGroup.selectAll('text')
            .data(scope.swell)
            .enter()
            .append('text')
            .attr('y', function(d, i){ return interval * i + 9})
            .attr('x', 2)
            .text(function(d){return d.height + 'm'})
            .style('font-size', 10)
            .attr('text-anchor', 'start')
            .style('font-weight', 'bolder');

        windGroup.selectAll('text')
            .data(scope.winds)
            .enter()
            .append('text')
            .attr('y', function(d, i){ return interval * i + 9})
            .attr('x', width - 2)
            .text(function(d){return d.wind + 'km/h'})
            .style('font-size', 10)
            .attr('text-anchor', 'end')
            .style('font-weight', 'bolder');

        timeGroup.selectAll('text')
            .data(scope.winds)
            .enter()
            .append('text')
            .attr('x', width / 2)
            .attr('y', function(d, i){ return interval * i + 3})
            .text(function(d, i){
                var h = (new Date(d.time)).getHours();
                if (h === 0 || i === 0) {
                    return ''
                }
                h = h < 10 ? '0' + h : h;
                return h
            })
            .attr('text-anchor', 'middle')
            .style('fill', '#555')
            .style('font-size', 10);

        dayGroup.selectAll('text')
            .data(scope.winds)
            .enter()
            .append('text')
            .attr('x', width * 0.45)
            .attr('y', function(d, i){ return interval * i + 26})
            .text(function(d){
                if ((new Date(d.time)).getHours() === 0) {
                    return weekdays[(new Date(d.time)).getDay()];
                }
            })
            .attr('text-anchor', 'end')
            .style('font-size', 30)
            .style('font-weight', 'bolder')
            .style('fill', '#fff')
            .style('stroke-width', 0.3)
            .style('stroke', '#888');

        var tideGroups = tideGroup.selectAll('g')
            .data(scope.tides)
            .enter()
            .append('g');
        tideGroups.append('rect')
            .attr('x', width/2 + 20)
            .attr('y', function(d, i){
                return getY(d) - 1;
            })
            .attr('height', 2)
            .attr('width', 20)
            .style('fill', 'black');
        tideGroups.append('rect')
            .attr('x', width/2 + 70)
            .attr('y', function(d, i){
                return getY(d) - 1;
            })
            .attr('height', 2)
            .attr('width', 20)
            .style('fill', 'black');
        tideGroups.append('text')
            .attr('x', width/2 + 55)
            .attr('y', function(d, i){
                return getY(d) - 3;
            })
            .attr('text-anchor', 'middle')
            .text(function(d){ return d.type})
            .style('font-size', 10)
            .style('font-weight', 'bolder');
        tideGroups.append('text')
            .attr('x', width/2 + 55)
            .attr('y', function(d, i){
                return getY(d) + 8;
            })
            .attr('text-anchor', 'middle')
            .text(function(d){
                var h =(new Date(d.time)).getHours();
                h = h < 10 ? '0' + h : h;
                var m = (new Date(d.time)).getMinutes();
                m = m < 10 ? '0' + m : m;
                return h + ':' + m
            })
            .style('font-size', 10)
            .style('font-weight', 'bolder');
    }
    return {
        link: link,
        restrict: 'E',
        scope: {
            winds: '=',
            tides: '=',
            temps: '=',
            swell: '=',
            sunTimes: '='
        }
    };
});

client.directive('wbLoader', function ($window) {
    'use strict';

    function link(scope, element, attr) {
        var size = d3.select(element[0]).append('div')
            .style('width', '100%')
            .style('height', '100%')
            .node()
            .getBoundingClientRect();
        var width = size.width;
        var height = size.height;
        d3.select(element[0]).selectAll('div').remove();

        var svg = d3.select(element[0]).append('svg')
            .attr('width', width)
            .attr('height', height);

        svg.append('text')
            .text('wikusbrink.com')
            .attr('x', 20)
            .attr('y', 40)
            .style('font-size', 30)
            .style('font-weight', 'bolder')
            .style('fill', '#fff')
            .style('stroke-width', 0.3)
            .style('stroke', '#888');

        svg.append('text')
            .text('Strand weather')
            .attr('x', 20)
            .attr('y', 75)
            .style('font-size', 26)
            .style('font-weight', 'bolder')
            .style('fill', '#fff')
            .style('stroke-width', 0.3)
            .style('stroke', '#888');

        svg.append('text')
            .text('Loading...')
            .attr('x', 20)
            .attr('y', 110)
            .style('font-size', 26)
            .style('font-weight', 'bolder')
            .style('fill', '#fff')
            .style('stroke-width', 0.3)
            .style('stroke', '#888');

        var rs = [0];
        var circles = [];

        var xs = [];
        var ys = [];
        var xv = [];
        var yv = [];

        repeat();
        var c = 0;
        var colors = ['steelblue', 'darkred', 'darkgreen'];
        function repeat() {
            c = c + 1;
            if (c === 15 && circles.length < 20) {
                c = 0;
                circles.push(svg.append('circle')
                    .attr('r', 0)
                    .style('fill', colors[circles.length % 3])
                    .style('stroke-width', 2)
                    .style('stroke', 'black')
                    .style('opacity', 0.6));
                xs.push(Math.random() * width);
                ys.push(Math.random() * height / 2);
                xv.push((Math.random() - 0.5) * width * 0.05);
                yv.push((Math.random() - 0.5) * width * 0.05);
                rs.push(0);
            }
            circles.forEach(function(circle, i) {
                var x = xs[i];
                var y = ys[i];
                var r = rs[i];
                x = x + xv[i];
                if (x > width - r) {
                    x = width - r;
                    xv[i] = xv[i] * -1;
                }
                if (x < r) {
                    x = r;
                    xv[i] = xv[i] * -1;
                }
                y = y + yv[i];
                if (y > height - r) {
                    y = height - r;
                    yv[i] = yv[i] * -1;
                }
                if (y < r) {
                    y = r;
                    yv[i] = yv[i] * -1;
                }
                r = r < 30 ? r + 0.5 : r;
                xs[i] = x;
                ys[i] = y;
                rs[i] = r;
                circle.transition()
                    .duration(200)
                    .ease("linear")
                    .attr({
                        'cx': x,
                        'cy': y,
                        'r': r
                    });
            });
            setTimeout(function() {
                repeat();
            }, 180);
        }
    }
    return {
        link: link,
        restrict: 'E',
        scope: {}
    };
});

client.directive('wbImage', function ($window) {
    'use strict';

    function link(scope, element, attr) {
        var div = d3.select(element[0]).append('div')
            .style('width', '100%')
            .style('margin-top', '10px')
            .style('margin-bottom', '10px')
            .style('height', attr.height);
        var size = div.node()
            .getBoundingClientRect();
        var width = size.width;
        var height = attr.height;
        var aspect = width / height;

        var svg = div.append('svg')
            .attr('width', width)
            .attr('height', height);

        var imgElement =  svg.append('image')
            .attr('image-rendering','optimizeQuality')
            .attr('x','1')
            .attr('y','1');

        var rect = svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'gray')
            .style('stroke-width', 2)
            .style('stroke', 'black');

        var img = new Image();
        var imgWidth;
        var imgHeight;
        var imgAspect;
        var w;
        var h;
        img.src = attr.image;
        img.onload = function() {
            imgWidth = this.width;
            imgHeight = this.height;
            imgAspect = imgWidth / imgHeight;

            if (aspect < imgAspect) {
                w = imgWidth * height / imgHeight;
                h = height;
            } else {
                w = width;
                h = imgHeight * width / imgWidth;
            }

            imgElement.attr('height', h)
                .attr('width', w)
                .attr('x', (width / 2) - (w / 2))
                .attr('y', (height / 2) - (h / 2))
                .attr('xlink:href', attr.image);
            rect.style('fill', 'none');
        };
        angular.element($window).on('resize', function () {
            size = div.node()
                .getBoundingClientRect();
            width = size.width;
            aspect = width / height;
            rect.attr('width', width)
                .attr('height', height);
            svg.attr('width', width)
                .attr('height', height);

            if (aspect < imgAspect) {
                w = imgWidth * height / imgHeight;
                h = height;
            } else {
                w = width;
                h = imgHeight * width / imgWidth;
            }

            imgElement.attr('height', h)
                .attr('width', w)
                .attr('x', (width / 2) - (w / 2))
                .attr('y', (height / 2) - (h / 2));
        });
    }
    return {
        link: link,
        restrict: 'E',
        scope: {}
    };
});

client.directive('wbCountdown', function ($window, $timeout) {
    'use strict';

    function link(scope, element, attr) {
        var size = d3.select(element[0]).append('div')
            .style('width', '100%')
            .style('height', '100%')
            .node()
            .getBoundingClientRect();
        var width = size.width;
        var height = size.height;
        d3.select(element[0]).selectAll('div').remove();
        
        var svg = d3.select(element[0]).append('svg')
            .attr('width', width)
            .attr('height', height);

        var endDate = new Date(2018, 2, 12);
        var startDate = new Date(2013, 2, 12);
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
            date = new Date();
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
                seconds: pad(seconds),
                time: hours + ':' + pad(minutes) + ':' + pad(seconds)
            };
        }
        scope.time = getTime();

        function getInbetween(x) {
            return 'rgb('+ Math.floor(70*(x)+139*(1-x)) + ',' + Math.floor(130*(x)) + ',' + Math.floor(180*(x))+')';
        }


        function setTime() {
            $timeout(function () {
                scope.time = getTime();
                var first = true;
                svg.selectAll('rect')
                    .style('fill', function(d,i){
                        if (i/data.length < scope.time.percentage/100) {
                            if ((i+1)/data.length > scope.time.percentage/100) {
                                console.log(getInbetween((scope.time.percentage/100 - i/data.length)*data.length))
                                return getInbetween((scope.time.percentage/100 - i/data.length)*data.length);
                            }
                            return 'steelblue';
                        } else {
                            return 'darkred'
                        }
                    });
                svg.selectAll('text')
                    .text(function(d) {return scope.time[d.key] + d.postfix})
                setTime()
            }, 1000)
        }
        setTime();

        var numVertical = 100;
        var data = [];
        for (var i=0; i<numVertical; i=i+1) {
            for (var j=0; j<width/(height/numVertical); j=j+1) {
                data.push({x:j*height/numVertical, y:i*height/numVertical})
            }
        }


        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', function(d) {return d.x})
            .attr('y', function(d) {return d.y})
            .attr('width', height/numVertical)
            .attr('height', height/numVertical)
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .style('stroke-opacity', 0.1)
            .style('fill', function(d,i){
            if (i/data.length < scope.time.percentage/100) {
                if ((i+1)/data.length > scope.time.percentage/100) {
                    return getInbetween((scope.time.percentage/100 - i/data.length)*data.length);
                }
                return 'steelblue';
            } else {
                return 'darkred'
            }
        });

        var texts = [
            {key: 'percentage', postfix: ' %'},
            // {key: 'months', postfix: ' months'},
            {key: 'days', postfix: ' days'},
            {key: 'time', postfix: ''}
        ];

        svg.selectAll('text').data(texts).enter().append('text')
            .text(function(d) {return scope.time[d.key] + d.postfix})
            .attr('text-anchor', 'middle')
            .attr('x', width * 0.5)
            .attr('y', function(d,i) {return i*50 +50})
            .style('font-size', 30)
            .style('font-weight', 'bolder')
            .style('fill', '#fff')
            .style('stroke-width', 0.3)
            .style('stroke', '#888');

    }
    return {
        link: link,
        restrict: 'E',
        scope: {}
    };
});

client.directive('wbTracker', function ($window, $timeout) {
    'use strict';
    function link(scope, element, attr) {
        var size = d3.select(element[0]).append('div')
            .style('width', '100%')
            .style('height', '100%')
            .node()
            .getBoundingClientRect();
        var width = size.width;
        var height = size.height;
        d3.select(element[0]).selectAll('div').remove();

        var svg = d3.select(element[0]).append('svg')
            .attr('width', width)
            .attr('height', height);
        var group = svg.append('g');

        var startDate = new Date(2016, 11, 30);
        var totalMillis = new Date() - startDate + 1000 * 60 * 60 * 24;
        var goal = [];
        for (var i = 0; i < 12; i = i + 1) {
            goal.push({
                date: (new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate())).getTime(),
                weight: 87 - i
            })
        }

        function dateToX(date) {
            return (date - startDate) / totalMillis * width;
        }

        function getX(d) {
            return dateToX(new Date(parseInt(d.date)));
        }

        function getY(d) {
            return height - (d.weight - 73) / 17 * height;
        }

        var line = d3.svg.line()
            .x(getX)
            .y(getY);

        for (var i = 0; i < 24; i = i + 1) {
            svg.append('rect')
                .attr('x', 0)
                .attr('y', getY({weight: 75+i}))
                .attr('width', width)
                .attr('height', 1)
                .style('fill', 'white');
            svg.append('text')
                .text(75+i)
                .attr('x', 4)
                .attr('y', getY({weight: 75+i})-4)
                .style('font-size', 10)
                .style('font-weight', 'bolder')
                .style('fill', '#fff');
        };


        function update() {
            group.remove();

            group = svg.append('g');

            group.append('path')
                .datum(goal)
                .attr('d', line)
                .style('stroke-width', 8)
                .style('stroke', 'black')
                .style('stroke-opacity', 0.3)
                .style('fill', 'None');
            group.append('path')
                .datum(scope.weights)
                .attr('d', line)
                .style('stroke-width', 8)
                .style('stroke', 'darkblue')
                .style('fill', 'None');
        }
        update();
        scope.$watch('weights', function(){
            update();
        })
    }
    return {
        link: link,
        restrict: 'E',
        scope: {
            weights: '='
        }
    };
});
