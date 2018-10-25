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

function minutesToString(m) {
    var hours = Math.floor(m / 60);
    var minutes = m - hours * 60;
    hours = String(hours).length < 2 ? '0' + hours: hours;
    minutes = String(minutes).length < 2 ? '0' + minutes: minutes;
    return hours + ':' + minutes;
}



