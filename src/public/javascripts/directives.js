
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
                if (time.getHours() == 14 || time.getHours() == 6) {
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
                if (time.getHours() == 14 || time.getHours() == 6) {
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

        // svg.append('text')
        //     .text('Strand weather')
        //     .attr('x', 20)
        //     .attr('y', 75)
        //     .style('font-size', 26)
        //     .style('font-weight', 'bolder')
        //     .style('fill', '#fff')
        //     .style('stroke-width', 0.3)
        //     .style('stroke', '#888');

        svg.append('text')
            .text('Loading...')
            .attr('x', 20)
            .attr('y', 75)
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
        var totalDiff = endDate - startDate;

        function pad(value) {
            return value < 10 ? '0' + value : value;
        }

        function getTime() {

            var date = new Date();
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

client.directive('wbAud', function ($window, $timeout) {
    'use strict';

    function link(scope, element, attr) {
        var size = d3.select(element[0]).append('div')
            .style('width', '100%')
            .style('height', '100%')
            .node()
            .getBoundingClientRect();
        var width = size.width;
        var height = size.height-50;
        d3.select(element[0]).selectAll('div').remove();

        var svg = d3.select(element[0]).append('svg')
            .attr('width', width)
            .attr('height', height);

        svg.append('text')
            .text(scope.rates.from + ' ' + scope.rates.latest.rate)
            .attr('text-anchor', 'middle')
            .attr('x', width * 0.5)
            .attr('y', 65)
            .style('font-size', 70)
            .style('font-weight', 'bolder')
            .style('fill', '#fff')
            .style('stroke-width', 1)
            .style('stroke', 'black');

        svg.append('text')
            .text('= ' + scope.rates.to + ' 1')
            .attr('text-anchor', 'middle')
            .attr('x', width * 0.5)
            .attr('y', 120)
            .style('font-size', 40)
            .style('font-weight', 'bolder')
            .style('fill', '#fff')
            .style('stroke-width', 1)
            .style('stroke', 'black');

        function draw(data, height, height_offset, xGrid, name) {
            svg.append('text')
                .attr('text-anchor', 'end')
                .text(name)
                .attr('x', width-4)
                .attr('y', height_offset - 3)
                .style('font-size', 16)
                .style('font-weight', 'bolder')
                .style('fill', 'black');

            var max = Math.ceil(_.max(data, function (d) {
                return d.rate
            }).rate * 2) / 2;
            var min = Math.floor(_.min(data, function (d) {
                return d.rate
            }).rate * 2) / 2;

            function getY(d) {
                return height + height_offset  - (height) / (max - min) * (d.rate - min);
            }

            function getX(d, i) {
                return width / (data.length - 1) * i;
            }

            function getXGrid(d, i) {
                return width * i;
            }

            function getYGrid(d, i) {
                return height * i + height_offset;
            }

            var line = d3.svg.line()
                .x(getX)
                .y(getY);

            var lineYGrid = d3.svg.line()
                .x(getXGrid)
                .y(getY);

            var lineXGrid = d3.svg.line()
                .x(function (d) {
                    return getX(0, d)
                })
                .y(getYGrid);

            var gridGroup = svg.append('g');
            var rateHistoryGroup = svg.append('g');
            rateHistoryGroup.append('path')
                .datum(data)
                .attr("class", "line")
                .attr("d", line)
                .style('stroke-width', 6)
                .style('stroke', 'darkred')
                .style('stroke-linecap', 'round')
                .style('fill', 'None');

            var yLines = [];
            var c = min;
            while (c <= max) {
                yLines.push({rate: c});
                gridGroup.append('path')
                    .datum([{rate: c}, {rate: c}])
                    .attr("class", "line")
                    .attr("d", lineYGrid)
                    .style('stroke-width', 1)
                    .style('stroke', '#555')
                    .style('fill', 'None');
                gridGroup.append('text')
                    .text('R' + c)
                    .attr('x', 4)
                    .attr('y', getY({rate: c}) - 6)
                    .style('font-size', 12)
                    .style('fill', 'black');
                c = c + 0.5;
            }
            c = 1;
            while (c < data.length && xGrid == 'monthly') {
                var dataPoint = data[c];
                var previousDay = data[c - 1].date.substring(8, 10);
                if (dataPoint.date.substring(8, 10) < previousDay) {
                    gridGroup.append('path')
                        .datum([c, c])
                        .attr("class", "line")
                        .attr("d", lineXGrid)
                        .style('stroke-width', 1)
                        .style('stroke', '#555')
                        .style('fill', 'None');
                    gridGroup.append('text')
                        .text(dataPoint.date.substring(0, 7))
                        .attr('x', getX(0, c) + 2)
                        .attr('y', height - 6 + height_offset)
                        .style('font-size', 12)
                        .style('fill', 'black');
                }
                c++;
            }
            while (c < data.length && xGrid == 'weekly') {
                var date = new Date(data[c].date);
                var day = date.getDay();
                if (day === 1) {
                    gridGroup.append('path')
                        .datum([c, c])
                        .attr("class", "line")
                        .attr("d", lineXGrid)
                        .style('stroke-width', 1)
                        .style('stroke', '#555')
                        .style('fill', 'None');
                    gridGroup.append('text')
                        .text(data[c].date.substring(5, 10))
                        .attr('x', getX(0, c) + 2)
                        .attr('y', height - 6 + height_offset)
                        .style('font-size', 12)
                        .style('fill', 'black');
                }
                c++;
            }
        }
        draw(scope.rates.weeks, height / 3.2, 150, 'weekly', 'Weeks');
        draw(scope.rates.months, height / 3.2, height / 3 + 180, 'monthly', 'Months');
    }
    return {
        link: link,
        restrict: 'E',
        scope: {rates: '='}
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
        var height = size.height-50;
        d3.select(element[0]).selectAll('div').remove();

        var svg = d3.select(element[0]).append('svg')
            .attr('width', width)
            .attr('height', height);


        svg.append('text')
            .text('Today')
            .attr('text-anchor', 'middle')
            .attr('x', width * 0.15)
            .attr('y', 20)
            .style('font-size', 15)
            .style('font-weight', 'bolder')
            .style('fill', 'black');

        svg.append('text')
            .text('Expected grant date')
            .attr('text-anchor', 'middle')
            .attr('x', width * 0.65)
            .attr('y', 20)
            .style('font-size', 15)
            .style('font-weight', 'bolder')
            .style('fill', 'black');

        svg.append('text')
            .text(scope.data.expected_date)
            .attr('text-anchor', 'middle')
            .attr('x', width * 0.65)
            .attr('y', 55)
            .style('font-size', 35)
            .style('font-weight', 'bolder')
            .style('fill', 'black');

        var y1 = 70;
        var y2 = 220;
        function getY(d) {
            return y2 - (y2 - y1)*d/100;
        }

        function getX(d, i) {
            return width * (i / scope.data.distribution.cdf.values.length)
        }

        [0, 0.25, 0.5, 0.75, 1].forEach(function(d,i) {
            svg.append('rect')
                .attr('x', 0)
                .attr('y', y2 - (y2 - y1) * d)
                .attr('width', width)
                .attr('height', 1)
                .attr('fill', '#888');
        });
        [0.25, 0.5, 0.75, 1].forEach(function(d,i) {
            svg.append('text')
                .text(d*100 + '%')
                .attr('text-anchor', 'start')
                .attr('x', 2)
                .attr('y', y2 - (y2 - y1) * d + 12)
                .style('font-size', 10)
                .style('font-weight', 'bolder')
                .style('fill', '#222');
        });

        var month = 0;
        scope.data.distribution.cdf.dates.forEach(function(d, i){
            if(d.substring(8, 10) === '01') {
                month += 1;
                svg.append('rect')
                    .attr('x', getX(d, i))
                    .attr('y', y1)
                    .attr('width', 1)
                    .attr('height', y2 - y1)
                    .attr('fill', '#888');
                svg.append('text')
                    .text(d.substring(5, 7))
                    .attr('text-anchor', 'start')
                    .attr('x', getX(d, i) + 3)
                    .attr('y', y2 - 3)
                    .style('font-size', 10)
                    .style('font-weight', 'bolder')
                    .style('fill', '#222');
            }
        });

        var lineCdf = d3.svg.line()
            .x(getX)
            .y(getY);

        svg.append('path')
            .datum(scope.data.distribution.cdf.values)
            .attr("class", "line")
            .attr("d", lineCdf)
            .style('stroke-width', 6)
            .style('stroke', 'steelblue')
            .style('stroke-linecap', 'round')
            .style('fill', 'None')
            .style('stroke-opacity', 0.9);

        scope.data.distribution.cdf.dates.forEach(function(d, i){
            if(d === scope.data.today){
                svg.append('rect')
                    .attr('x', getX(d, i) - 2)
                    .attr('y', y1)
                    .attr('width', 4)
                    .attr('height', y2 - y1)
                    .attr('fill', 'darkgreen');
                svg.append('text')
                    .text(Math.round(scope.data.distribution.cdf.values[i]) + '%')
                    .attr('text-anchor', 'middle')
                    .attr('x', width * 0.15)
                    .attr('y', 55)
                    .style('font-size', 35)
                    .style('font-weight', 'bolder')
                    .style('fill', 'black');
            }
        });

        var grants_latest_date = 0;
        scope.data.cases.forEach(function(d, i){
            if(d.grant_date === scope.data.cases[scope.data.cases.length - 1].grant_date){
                grants_latest_date += 1
            }
        });

        svg.append('text')
            .text('Latest grant date (' + grants_latest_date + '):')
            .attr('text-anchor', 'start')
            .attr('x', 10)
            .attr('y', 242)
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', 'black');
        svg.append('text')
            .text(scope.data.last_grant_date)
            .attr('text-anchor', 'end')
            .attr('x', width*0.47)
            .attr('y', 242)
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', 'black');

        svg.append('text')
            .text('Current LD granted:')
            .attr('text-anchor', 'start')
            .attr('x', 10)
            .attr('y', 260)
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', 'black');
        svg.append('text')
            .text(scope.data.last_lodge_date_granted)
            .attr('text-anchor', 'end')
            .attr('x', width*0.47)
            .attr('y', 260)
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', 'black');

        svg.append('text')
            .text('ADG: ' + Math.round(scope.data.cases[scope.data.cases.length-1].rolling_mean_100))
            .attr('text-anchor', 'end')
            .attr('x', width-10)
            .attr('y', 260)
            .style('font-size', 35)
            .style('font-weight', 'bolder')
            .style('fill', 'black');

        svg.append('text')
            .text('1 AUD = ' + scope.data.exchanceRate + ' ZAR')
            .attr('text-anchor', 'end')
            .attr('x', width-10)
            .attr('y', 278)
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', 'black');

        var today = new Date();
        var endOfYear = new Date(today.getFullYear(), 11, 32);
        var lodgeDate = new Date(today.getFullYear(), 3, 5);
        var oneDay=1000*60*60*24;
        var daysLeft = Math.ceil((endOfYear.getTime()-today.getTime())/(oneDay));
        var daysSinceLodge = Math.ceil((today.getTime()-lodgeDate.getTime())/(oneDay));

        svg.append('text')
            .text(daysSinceLodge + ' days since lodge, ' + daysLeft + ' days left in year')
            .attr('text-anchor', 'start')
            .attr('x', 10)
            .attr('y', 278)
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', 'black');


        y1 = 300;
        y2 = 520;
        function getYDiff(d) {
            return y2 - (y2 - y1) * d.days_to_grant / 300;
        }
        function getYCasesLines(d) {
            return y2 - (y2 - y1) * d.rolling_mean_100 / 300;
        }

        function getXCases(d) {
            return width * (200 - d.negative_index) / 200;
        }

        for(var i=0; i<=300; i+=50) {
            svg.append('rect')
                .attr('x', 0)
                .attr('y', getYCasesLines({rolling_mean_100: i}))
                .attr('width', width)
                .attr('height', 1)
                .attr('fill', '#888');
        }
        svg.append('text')
            .text('300+')
            .attr('text-anchor', 'start')
            .attr('x', 2)
            .attr('y', y1 - 1)
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', '#222');

        for(var i=50; i<=250; i+=50) {
            svg.append('text')
                .text(i)
                .attr('text-anchor', 'start')
                .attr('x', 2)
                .attr('y', getYCasesLines({rolling_mean_100: i}) - 1)
                .style('font-size', 10)
                .style('font-weight', 'bolder')
                .style('fill', '#222');
        }

        var lineCases = d3.svg.line()
            .x(getXCases)
            .y(getYCasesLines);

        svg.selectAll('circle').data(scope.data.cases).enter().append('circle')
            .attr('cx', getXCases)
            .attr('cy', function(d){
                if(d.days_to_grant > 305) {
                    return getYDiff({days_to_grant: 300 + Math.random() * 5});
                }
                return getYDiff(d);
            })
            .attr('r', 2)
            .style('opacity', 0.4)
            .style('fill', function(d){
                if(d.nationality === 'South Africa') {
                    return 'darkgreen'
                } else if (d.occupation_code === '261313') {
                    return 'darkred'
                }
                return 'grey'
            });

        var lineData = [];
        scope.data.cases.forEach(function(d,i) {
            if(i < scope.data.cases.length-1 && d.grant_date !== scope.data.cases[i + 1].grant_date) {
                lineData.push(d);
            }
        });
        lineData.push(scope.data.cases[scope.data.cases.length-1]);

        svg.append('path')
            .datum(lineData)
            .attr("class", "line")
            .attr("d", lineCases)
            .style('stroke-width', 6)
            .style('stroke', 'steelblue')
            .style('fill', 'None')
            .style('stroke-opacity', 0.9);

        svg.append('path')
            .datum([{rolling_mean_100: 0, negative_index: 300}, {rolling_mean_100: 0, negative_index: daysSinceLodge}, {rolling_mean_100: daysSinceLodge, negative_index: 0}])
            .attr("class", "line")
            .attr("d", lineCases)
            .style('stroke-width', 5)
            .style('stroke', 'darkgreen')
            .style('fill', 'None')
            .style('stroke-opacity', 0.3);

        var month = parseInt(scope.data.cases[0].grant_date.substring(5, 7));

        scope.data.cases.forEach(function(d, i) {
            if (parseInt(d.grant_date.substring(5, 7)) === month) {
                month = month === 12 ? 1 : month + 1;
                svg.append('rect')
                    .attr('x', getXCases(d, i))
                    .attr('y', y1)
                    .attr('width', 1)
                    .attr('height', y2 - y1)
                    .attr('fill', '#888');
                svg.append('text')
                    .text(d.grant_date.substring(0, 7))
                    .attr('text-anchor', 'start')
                    .attr('x', getXCases(d, i) + 3)
                    .attr('y', y2 - 3)
                    .style('font-size', 10)
                    .style('font-weight', 'bolder')
                    .style('fill', '#222');
            }
        });
        scope.data.cases.reverse();
        var spacing = [10, 10+0.18*width, 10+0.35*width, 10+0.43*width, 10+0.62*width];
        svg.append('text')
            .text('Lodge Date')
            .attr('y', y2 + 20)
            .attr('x', spacing[0])
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', '#222');
        svg.append('text')
            .text('Grant Date')
            .attr('y', y2 + 20)
            .attr('x', spacing[1])
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', '#222');
        svg.append('text')
            .text('Days')
            .attr('y', y2 + 20)
            .attr('x', spacing[2])
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', '#222');
        svg.append('text')
            .text('Nationality')
            .attr('y', y2 + 20)
            .attr('x', spacing[3])
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', '#222');
        svg.append('text')
            .text('Occupation')
            .attr('y', y2 + 20)
            .attr('x', spacing[4])
            .style('font-size', 10)
            .style('font-weight', 'bolder')
            .style('fill', '#222');

        svg.append('rect')
            .attr('x', 10)
            .attr('y', y2+22)
            .attr('width', width-20)
            .attr('height', 1)
            .attr('fill', '#888');

        scope.data.cases.forEach(function(d, i){
            svg.append('text')
                .text(d.lodge_date)
                .attr('y', y2 + 35 + 15 * i)
                .attr('x', spacing[0])
                .style('font-size', 10)
                .style('fill', '#222');
            svg.append('text')
                .text(d.grant_date)
                .attr('y', y2 + 35 + 15 * i)
                .attr('x', spacing[1])
                .style('font-size', 10)
                .style('fill', '#222');
            svg.append('text')
                .text(d.days_to_grant)
                .attr('y', y2 + 35 + 15 * i)
                .attr('x', spacing[2])
                .style('font-size', 10)
                .style('fill', '#222');
            svg.append('text')
                .text(function(){
                    return d.nationality.length > 13 ? d.nationality.substring(0, 10) + '...' : d.nationality
                })
                .attr('y', y2 + 35 + 15 * i)
                .attr('x', spacing[3])
                .style('font-size', 10)
                .style('fill', '#222');
            svg.append('text')
                .text(function(){
                    return d.occupation.length > 23 ? d.occupation.substring(0, 20) + '...' : d.occupation
                })
                .attr('y', y2 + 35 + 15 * i)
                .attr('x', spacing[4])
                .style('font-size', 10)
                .style('fill', '#222');
        });
    }
    return {
        link: link,
        restrict: 'E',
        scope: {data: '='}
    };
});
