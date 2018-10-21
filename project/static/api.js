
function serviceStoreQueue(){
    if(storeQueue.length > 0 && !saving){
        setSaving(true);
        var date = storeQueue.pop()
        var datum = {
            date: date,
            data: data[date]
        }
        putDatum(datum, function(){
            setSaving(false);
            serviceStoreQueue();
        })
    }
}

function setSaving(state){
    saving = state;
    if(state){
        bg.style('fill', 'rgba(50, 50, 200, 0.1)')
    } else {
        bg.style('fill', 'rgba(100, 100, 100, 0.1)')
    }
}

function addToStoreQueue(date){
    storeQueue.push(date)
    storeQueue = _.uniq(storeQueue)
    serviceStoreQueue()
}

function getData(callback) {
    var xmlHttp = new XMLHttpRequest();
    var url = apiUrlBase + '/api/lifestyle/';
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
    var url = apiUrlBase + '/api/lifestyle/' + datum.date;
        xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback();
        }
    };
    xmlHttp.open("PUT", url, "/json-handler");
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify(datum));
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
