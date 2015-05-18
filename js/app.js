/*
    Author : Asad Shahabuddin
    File   : app.js
    Details: JS for 'UberSPA'.
    Email  : shahabuddin.a@husky.neu.edu
*/

var app = angular.module("UberSPApp", []);
console.log("%c>Uber Surge Pricing application",
            "color: navy; font-family: Courier New; font-weight: bold");

app.controller("UberSPController", function($scope, $http)
{
    /* =================== */
    /* GOOGLE MAPS : BEGIN */
    /* =================== */

    var map;

    function initalize()
    {
        var markers = [];
        var mapOptions = {
            center   : new google.maps.LatLng(42.3344028, -71.1009781),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom     : 15
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        /* Create a search field and link it to the UI element */
        var input = /** @type {HTMLInputElement} */(document.getElementById("pac-input"));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var searchBox = new google.maps.places.SearchBox(/** @type {HTMLInputElement} */(input));

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

        /* Bias the search box results towards places that are within the bounds
        of the current map's viewport */
        google.maps.event.addListener(map, "bounds_changed", function()
        {
            var bounds = map.getBounds();
            searchBox.setBounds(bounds);
        });
    };

    google.maps.event.addDomListener(window, "load", initalize);

    /* ================= */
    /* GOOGLE MAPS : END */
    /* ================= */

    /* ============ */
    /* UBER : BEGIN */
    /* ============ */

    /* Uber API Constants */
    // var uberClientId = "EVYAt6HcmlxXyvp3m7FX4k5claG6Bqa",
    //     uberServerToken = "i62YyuNa-budKDytw1Le6HTQzt-p17kwG8ub0B72";

    /* Create variables to store latitude and longitude */
    // var userLatitude   = 42.3344028,
    //     userLongitude  = -71.1009781,
    //     partyLatitude  = 42.3508452,
    //     partyLongitude = -71.1481954;

    /*
    $.ajax(
    {
        url: "https://api.uber.com/v1/estimates/price",
        headers:
        {
            Authorization: "Token "  + uberServerToken
        },
        data:
        {
            start_latitude: userLatitude,
            start_longitude: userLongitude,
            end_latitude: partyLatitude,
            end_longitude: partyLongitude
        },
        success: function(res)
        {
            console.log(res);
        }
    });
    */

    /* ========== */
    /* UBER : END */
    /* ========== */
});
/* End of app.js */