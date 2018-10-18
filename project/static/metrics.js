/**
 * Created by wikus on 2018/10/14.
 */

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

function addWeightGraph(w, parent){
    var metricsKeys = dataKeys.slice().reverse();
    var dataLength = metricsKeys.length;

    var layout = {};
    layout['weight']= {
        y: 80,
        h: 290,
        title: 'Weight',
        range: [80, 90],
        g: parent.append('g')
    };
    layout['fasting'] = {
        y: layout['weight'].y + layout['weight'].h + 40,
        h: 210,
        title: 'Fasting and feeding',
        g: parent.append('g'),
        range: [0, 1440]
    };
    layout['exercise'] = {
        y: layout['fasting'].y + layout['fasting'].h + 40,
        h: 60,
        title: 'Exercise points',
        g: parent.append('g'),
        range: [0, 10]
    };
    layout['cleanEating'] = {
        y: layout['exercise'].y + layout['exercise'].h + 40,
        h: 25,
        title: 'Clean eating',
        g: parent.append('g')
    };
    layout['alcohol'] = {
        y: layout['cleanEating'].y + layout['cleanEating'].h + 40,
        h: 60,
        title: 'Drinks',
        range: [0, 10],
        g: parent.append('g')
    };
    layout['dates'] = {
        y: layout['alcohol'].y + layout['alcohol'].h + 8,
        g: parent.append('g'),
        gridLines: _.map(d3.range(0.1,1.1,0.1), function(d){ return metricsKeys[Math.round((dataLength-1) * d)]})
    };

    _.keys(layout).forEach(function(d) {
        if(layout[d].title){
            layout[d].g.append('text')
                .text(layout[d].title)
                .attr('x', 6)
                .attr('text-anchor', 'left')
                .attr('y', layout[d].y - 2)
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
        layout['dates'].g.append('text')
            .attr('transform', 'translate(' + (dateToX(date) - 3) + ',' + layout['dates'].y + '), rotate(90)')
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
        if (weight === undefined) {
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
        var range = daysDiff(metricsKeys[0], metricsKeys[dataLength - 1]) + 5;
        var daysFromStart = daysDiff(metricsKeys[0], date);
        return daysFromStart / range * w;
    }

    d3.range(layout['weight'].range[0], layout['weight'].range[1] + 1, 2).forEach(function(d) {
        layout['weight'].g.append('rect')
            .attr('y', weightToY(d))
            .attr('class', 'gridLine')
            .attr('x', 0)
            .attr('height', 1)
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
        .attr('x', function(d){return dateToX(d) - w / (dataLength + 5) / 2})
        .attr('height', function(d){return layout['weight'].y + layout['weight'].h - weightToY(d)})
        .attr('width', w / (dataLength + 5))
        .style('fill', function(d,i) {
            if(i > 0){
                var previousWeight = data[metricsKeys[i-1]].weight;
                var currentWeight = data[metricsKeys[i]].weight;
                if(previousWeight === undefined) {
                    var j = i;
                    while(j > 0 && previousWeight === undefined) {
                        j--;
                        previousWeight = data[metricsKeys[j]].weight
                    }
                }
                if(previousWeight === undefined) {
                    return 'gray'
                }
                if(previousWeight > currentWeight){
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

    layout['weight'].g.append('path')
        .datum(getRollingWeight(metricsKeys))
        .attr('d', weightLine)
        .style('stroke-width', 6)
        .style('stroke', 'black')
        .style('stroke-linecap', 'round')
        .style('fill', 'None')
        .style('stroke-opacity', 0.9);

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
            .attr('x', dateToX(d) - w / (dataLength + 5) / 2)
            .attr('height', layout['cleanEating'].h)
            .attr('width', w / (dataLength+5))
            .style('fill', function(){return data[d].cleanEating ? 'darkgreen': 'darkred'})
            .style('opacity', function(){return data[d].cleanEating ? 0.8: 0.2});

    });

    function durationToY(duration){
        return layout['fasting'].y + layout['fasting'].h - layout['fasting'].h/(layout['fasting'].range[1]) * duration.minutes;
    }

    var fastingLine = d3.line()
        .defined(function(d) { return d.minutes; })
        .x(dateToX)
        .y(durationToY);

    d3.range(layout['fasting'].range[0], layout['fasting'].range[1] + 1, 240).forEach(function(d){
        layout['fasting'].g.append('rect')
            .attr('y', function(){ return durationToY({minutes: d})})
            .attr('x', 0)
            .attr('height', (d === 480 | d === 960) ?  5:1)
            .attr('width', w)
            .attr('class', 'gridLine');
        layout['fasting'].g.append('text')
            .attr('y', function(){ return durationToY({minutes: d}) - 1})
            .attr('x', w-2)
            .text(d / 60 + 'h')
            .attr('class', 'annotation')
            .attr('text-anchor', 'end');
    });

    layout['fasting'].g.append('path')
        .datum(getFastingWindows(metricsKeys))
        .attr("class", "line")
        .attr('d', fastingLine)
        .style('stroke-width', 6)
        .style('stroke', 'darkgreen')
        .style('stroke-linecap', 'round')
        .style('fill', 'None')
        .style('stroke-opacity', 0.6);

    layout['fasting'].g.append('path')
        .datum(getFeedingWindows(metricsKeys))
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
        .attr('x', function(d){return dateToX(d) - w / (dataLength + 5) / 2})
        .attr('height', function(d){return layout['exercise'].y + layout['exercise'].h - morningExercisePointsToY(d)})
        .attr('width', w / (dataLength + 5))
        .style('fill', 'darkblue')
        .style('opacity', 0.5);

    layout['exercise'].g.append('g').selectAll('rect')
        .data(metricsKeys)
        .enter()
        .append('rect')
        .attr('y', function(d){return morningExercisePointsToY(d) + afternoonExercisePointsToY(d) - (layout['exercise'].y + layout['exercise'].h)})
        .attr('x', function(d){return dateToX(d) - w / (dataLength + 5) / 2})
        .attr('height', function(d){return layout['exercise'].y + layout['exercise'].h - afternoonExercisePointsToY(d)})
        .attr('width', w / (dataLength + 5))
        .style('fill', 'darkgreen')
        .style('opacity', 0.5);

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
        .attr('x', function(d){return dateToX(d) - w / (dataLength + 5) / 2})
        .attr('height', function(d){return layout['alcohol'].y + layout['alcohol'].h - alcoholUnitsToY(d)})
        .attr('width', w / (dataLength + 5))
        .style('fill', 'darkred')
        .style('opacity', 0.5);
}





