/**
 * Created by wikus on 2018/10/14.
 */

function createMetricsElements() {
    // Resize and set button colors.
    dataButton.style('fill', 'gray');
    metricsButton.style('fill', 'steelblue');
    metricsDiv = d3.select('body').append('div');
    metricsSvg = metricsDiv.append('svg')
        .attr('width', size.width)
        .attr('height', metricsHeight);
    datesSvg = metricsDiv.append('div')
        .attr('width', size.width)
        .style('position', 'fixed')
        .style('bottom', 0)
        .style('height', '65px')
        .append('svg')
        .attr('width', size.width)
        .attr('height', 65);
    datesSvg.append('rect')
        .attr('width', size.width)
        .attr('height', 65)
        .style('fill', 'white')
        .attr('opacity', 0.8);
    // Add content.
    var h = addMetrics(size.width, metricsSvg, datesSvg)
    metricsSvg.attr('height', h);
}
function removeMetricsElements() {
    metricsDiv.remove();
}

function getRollingWeight(metricsKeys){
    var dataLength = metricsKeys.length;
    var rollingWeights = [];
    var windowSize = 5;
    for(var i=windowSize; i<dataLength; i++) {
        var count = 0;
        var sum = 0;
        for(var j=0; j<windowSize; j++){
            if(data[metricsKeys[i-j]].weight){
                count++;
                sum = sum + data[metricsKeys[i-j]].weight;
            }
        }
        rollingWeights.push({date: metricsKeys[i], weight: sum/count});
    }
    return rollingWeights
}

function getRollingExercise(metricsKeys){
    var dataLength = metricsKeys.length;
    var rollingPoints = [];
    var windowSize = 5;
    for(var i=windowSize; i<dataLength; i++) {
        var sum = 0;
        for(var j=0; j<windowSize; j++){
            mep = data[metricsKeys[i-j]].morningExercise.points ? data[metricsKeys[i-j]].morningExercise.points: 0;
            aep = data[metricsKeys[i-j]].afternoonExercise.points ? data[metricsKeys[i-j]].afternoonExercise.points: 0;
            sum = sum + mep + aep;
        }
        rollingPoints.push({date: metricsKeys[i], points: sum/windowSize});
    }
    return rollingPoints
}

function getFastingWindows(metricsKeys) {
    var dataLength = metricsKeys.length;
    var fastingWindows = [];
    for(var i=1; i<dataLength; i++) {
        var t1 = metricsKeys[i-1] + ' ' + data[metricsKeys[i-1]].feedingWindowEnd;
        var t2 = metricsKeys[i] + ' ' + data[metricsKeys[i]].feedingWindowStart;
        fastingWindows.push({date: metricsKeys[i], minutes: minutesDiff(t2, t1)});
    }
    return fastingWindows
}

function getFeedingWindows(metricsKeys){
    var dataLength = metricsKeys.length;
    var feedingWindows = [];
    for(var i=1; i<dataLength; i++) {
        var t1 = metricsKeys[i] + ' ' + data[metricsKeys[i]].feedingWindowStart;
        var t2 = metricsKeys[i] + ' ' + data[metricsKeys[i]].feedingWindowEnd;
        feedingWindows.push({date: metricsKeys[i], minutes: minutesDiff(t2, t1)});
    }
    return feedingWindows
}

function addMetrics(w, parent, footerParent){
    var metricsKeys = dataKeys.slice().reverse();
    var dataLength = metricsKeys.length;
    var firstDate = metricsKeys[10];
    var lastDate = addDays(getToday(), 5);
    var barWidth = w / daysDiff(lastDate, firstDate);

    var layout = {};
    layout['weight']= {
        y: 20,
        h: 200,
        title: 'Weight',
        range: [78, 88],
        g: parent.append('g')
    };
    layout['fasting'] = {
        y: layout['weight'].y + layout['weight'].h + 30,
        h: 200,
        title: 'Fasting and feeding',
        g: parent.append('g'),
        range: [0, 1440]
    };
    layout['exercise'] = {
        y: layout['fasting'].y + layout['fasting'].h + 30,
        h: 100,
        title: 'Exercise points',
        g: parent.append('g'),
        range: [0, 10]
    };
    layout['cleanEating'] = {
        y: layout['exercise'].y + layout['exercise'].h + 30,
        h: 25,
        title: 'Clean eating',
        g: parent.append('g')
    };
    layout['alcohol'] = {
        y: layout['cleanEating'].y + layout['cleanEating'].h + 30,
        h: 100,
        title: 'Drinks',
        range: [0, 10],
        g: parent.append('g')
    };
    layout['dates'] = {
        y: layout['alcohol'].y + layout['alcohol'].h + 8,
        g: parent.append('g'),
        gridLines: _.map(d3.range(4, dataLength, 7), function(d){ return metricsKeys[d]})
    };
    var height = layout.dates.y + 60;

    _.keys(layout).forEach(function(d) {
        if(layout[d].title){
            layout[d].g.append('text')
                .text(layout[d].title)
                .attr('x', 6)
                .attr('text-anchor', 'left')
                .attr('y', layout[d].y - 1)
                .attr('class', 'title');
        }
        if(layout[d].y && layout[d].h){
            layout['dates'].gridLines.forEach(function(date){
                layout[d].g.append('rect')
                    .attr('class', 'gridLine')
                    .attr('y', layout[d].y)
                    .attr('x', dateToX(date))
                    .attr('height', layout[d].h)
                    .attr('width', 1);
            });
        }
    });
    layout['dates'].gridLines.forEach(function(date){
        footerParent.append('text')
            .attr('transform', 'translate(' + (dateToX(date) - 3) + ',' + 3 + '), rotate(90)')
            .attr('y', 0)
            .attr('x', 0)
            .text(date)
            .attr('class', 'annotation')
    });

    function weightToY(d) {
        var y = layout['weight'].y;
        var h = layout['weight'].h;
        var range = layout['weight'].range;
        if(typeof d === 'number') {
            var weight = d;
        } else if (typeof d === 'string') {
            var weight = data[d].weight;
        } else {
            var weight = d.weight;
        }
        if (weight === undefined || weight === null) {
            return y + h;
        }
        return y + (h * (range[1] - weight) / (range[1] - range[0]))
    }

    function dateToX(d) {
        var date;
        if(typeof d === 'string') {
            date = d;
        } else if (typeof d === 'number') {
            date = metricsKeys[d];
        } else {
            date = d.date;
        }
        var range = daysDiff(lastDate, firstDate);
        var daysFromStart = daysDiff(date, firstDate);
        return daysFromStart / range * w;
    }
    function xToDate(d) {
        var range = daysDiff(lastDate, firstDate);
        var daysFromStart = Math.round(d / w * range);
        return addDays(metricsKeys[10], daysFromStart);
    }

    d3.range(layout['weight'].range[0], layout['weight'].range[1] + 1, 2).forEach(function(d) {
        layout['weight'].g.append('rect')
            .attr('y', weightToY(d))
            .attr('class', 'gridLine')
            .attr('x', 0)
            .attr('height', d === 80 ?  3:1)
            .attr('width', w);
        layout['weight'].g.append('text')
            .attr('y', weightToY(d)-1)
            .attr('x', w-2)
            .text(d)
            .attr('class', 'annotation')
            .attr('text-anchor', 'end');
    });

    var weightLine = d3.line()
        .defined(function(d) { return d.weight; })
        .x(dateToX)
        .y(weightToY);

    layout['weight'].g.append('g').selectAll('rect')
        .data(metricsKeys)
        .enter()
        .append('rect')
        .attr('y', weightToY)
        .attr('x', function(d){return dateToX(d) - w / (dataLength + 1) / 2})
        .attr('height', function(d){return layout['weight'].y + layout['weight'].h - weightToY(d)})
        .attr('width', barWidth)
        .style('fill', function(d,i) {
            if(i > 1){
                var previousWeight = data[metricsKeys[i-1]].weight;
                var currentWeight = data[metricsKeys[i]].weight;
                if(previousWeight === undefined || previousWeight === null) {
                    var j = i;
                    while(j > 0 && previousWeight === undefined || previousWeight === null) {
                        j--;
                        previousWeight = data[metricsKeys[j]].weight
                    }
                }
                if(previousWeight === undefined || previousWeight === null) {
                    return 'gray'
                }
                if(previousWeight > currentWeight || currentWeight <= 80){
                    return 'darkgreen'
                } else if (previousWeight === currentWeight) {
                    return 'darkblue'
                } else {
                    return 'darkred'
                }
            }
            return 'gray'
        })
        .style('opacity', 0.5);

    var rollingWeights = getRollingWeight(metricsKeys)
    layout['weight'].g.append('path')
        .datum(rollingWeights)
        .attr('d', weightLine)
        .style('stroke-width', 6)
        .style('stroke', 'black')
        .style('stroke-linecap', 'round')
        .style('fill', 'None')
        .style('stroke-opacity', 0.7);

    [layout['cleanEating'].y, layout['cleanEating'].y + layout['cleanEating'].h].forEach(function(d){
        layout['cleanEating'].g.append('rect')
            .attr('y', d)
            .attr('x', 0)
            .attr('height', 1)
            .attr('width', w)
            .attr('class', 'gridLine');
    });
    metricsKeys.forEach(function(d){
        layout['cleanEating'].g.append('rect')
            .attr('y', layout['cleanEating'].y)
            .attr('x', dateToX(d) - w / (dataLength + 1) / 2)
            .attr('height', layout['cleanEating'].h)
            .attr('width', barWidth)
            .style('fill', function(){return data[d].cleanEating ? 'darkgreen': 'darkred'})
            .style('opacity', function(){return data[d].cleanEating ? 0.8: 0.2});

    });

    function durationToY(duration){
        var minutes;
        if (typeof duration === 'number') {
            minutes = duration;
        } else {
            minutes = duration.minutes;
        }
        return layout['fasting'].y + layout['fasting'].h - layout['fasting'].h/(layout['fasting'].range[1]) * minutes;
    }

    var fastingLine = d3.line()
        .defined(function(d) { return d.minutes; })
        .x(dateToX)
        .y(durationToY);

    d3.range(layout['fasting'].range[0], layout['fasting'].range[1] + 1, 240).forEach(function(d){
        layout['fasting'].g.append('rect')
            .attr('y', function(){ return durationToY({minutes: d})})
            .attr('x', 0)
            .attr('height', (d === 480 | d === 960) ?  3:1)
            .attr('width', w)
            .attr('class', 'gridLine');
        layout['fasting'].g.append('text')
            .attr('y', function(){ return durationToY({minutes: d}) - 1})
            .attr('x', w-2)
            .text(d / 60 + 'h')
            .attr('class', 'annotation')
            .attr('text-anchor', 'end');
    });

    var fastingWindows = getFastingWindows(metricsKeys);
    layout['fasting'].g.append('path')
        .datum(fastingWindows)
        .attr("class", "line")
        .attr('d', fastingLine)
        .style('stroke-width', 6)
        .style('stroke', 'darkgreen')
        .style('stroke-linecap', 'round')
        .style('fill', 'None')
        .style('stroke-opacity', 0.6);

    var feedingWindows = getFeedingWindows(metricsKeys);
    layout['fasting'].g.append('path')
        .datum(feedingWindows)
        .attr("class", "line")
        .attr('d', fastingLine)
        .style('stroke-width', 6)
        .style('stroke', 'darkblue')
        .style('stroke-linecap', 'round')
        .style('fill', 'None')
        .style('stroke-opacity', 0.6);

    function morningExercisePointsToY(d) {
        var points;
        if (typeof d === 'number') {
            points = d;
        } else if (typeof d === 'string') {
            points = data[d].morningExercise.points ? data[d].morningExercise.points : 0;
        } else {
            points = d.morningExercise.points ? d.morningExercise.points : 0;
        }
        return (layout['exercise'].y + layout['exercise'].h) - layout['exercise'].h / (layout['exercise'].range[1] - layout['exercise'].range[0]) * points;
    }
    function afternoonExercisePointsToY(d) {
        var points;
        if (typeof d === 'number') {
            points = d;
        } else if (typeof d === 'string') {
            points =data[d].afternoonExercise.points ? data[d].afternoonExercise.points : 0;
        } else {
            points = d.afternoonExercise.points ? d.afternoonExercise.points : 0;
        }
        return (layout['exercise'].y + layout['exercise'].h) - layout['exercise'].h / (layout['exercise'].range[1] - layout['exercise'].range[0]) * points;
    }

    d3.range(layout['exercise'].range[0], layout['exercise'].range[1] + 1, 5).forEach(function(d){
        layout['exercise'].g.append('rect')
            .attr('y', morningExercisePointsToY(d))
            .attr('x', 0)
            .attr('height', 1)
            .attr('width', w)
            .attr('class', 'gridLine');
        layout['exercise'].g.append('text')
            .attr('y', morningExercisePointsToY(d) - 1)
            .attr('x', w - 2)
            .text(d)
            .attr('class', 'annotation')
            .attr('text-anchor', 'end');
    });

    layout['exercise'].g.append('g').selectAll('rect')
        .data(metricsKeys)
        .enter()
        .append('rect')
        .attr('y', morningExercisePointsToY)
        .attr('x', function(d){return dateToX(d) - w / (dataLength + 1) / 2})
        .attr('height', function(d){return layout['exercise'].y + layout['exercise'].h - morningExercisePointsToY(d)})
        .attr('width', barWidth)
        .style('fill', function(d){
            var type = data[d].morningExercise.type;
            if(type){
                return _.find(exercises, {name: type}).color    
            }
            else {
                return 'black'
            }
        })
        .style('opacity', 0.7);

    layout['exercise'].g.append('g').selectAll('rect')
        .data(metricsKeys)
        .enter()
        .append('rect')
        .attr('y', function(d){return morningExercisePointsToY(d) + afternoonExercisePointsToY(d) - (layout['exercise'].y + layout['exercise'].h)})
        .attr('x', function(d){return dateToX(d) - w / (dataLength + 1) / 2})
        .attr('height', function(d){return layout['exercise'].y + layout['exercise'].h - afternoonExercisePointsToY(d)})
        .attr('width', barWidth)
        .style('fill', function(d){
            var type = data[d].afternoonExercise.type;
            if(type){
                return _.find(exercises, {name: type}).color    
            }
            else {
                return 'black'
            }
        })
        .style('opacity', 0.5);

    var rollingExercise = getRollingExercise(metricsKeys);
    var exerciseLine = d3.line()
        .defined(function(d) { return d.points; })
        .x(dateToX)
        .y(function(d){
            return morningExercisePointsToY(d.points);
        });

    layout['exercise'].g.append('path')
        .datum(rollingExercise)
        .attr('d', exerciseLine)
        .style('stroke-width', 6)
        .style('stroke', 'black')
        .style('stroke-linecap', 'round')
        .style('fill', 'None')
        .style('stroke-opacity', 0.7);

    function alcoholUnitsToY(d) {
        var units;
        if (typeof d === 'number') {
            units = d;
        } else if (typeof d === 'string') {
            units = data[d].alcohol ? data[d].alcohol : 0;
        } else {
            units = d.alcohol ? d.alcohol : 0;
        }
        return (layout['alcohol'].y + layout['alcohol'].h) - layout['alcohol'].h / (layout['alcohol'].range[1] - layout['alcohol'].range[0]) * units;
    }

    d3.range(layout['alcohol'].range[0], layout['alcohol'].range[1] + 1, 5).forEach(function(d){
        layout['alcohol'].g.append('rect')
            .attr('y', alcoholUnitsToY(d))
            .attr('x', 0)
            .attr('height', 1)
            .attr('width', w)
            .attr('class', 'gridLine');
        layout['exercise'].g.append('text')
            .attr('y', alcoholUnitsToY(d) - 1)
            .attr('x', w - 2)
            .text(d)
            .attr('class', 'annotation')
            .attr('text-anchor', 'end');
    });
    layout['alcohol'].g.append('g').selectAll('rect')
        .data(metricsKeys)
        .enter()
        .append('rect')
        .attr('y', alcoholUnitsToY)
        .attr('x', function(d){return dateToX(d) - w / (dataLength + 1) / 2})
        .attr('height', function(d){return layout['alcohol'].y + layout['alcohol'].h - alcoholUnitsToY(d)})
        .attr('width', barWidth)
        .style('fill', 'darkred')
        .style('opacity', 0.5);

    var valueGroup = parent.append('g');
    var valueGroupLines = valueGroup.append('g');
    var valueGroupRects = valueGroup.append('g');


    var labels = {};
    _.keys(layout).forEach(function(d) {
        if(layout[d].y && layout[d].h){
            valueGroupLines.append('rect')
                .attr('y', layout[d].y)
                .attr('x', 100 - 2.5)
                .attr('height', layout[d].h)
                .attr('width', 5)
                .style('fill', 'black')
                .style('opacity', 0.5)        
                .call(d3.drag().on("drag", function(d){
                    updateLabelsWithDate(d3.event.x, xToDate(d3.event.x))
            }));
            valueGroupRects.append('rect')
                .attr('y', layout[d].y)
                .attr('x', 100 - 20)
                .attr('height', layout[d].h)
                .attr('width', 40)
                .style('fill', 'black')
                .style('opacity', 0.0)        
                .call(d3.drag().on("drag", function(d){
                    updateLabelsWithDate(d3.event.x, xToDate(d3.event.x))
            }));
        }
    });

    labels['weightShade'] = valueGroup.append('text')
        .attr('class', 'annotation-shade')
        .attr('text-anchor', 'start')
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.7);
    labels['weight'] = valueGroup.append('text')
        .attr('class', 'annotation')
        .attr('text-anchor', 'start');
    labels['fastingWindowLengthShade'] = valueGroup.append('text')
        .attr('class', 'annotation-shade')
        .attr('text-anchor', 'start')
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.7);
    labels['fastingWindowLength'] = valueGroup.append('text')
        .attr('class', 'annotation')
        .attr('text-anchor', 'start');
    labels['feedingWindowLengthShade'] = valueGroup.append('text')
        .attr('class', 'annotation-shade')
        .attr('text-anchor', 'start')
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.7);
    labels['feedingWindowLength'] = valueGroup.append('text')
        .attr('class', 'annotation')
        .attr('text-anchor', 'start');
    labels['exerciseShade'] = valueGroup.append('text')
        .attr('class', 'annotation-shade')
        .attr('text-anchor', 'start')
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.7);
    labels['exercise'] = valueGroup.append('text')
        .attr('class', 'annotation')
        .attr('text-anchor', 'start');


    function updateLabelsWithDate(x, date){
        valueGroupLines.selectAll('rect').attr('x', x - 2.5);
        valueGroupRects.selectAll('rect').attr('x', x - 20);
        var weightObject = _.find(rollingWeights, function(d){ return d.date === date})
        if(weightObject !== undefined){
            var weight = Math.round(weightObject.weight * 10) / 10;
            labels['weight'].attr('x', x + 5)
                .text(weight)
                .attr('y', weightToY(weight) - 5)
            labels['weightShade'].attr('x', x + 5)
                .text(weight)
                .attr('y', weightToY(weight) - 5)
        } else {
            labels['weight'].text('')
        }
        var exerciseObject = _.find(rollingExercise, function(d){ return d.date === date})
        if(exerciseObject !== undefined){
            var exercise = Math.round(exerciseObject.points * 10) / 10;
            labels['exercise'].attr('x', x + 5)
                .text(exercise)
                .attr('y', morningExercisePointsToY(exercise) - 5)
            labels['exerciseShade'].attr('x', x + 5)
                .text(exercise)
                .attr('y', morningExercisePointsToY(exercise) - 5)
        } else {
            labels['exercise'].text('')
        }
        var fastingWindow = _.find(fastingWindows, function(d){ return d.date === date}).minutes;
        labels['fastingWindowLength'].attr('x', x + 5)
            .text(minutesToString(fastingWindow))
            .attr('y', durationToY(fastingWindow))
        labels['fastingWindowLengthShade'].attr('x', x + 5)
            .text(minutesToString(fastingWindow))
            .attr('y', durationToY(fastingWindow))
        var feedingWindow = _.find(feedingWindows, function(d){ return d.date === date}).minutes;
        labels['feedingWindowLength'].attr('x', x + 5)
            .text(minutesToString(feedingWindow))
            .attr('y', durationToY(feedingWindow))
        labels['feedingWindowLengthShade'].attr('x', x + 5)
            .text(minutesToString(feedingWindow))
            .attr('y', durationToY(feedingWindow))
    }
    updateLabelsWithDate(dateToX(getToday()), getToday())

    return height;
}
