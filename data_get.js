function openAQ_Locations(lat, lng, callback) {
    var xml = new XMLHttpRequest();
    var base_url = 'https://api.openaq.org/v1/locations?';
    base_url += 'coordinates=' + lat + ',' + lng;
    base_url += '&' + 'nearest=' + 5;
    console.log("Accessing: " + base_url);
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            callback(xml.responseText)
        }
    };
    xml.open('GET', base_url, true);
    xml.send(null);
}

function getLocations(responseText) {
    // Convert text into JSON object
    var response = JSON.parse(responseText);
    if (response == null) {
        return null;
    }

    test = document.getElementById('test')

    var results = response.results;
    var mark;
    var pos;
    for (var i=0; i < results.length; i++) {
        pos = {lat : results[i].coordinates.latitude, lng : results[i].coordinates.longitude};
        mark = new google.maps.Marker( {
            position : pos,
            map : map
        });
    }
}

openAQ_Locations(37.762,-122.271, getLocations);
