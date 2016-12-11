var marker;
var infoWindow;
var markers = [];
var weather;
//initialization of locations array with the values of title and locationvalue and info
var locations = [{
    title: 'RANTHAMBORE NATIONAL PARK, RAJASTHAN',
    locationvalue: {
        lat: 26.047267,
        lng: 76.419024
    },
    info: 'Dotted with several lakes and rivers, the Ranthambore National Park' +
        ' lies at the junction of Aravali and Vindhyas in the state of Rajasthan.' +
        ' The undulating landscape dramatically changes from gentle to steep slopes.'
}, {
    title: ' JIM CORBETT NATIONAL PARK, UTTARAKHAND',
    locationvalue: {
        lat: 29.530014,
        lng: 78.774660
    },
    info: 'Famous as the oldest national park in India,' +
        ' it was established in 1936 in Uttarakhand as Hailey National Park to protect the endangered Bengal tiger.'
}, {
    title: ' BANDHAVGARH NATIONAL PARK, MADHYA PRADESH',
    locationvalue: {
        lat: 23.722454,
        lng: 81.024219
    },
    info: ' Known for its spectacular landscape enriched with green valleys and' +
        'rocky hill terrain, this park in Madhya Pradesh houses a wide array of wildlife' +
        'like sloth bears, deer, leopards, jackals and birds.'
}, {
    title: ' PERIYAR NATIONAL PARK, KERALA',
    locationvalue: {
        lat: 9.462155,
        lng: 77.236847
    },
    info: 'Situated in the lap of Western Ghats, it paints a beautiful picture ' +
        'with its picturesque lakes that are also a source of water for the local wildlife tour.'
}, {
    title: 'KAZIRANGA NATIONAL PARK, ASSAM',
    locationvalue: {
        lat: 26.525281,
        lng: 92.993808
    },
    info: 'An ideal habitat for the one-horned rhinoceros, this park is located on ' +
        'the banks of the mighty Brahmaputra River in Assam.'
}, {
    title: ' SUNDERBANS NATIONAL PARK, WEST BENGAL',
    locationvalue: {
        lat: 21.866981,
        lng: 88.891528
    },
    info: 'Sunderbans, world’s largest estuarine forest and delta is situated ' +
        'on the lower end of Gangetic West Bengal,here boats glide through creeks and' +
        ' rivulets, bordered with mangrove forests.'
}, {
    title: ' KANHA NATIONAL PARK, MADHYA PRADESH',
    locationvalue: {
        lat: 22.334513,
        lng: 80.611513
    },
    info: ' Located in Madhya Pradesh, this park is a popular tiger reserve adorned ' +
        'with captivating flora and fauna.'
}, {
    title: ' MUDUMALAI NATIONAL PARK, TAMIL NADU',
    locationvalue: {
        lat: 11.637592,
        lng: 76.525701
    },
    info: 'Mudumalai with its splendid location in the foothills of Nilgiri hills in Tamil Nadu' +
        ' paints a beautiful scenery.'
}, {
    title: 'GIR NATIONAL PARK',
    locationvalue: {
        lat: 21.124305,
        lng: 70.824151
    },
    info: 'Abode of the handsome Asiatic lions, this wildlife haven is located in Gujarat.'
}, {
    title: ' KEOLADEO NATIONAL PARK',
    locationvalue: {
        lat: 27.159269,
        lng: 77.523200
    },
    info: 'Home to over 230 species of birds, it is famously known as Bharatpur Bird Sanctuary.'
}];

var ViewModel = function() {
    var self = this;
    self.search = ko.observable('');
    self.listedlocations = ko.observableArray([]);

    // placing the each locationitem in the locationlist
    locations.forEach(function(locationitem) {
        self.listedlocations.push(new locationlist(locationitem));
    });
    //adding markers for the corresponding listedlocations
    self.listedlocations().forEach(function(locationlist) {

        var marker = new google.maps.Marker({
            map: map,
            position: locationlist.position(),
            title: locationlist.title(),
            animation: google.maps.Animation.DROP
        });

        markers.push(marker);
        locationlist.marker = marker;
        infoWindow = new google.maps.InfoWindow();
        // when we click on marker corresponding infowindow will be popup
        marker.addListener('click', function() {
            infoWindow.marker = marker;
            //code for the marker bounce when user click on the perticular location
            this.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 750);
            infoWindow.setContent('please wait loading');

            $.ajax({

                url: 'http://api.openweathermap.org/data/2.5/weather?q=' + locationlist.title() + '&lat=' + locationlist.lat() + '&lon=' + locationlist.lng() + '&APPID=302e5c9ce22283a076002344330d532b',
                dataType: "json",
                success: function(data) {
                    var temp_min = parseFloat(data.main.temp_min - 273).toFixed(2);
                    var temp_max = parseFloat(data.main.temp_max - 273).toFixed(2);
                    weather = '<p> Min Temprature: ' + temp_min + '&deg;C</p><p> Max Temperature: ' + temp_max + '&deg;C</p>';
                infoWindow.setContent('<p>' + locationlist.title() + '</p>' + '<h4>' + locationlist.info() + '</h4>' + weather);

                 infoWindow.open(map, marker);
                }, //gracefully displays error if at all foursquare doesnt repond.
                error: function() {
                    errormsg = '<div><p>Weather Could Not be Loaded</p></div>'
                      infoWindow.setContent('<p>' + locationlist.title() + '</p>' + '<h4>' + locationlist.info() + '</h4>' + errormsg);
               }
            });


            infoWindow.addListener('closeclick', function() {
                infoWindow.close();
            });
        });
    });
    //code for the filtering the location elements
    self.filter = ko.computed(function() {
        searchvalue = self.search().toLowerCase();
        if (!searchvalue) {
            self.listedlocations().forEach(function(locationlist) {

                locationlist.visibility(true);
                locationlist.marker.setVisible(true);
            });
        } else {
            self.listedlocations().forEach(function(locationlist) {

                if (locationlist.title().toLowerCase().indexOf(searchvalue) !== -1) {
                    locationlist.visibility(true);
                    locationlist.marker.setVisible(true);
                } else {
                    locationlist.visibility(false);
                    locationlist.marker.setMap(null);
                }
            });
        }
    });

    //function for the open window
    this.openInfo = function(locationlist) {
        infoWindow.close();
        google.maps.event.trigger(locationlist.marker, 'click');
        navigation.classList.remove('open');

    };

};
// Alert the user if google maps isn't working
mapError = function() {
    document.getElementById('map-error').innerHTML = "<h2>Google Maps is not loading. Please try refreshing the page later.</h2>";
};

var locationlist = function(locationitem) {
    var self = this;
    self.title = ko.observable(locationitem.title);
    self.info = ko.observable(locationitem.info);
    self.lat = ko.observable(locationitem.locationvalue.lat);
    self.lng = ko.observable(locationitem.locationvalue.lng);
    self.position = ko.observable(locationitem.locationvalue);
    self.visibility = ko.observable(true);
};

var initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 16.575967,
            lng: 79.3122402
        },
        zoom: 5
    });


    ko.applyBindings(new ViewModel());
};
var menu = document.querySelector('#menu');
var main = document.querySelector('main');
var navigation = document.querySelector('#navigation');

menu.addEventListener('click', function(e) {
    navigation.classList.toggle('open');
    e.stopPropagation();
});
main.addEventListener('click', function() {
    navigation.classList.remove('open');
});