/*
    Author : Asad Shahabuddin
    File   : app.js
    Details: JS for 'UberSPA'.
    Email  : shahabuddin.a@husky.neu.edu
*/

var app = angular.module("UberSPApp", []);
console.log("%c>Uber Surge Pricing application",
            "color: navy; font-family: Courier New; font-weight: bold");

app.controller("UberSPController", function($q, $scope, $http)
{
    /* Google Maps constants */
    var map;
    var orgnLatLng;
    var orgnCoords;
    var destCoords;
    /* Uber API Constants */
    var uberClientId    = "EVYAt6HcmlxXyvp3m7FX4k5claG6Bqa",
        uberServerToken = "i62YyuNa-budKDytw1Le6HTQzt-p17kwG8ub0B72";

    /* ============================= */
    /* GOOGLE MAPS FUNCTIONS : BEGIN */
    /* ============================= */

    /* Initialize Google Maps */
    function initGoogleMaps()
    {
        var markers = [];
        var mapOptions = {
            mapTypeControl          : true,
            mapTypeControlOptions   : {
                style   : google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            },
            mapTypeId               : google.maps.MapTypeId.ROADMAP,
            streetViewControl       : true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            zoom                    : 15,
            zoomControl             : true,
            zoomControlOptions      : {
                position: google.maps.ControlPosition.LEFT_CENTER,
                style   : google.maps.ZoomControlStyle.LARGE
            }
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        /* Try HTML5 geolocation */
        if(navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(function(pos)
            {
                orgnCoords = pos.coords;
                orgnLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                var infoWindow = new google.maps.InfoWindow(
                {
                    map     : map,
                    position: orgnLatLng,
                    content : "You are here."
                });

                console.log("%c   [echo] Current position is (" + pos.coords.latitude +
                                            ", " + pos.coords.longitude + ")",
                                            "font-family: Courier New;");
                map.setCenter(orgnLatLng);
                reverseGeocode(orgnLatLng, document.getElementById("orgn-addr"));  /* Set the origin address field */
            },
            function()
            {
                handleNoGeolocation(true);
            });
        }
        else
        {
            /* Browser does not support geolocation */
            handleNoGeolocation(false);
        }

        /* Create search fields and link them to the UI element */
        var input = /** @type {HTMLInputElement} */(document.getElementById("pac-input"));
        var orgnAddrInput = /** @type {HTMLInputElement} */(document.getElementById("orgn-addr"));
        var destAddrInput = /** @type {HTMLInputElement} */(document.getElementById("dest-addr"));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var searchBox = new google.maps.places.SearchBox(/** @type {HTMLInputElement} */(input));
        var orgnAddrBox = new google.maps.places.SearchBox(/** @type {HTMLInputElement} */(orgnAddrInput));
        var destAddrBox = new google.maps.places.SearchBox(/** @type {HTMLInputElement} */(destAddrInput));

        /* Listen for the event fired when the user selects an item from the
        pick list. Retrieve the matching places for that item */
        google.maps.event.addListener(searchBox, "places_changed", function()
        {
            var places = searchBox.getPlaces();
            if(places.length == 0)
            {
                return;
            }

            for(var i = 0, marker; marker = markers[i]; i++)
            {
                marker.setMap(null);
            }

            /* For each place, get the icon, place name and location */
            markers = [];
            var bounds = new google.maps.LatLngBounds();
            for(var i = 0, place; place = places[i]; i++)
            {
                var image = {
                    url       : place.icon,
                    size      : new google.maps.Size(71, 71),
                    origin    : new google.maps.Point(0, 0),
                    anchor    : new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                /* Create a marker for each place */
                var marker = new google.maps.Marker(
                {
                    map     : map,
                    icon    : image,
                    title   : place.name,
                    position: place.geometry.location
                });

                markers.push(marker);
                bounds.extend(place.geometry.location);
            }
            map.fitBounds(bounds);
        });

        google.maps.event.addListener(destAddrBox, "places_changed", function()
        {
            var places = destAddrBox.getPlaces();
            if(places.length == 0)
            {
                return;
            }
            destCoords = places[0].geometry.location;
        });


        /* Bias the search boxes' results towards places that are within the bounds
        of the current map's viewport */
        google.maps.event.addListener(map, "bounds_changed", function()
        {
            searchBox.setBounds(map.getBounds());
            orgnAddrBox.setBounds(map.getBounds());
            destAddrBox.setBounds(map.getBounds());
        });
    };

    /* Handle the lack of geolocation support */
    function handleNoGeolocation(errFlag)
    {
        if(errFlag)
        {
            var content = "ERROR: The Geolocation service failed.";
        }
        else
        {
            var content = "ERROR: Your browser does not support Geolocation.";
        }

        var mapOptions = {
            map     : map,
            position: new google.maps.LatLng(42.3344028, -71.1009781),
            content : content
        };
        var infoWindow = new google.maps.InfoWindow(mapOptions);
        map.setCenter(macpOptions.position);
    };

    /* Reverse geocoding to a formatted address */
    function reverseGeocode(latlng, elem)
    {
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({"latLng": latlng}, function(res, status)
        {
            if(status = google.maps.GeocoderStatus.OK)
            {
                if(res[0])
                {
                    console.log("%cCurrent address>",
                                "font-family: Courier New; font-weight: bold;");
                    console.log("%c" + res[0].formatted_address,
                                "font-family: Courier New; font-weight: bold;");
                    elem.value = res[0].formatted_address;
                }
            }
        });
    };

    /* =========================== */
    /* GOOGLE MAPS FUNCTIONS : END */
    /* =========================== */

    /* ====================== */
    /* UBER FUNCTIONS : BEGIN */
    /* ====================== */

    /* Query Uber to retrieve pricing options */
    $scope.uberPrices = [];
    function queryUber(orgnLat, orgnLng, destLat, destLng)
    {
        $.ajax(
        {
            url: "https://api.uber.com/v1/estimates/price",
            headers:
            {
                Authorization: "Token " + uberServerToken
            },
            data:
            {
                start_latitude : orgnLat,
                start_longitude: orgnLng,
                end_latitude   : destLat,
                end_longitude  : destLng
            },
            success: function(res)
            {
                console.log("%cUber prices>",
                            "font-family: Courier New; font-weight: bold;");
                console.log(res.prices);
                /* Update the AngularJS scope variable and apply the scope */
                $scope.uberPrices = res.prices;
                $scope.$apply();
            }
        });
    };

    /* ==================== */
    /* UBER FUNCTIONS : END */
    /* ==================== */

    $scope.findUber = function()
    {
        queryUber(orgnCoords.latitude, orgnCoords.longitude, destCoords.A, destCoords.F);
    };

    $scope.formatCarType = function(carType)
    {
        return carType.charAt(0).toUpperCase() + carType.slice(1);
    };

    /* Main */
    google.maps.event.addDomListener(window, "load", initGoogleMaps);
});
/* End of app.js */