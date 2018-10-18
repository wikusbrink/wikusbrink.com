

function getData(callback) {
    var xmlHttp = new XMLHttpRequest();
    var url = "http://localhost:5000/api/lifestyle/";
    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            callback(data);
        }
    };
    xmlHttp.open("GET", url, true);
    xmlHttp.send();
}

function putDatum(datum, callback) {
    var xmlHttp = new XMLHttpRequest();
    var url = "http://localhost:5000/api/lifestyle/" + datum.date;

}

function addDataPoint(dayToAdd){
    data[dayToAdd] = {
        weight: undefined,
        alcohol: 0,
        feedingWindowStart: '12:00',
        feedingWindowEnd: '19:00',
        cleanEating: false,
        notes: '',
        morningExercise: {
            type: undefined,
            points: 0,
            notes: undefined
        },
        afternoonExercise: {
            type: undefined,
            points: 0,
            notes: undefined
        }
    };
    dataKeys = _.sortBy(_.keys(data), function(d){return d});
    dataKeys.reverse()
}
