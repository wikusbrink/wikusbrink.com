
function serviceStoreQueue(){
    if(storeQueue.length > 0 && !saving){
        setSaving(true);
        var date = storeQueue.pop()
        var datum = {
            date: date,
            data: data[date]
        }
        var retries = 0;

        function success(){
            setSaving(false);
            serviceStoreQueue();
        }
        function failure(){
            if(retries < 10) {
                retries++;
                setSaving(undefined);
                putDatum(datum, success, failure);
            }
        }
        putDatum(datum, success, failure);
    }
}

function setSaving(state){
    saving = state;
    if(saving === undefined){
        bg.style('fill', 'rgba(255, 50, 50, 0.5)');
    } else if(state){
        bg.style('fill', 'rgba(50, 50, 200, 0.2)');
    } else {
        bg.style('fill', 'rgba(100, 100, 100, 0.1)');
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

function putDatum(datum, callback, errorCallback) {
    var xmlHttp = new XMLHttpRequest();
    var url = apiUrlBase + '/api/lifestyle/' + datum.date;
    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback();
        }
    };
    xmlHttp.onerror = function() {
        errorCallback();
    }
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
