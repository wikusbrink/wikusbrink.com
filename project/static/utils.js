/**
 * Created by wikus on 2018/10/13.
 */

function addButton(x, y, w, h, parent, text, callback) {
    var rect = parent.append('rect')
        .attr('x', x + 4)
        .attr('y', y + 4)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', w - 8)
        .attr('height', h - 8)
        .style('fill', 'steelblue')
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .style('opacity', 0.7)
        .on('click', callback);
    parent.append('text')
        .attr('x', x + w / 2)
        .attr('y', y + h / 2 + 5)
        .text(text)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', 14)
        .on('click', callback);
    return rect
}

function getDay(date){
    var d = new Date(date);
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()];
}

function getToday() {
    var d = new Date();
    var month = String(d.getMonth() + 1).length < 2 ? '0' + (d.getMonth() + 1):(d.getMonth() + 1);
    var day = String(d.getDate() + 1).length < 2 ? '0' + d.getDate():d.getDate();
    return d.getUTCFullYear() + '-' + month + '-' + day;
}

function addMinutes(time, x){
    var d = new Date();
    d.setHours(time.substring(0,2));
    d.setMinutes(time.substring(3,5));
    d = new Date(d.getTime() + x*60000);
    var hours = String(d.getHours()).length < 2 ? '0' + String(d.getHours()) : String(d.getHours());
    var minutes = String(d.getMinutes()).length < 2 ? '0' + String(d.getMinutes()) : String(d.getMinutes());
    return hours + ':' + minutes;
}

function addDays(date, x){
    var d = new Date(date);
    d = new Date(d.getTime() + x*60000*60*24);
    var month = String(d.getMonth() + 1).length < 2 ? '0' + (d.getMonth() + 1):(d.getMonth() + 1);
    var day = String(d.getDate() + 1).length < 2 ? '0' + d.getDate():d.getDate();
    return d.getUTCFullYear() + '-' + month + '-' + day;
}

function daysDiff(date1, date2) {
    var d1 = (new Date(date1)).getTime();
    var d2 = (new Date(date2)).getTime();
    return Math.abs((d1-d2) / (60000*60*24));
}

function minutesDiff(dateTime1, dateTime2) {
    var d1 = new Date(dateTime1);
    var d2 = new Date(dateTime2);
    var diff = d1.getTime() - d2.getTime();
    return diff / 60000;
}

function inputExerciseGroup(x,y,w,parent, datum, field){
    parent.append('text')
        .attr('x', x + 12)
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
    }

    function plus(){
        datum.points = datum.points + 1;
        text.text(datum.points);
    }
    function minus(){
        datum.points = datum.points - 1;
        text.text(datum.points);
    }

    var images = [];
    exercises.forEach(function(d, i) {
        parent.append('rect')
            .attr('x', x + 15 + i * ((w - 30) / 6))
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
            .attr('x', x + 15 + i * ((w - 30) / 6) + 2.5)
            .attr('y', y + 2.5)
            .attr("xlink:href", d.icon)
            .attr('width', 25)
            .attr('height', 25)
            .attr('opacity', datum.type === d.name ? 1 : 0.2)
            .on('click', function(){setExercise(i)});
        images.push(image)
    });

    dataInputs.push(d3.select('body').append('input')
        .attr('type','text')
        .attr('placeholder', 'Notes')
        .attr('value', datum.notes)
        .style('position', 'absolute')
        .style('left', x + 15 + 'px')
        .style('top', y + 34.5 + 'px')
        .style('width', (w - 30)/2 - 17 + 'px')
        .style('height', '27px')
        .style('border', '1px solid black')
        .style('border-radius', '5px')
        .style('opacity', 0.7)
        .style('padding-left', '5px')
        .on('keyup', function() {
            datum.notes = this.value;
        }));

    var text = parent.append('text')
        .attr('x', x + 30 + 3 * ((w - 30) / 6))
        .attr('y', y + 57)
        .text(datum.points)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', 21);

    parent.append('rect')
        .attr('x', x + 15 + 4 * ((w - 30) / 6))
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
        .attr('x', x + 15 + 4 * ((w - 30) / 6) + 5)
        .attr('y', y + 34.5 + 13)
        .attr('width', 20)
        .attr('height', 4)
        .style('fill', 'darkgreen')
        .on('click', plus);

    parent.append('rect')
        .attr('x', x + 15 + 4 * ((w - 30) / 6) + 13)
        .attr('y', y + 34.5 + 5)
        .attr('width', 4)
        .attr('height', 20)
        .style('fill', 'darkgreen')
        .on('click', plus);

    parent.append('rect')
        .attr('x', x + 15 + 5 * ((w - 30) / 6))
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
        .attr('x', x + 15 + 5 * ((w - 30) / 6) + 5)
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


function inputGroup(x,y,w,parent, datum, field, label, suffix, increment, type){

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
    }
    function toggle(){
        datum[field] = !datum[field];

        text.text(String(datum[field]).toUpperCase())
            .style('fill', datum[field] ? 'darkgreen': 'darkred');
    }

    parent.append('text')
        .attr('x', x + 12)
        .attr('y', y + 22)
        .text(label)
        .attr('text-anchor', 'start')
        .style('font-size', 21);

    if (type !== 'bool') {

        var text = parent.append('text')
            .attr('x', x + w - 78)
            .attr('y', y + 22)
            .text(((datum[field] !== undefined && datum[field] !== null) ? datum[field]:'_') + suffix)
            .attr('text-anchor', 'end')
            .style('font-weight', 'bold')
            .style('font-size', 21);

        parent.append('rect')
            .attr('x', x + w - 70)
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
            .attr('x', x + w - 70 + 5)
            .attr('y', y + 13)
            .attr('width', 20)
            .attr('height', 4)
            .style('fill', 'darkgreen')
            .on('click', plus);

        parent.append('rect')
            .attr('x', x + w - 70 + 13)
            .attr('y', y + 5)
            .attr('width', 4)
            .attr('height', 20)
            .style('fill', 'darkgreen')
            .on('click', plus);

        parent.append('rect')
            .attr('x', x + w - 35)
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
            .attr('x', x + w - 35 + 5)
            .attr('y', y + 13)
            .attr('width', 20)
            .attr('height', 4)
            .style('fill', 'darkred')
            .on('click', minus);
    } else {

        parent.append('rect')
            .attr('x', x + w - 70)
            .attr('y', y)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 65)
            .attr('height', 30)
            .style('fill', 'white')
            .style('stroke-width', 1)
            .style('stroke', 'black')
            .style('opacity', 0.7)
            .on('click', toggle);

        var text = parent.append('text')
            .attr('x', x + w - 37.5)
            .attr('y', y + 22)
            .text(String(datum[field]).toUpperCase())
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('font-size', 18)
            .style('fill', datum[field] ? 'darkgreen': 'darkred')
            .on('click', toggle);
    }
}




