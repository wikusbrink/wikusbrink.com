
function removeDataElements() {
    dataGroup.remove();
    while(dataInputElements.length > 0) {
        dataInputElements.pop().remove();
    }
}
function createDataElements() {
    // Resize and set button colors.
    dataButton.style('fill', 'steelblue');
    metricsButton.style('fill', 'gray');
    height = (dataKeys.length) * 490 + 90;
    svg.attr('height', height);
    bg.attr('height', height);

    // Input box and button to create new data points.
    dataGroup = svg.append('g');
    var dayToAdd = addDays(dataKeys[0], 1);
    dataInputElements.push(d3.select('body').append('input')
            .attr('type','text')
            .attr('placeholder', 'xxxx-xx-xx')
            .attr('value', dayToAdd)
            .style('position', 'absolute')
            .style('left', 4 + 'px')
            .style('top', 53 + 'px')
            .style('text-align', 'center')
            .style('width', (size.width)/2 - 16 + 'px')
            .style('height', '30px')
            .style('border', '1px solid black')
            .style('border-radius', '5px')
            .style('opacity', 0.7)
            .style('padding-left', '5px')
            .on('keyup', function() {
                dayToAdd = this.value;
            }));
    addButton(size.width / 2, 50, size.width / 2, 40, dataGroup, 'Add datum', function(){
        addDataPoint(dayToAdd);
        removeDataElements();
        createDataElements();
    });

    // Add all the data points.
    dataKeys.forEach(function(key, i) {
        addDatum(i * 490 + 90, size.width, dataGroup, data[key], key)
    });
}


function addDatum(y, w, parent, datum, key) {
    var height = 480;
    var rect = parent.append('rect')
            .attr('x', 4)
            .attr('y', y + 4)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', w - 8)
            .attr('height', height)
            .style('fill', 'gray')
            .style('stroke-width', 1)
            .style('stroke', 'black')
            .style('opacity', 0.7);

    var rect = parent.append('rect')
            .attr('x', 4)
            .attr('y', y + 4)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', w - 8)
            .attr('height', 30)
            .style('fill', key === getToday() ? 'darkgreen':'steelblue')
            .style('stroke-width', 1)
            .style('stroke', 'black')
            .style('opacity', 0.7);

    parent.append('text')
            .attr('x', 10)
            .attr('y', y + 24)
            .text(key + ' (' + getDay(key) + ')')
            .attr('text-anchor', 'start')
            .style('font-weight', 'bold')
            .style('font-size', 14);

    inputGroup(0, y + 45, w, parent, datum, 'weight', 'Weight:', 'kg', 0.1, 'number', key);
    inputGroup(0, y + 80, w, parent, datum, 'alcohol', 'Drinks:', ' units', 1, 'number', key);
    inputGroup(0, y + 115, w, parent, datum, 'feedingWindowStart', 'FW start:', '', 15, 'time', key);
    inputGroup(0, y + 150, w, parent, datum, 'feedingWindowEnd', 'FW end:', '', 15, 'time', key);
    inputGroup(0, y + 185, w, parent, datum, 'cleanEating', 'Clean eating:', '', '', 'bool', key);
    inputExerciseGroup(0, y + 220, w, parent, datum['morningExercise'], 'Morning exercise:', key);
    inputExerciseGroup(0, y + 330, w, parent, datum['afternoonExercise'], 'Afternoon exercise:', key);

    dataInputElements.push(d3.select("body").append('input')
            .attr('type','text')
            .attr('placeholder', 'Genaral notes')
            .attr('value', datum.notes)
            .style('position', 'absolute')
            .style('left', grid[0].start + 'px')
            .style('top', y + 443 + 'px')
            .style('width', (grid[5].end - grid[0].start - 8) + 'px')
            .style('height', '27px')
            .style('border', '1px solid black')
            .style('border-radius', '5px')
            .style('opacity', 0.7)
            .style('padding-left', '5px')
            .on('keyup', function() {
                datum.notes = this.value;
                addToStoreQueue(key);
            }));
}

function inputExerciseGroup(x,y,w,parent, datum, field, date){

    parent.append('text')
        .attr('x', grid[0].start)
        .attr('y', y + 22)
        .text(field)
        .attr('text-anchor', 'start')
        .style('font-size', 21);

    y = y + 35;

    function setExercise(i){
        if(datum.type === exercises[i].name) {
            datum.type = undefined;
        } else {
            datum.type = exercises[i].name;
        }

        exercises.forEach(function(d, j) {
            images[j].attr('opacity', datum.type === d.name ? 1 : 0.2)
        });
        addToStoreQueue(date);
    }

    function plus(){
        datum.points = datum.points + 1;
        text.text(datum.points);
        addToStoreQueue(date);
    }
    function minus(){
        datum.points = datum.points - 1;
        text.text(datum.points);
        addToStoreQueue(date);
    }

    var images = [];

    exercises.forEach(function(d, i) {
        parent.append('rect')
            .attr('x', grid[i].middle - 15)
            .attr('y', y)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 30)
            .attr('height', 30)
            .style('fill', 'white')
            .style('stroke-width', 1)
            .style('stroke', 'black')
            .style('opacity', 0.7)
            .on('click', function(){setExercise(i)});
        var image = parent.append("image")
            .attr('x', grid[i].middle - 15 + 2.5)
            .attr('y', y + 2.5)
            .attr("xlink:href", d.icon)
            .attr('width', 25)
            .attr('height', 25)
            .attr('opacity', datum.type === d.name ? 1 : 0.2)
            .on('click', function(){setExercise(i)});
        images.push(image)
    });

    dataInputElements.push(d3.select('body').append('input')
        .attr('type','text')
        .attr('placeholder', 'Notes')
        .attr('value', datum.notes)
        .style('position', 'absolute')
        .style('left', grid[0].middle - 15 + 'px')
        .style('top', y + 34.5 + 'px')
        .style('width', grid[2].middle - grid[0].middle + 22 + 'px')
        .style('height', '27px')
        .style('border', '1px solid black')
        .style('border-radius', '5px')
        .style('opacity', 0.7)
        .style('padding-left', '5px')
        .on('keyup', function() {
            datum.notes = this.value;
            addToStoreQueue(date);
        }));

    var text = parent.append('text')
        .attr('x', grid[3].middle)
        .attr('y', y + 57)
        .text(datum.points)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', 21);

    parent.append('rect')
        .attr('x', grid[4].middle - 15)
        .attr('y', y + 34.5)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', 30)
        .attr('height', 30)
        .style('fill', 'white')
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .style('opacity', 0.7)
        .on('click', plus);

    parent.append('rect')
        .attr('x', grid[4].middle - 15 + 5)
        .attr('y', y + 34.5 + 13)
        .attr('width', 20)
        .attr('height', 4)
        .style('fill', 'darkgreen')
        .on('click', plus);

    parent.append('rect')
        .attr('x', grid[4].middle - 15 + 13)
        .attr('y', y + 34.5 + 5)
        .attr('width', 4)
        .attr('height', 20)
        .style('fill', 'darkgreen')
        .on('click', plus);

    parent.append('rect')
        .attr('x', grid[5].middle - 15)
        .attr('y', y + 34.5)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', 30)
        .attr('height', 30)
        .style('fill', 'white')
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .style('opacity', 0.7)
        .on('click', minus);

    parent.append('rect')
        .attr('x', grid[5].middle - 15 + 5)
        .attr('y', y + 34.5 + 13)
        .attr('width', 20)
        .attr('height', 4)
        .style('fill', 'darkred')
        .on('click', minus);
}

function findLatest(field){
    value = undefined;
    var i = 0;
    while(value === undefined || value === null) {
        i++;
        value = data[dataKeys[i]][field];
    }
    return value;
}


function inputGroup(x,y,w,parent, datum, field, label, suffix, increment, type, date){

    function plus() {
        if(type === 'time'){
            datum[field] = addMinutes(datum[field], increment)
        } else {
            if(datum[field] === undefined || datum[field] === null) {
                datum[field] = findLatest(field)
            }
            datum[field] = Math.round((datum[field] + increment) * 10) / 10;
        }
        text.text(datum[field]+ suffix);
        addToStoreQueue(date);
    }
    function minus() {
        if(type === 'time'){
            datum[field] = addMinutes(datum[field], -increment)
        } else {
            if(datum[field] === undefined || datum[field] === null) {
                datum[field] = findLatest(field)
            }
            datum[field] = Math.round((datum[field] - increment) * 10) / 10;
        }
        text.text(datum[field]+ suffix);
        addToStoreQueue(date);
    }
    function toggle(){
        datum[field] = !datum[field];

        text.text(String(datum[field]).toUpperCase())
            .style('fill', datum[field] ? 'darkgreen': 'darkred');
        addToStoreQueue(date);
    }

    parent.append('text')
        .attr('x', grid[0].start)
        .attr('y', y + 22)
        .text(label)
        .attr('text-anchor', 'start')
        .style('font-size', 21);

    if (type !== 'bool') {

        var text = parent.append('text')
            .attr('x', grid[3].end)
            .attr('y', y + 22)
            .text(((datum[field] !== undefined && datum[field] !== null) ? datum[field]:'_') + suffix)
            .attr('text-anchor', 'end')
            .style('font-weight', 'bold')
            .style('font-size', 21);

        parent.append('rect')
            .attr('x', grid[4].middle - 15)
            .attr('y', y)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 30)
            .attr('height', 30)
            .style('fill', 'white')
            .style('stroke-width', 1)
            .style('stroke', 'black')
            .style('opacity', 0.7)
            .on('click', plus);

        parent.append('rect')
            .attr('x', grid[4].middle - 15 + 5)
            .attr('y', y + 13)
            .attr('width', 20)
            .attr('height', 4)
            .style('fill', 'darkgreen')
            .on('click', plus);

        parent.append('rect')
            .attr('x', grid[4].middle - 15 + 13)
            .attr('y', y + 5)
            .attr('width', 4)
            .attr('height', 20)
            .style('fill', 'darkgreen')
            .on('click', plus);

        parent.append('rect')
            .attr('x', grid[5].middle - 15)
            .attr('y', y)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 30)
            .attr('height', 30)
            .style('fill', 'white')
            .style('stroke-width', 1)
            .style('stroke', 'black')
            .style('opacity', 0.7)
            .on('click', minus);

        parent.append('rect')
            .attr('x', grid[5].middle - 15 + 5)
            .attr('y', y + 13)
            .attr('width', 20)
            .attr('height', 4)
            .style('fill', 'darkred')
            .on('click', minus);
    } else {
        parent.append('rect')
            .attr('x', grid[4].middle - 15)
            .attr('y', y)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', grid[5].width + 30)
            .attr('height', 30)
            .style('fill', 'white')
            .style('stroke-width', 1)
            .style('stroke', 'black')
            .style('opacity', 0.7)
            .on('click', toggle);

        var text = parent.append('text')
            .attr('x', grid[5].start)
            .attr('y', y + 22)
            .text(String(datum[field]).toUpperCase())
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('font-size', 18)
            .style('fill', datum[field] ? 'darkgreen': 'darkred')
            .on('click', toggle);
    }
}





