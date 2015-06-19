/*
    Author : Asad Shahabuddin
    File   : app.js
    Details: JS for 'UberSPA'.
    Email  : shahabuddin.a@husky.neu.edu
*/

var app = angular.module("UberSPApp", []);
console.log("%c>Uber Surge Pricing application",
            "color: navy; font-family: Courier New; font-weight: bold");

app.controller("UberSPController", function($scope, GlobalService, $q)
{
    console.log("%c   [echo] Inside the main controller",
                "font-family: Courier New;");

    /* Constants */
    RADIUS = 0.003;
    var uberClientId    = "EVYAt6HcmlxXyvp3m7FX4k5claG6Bqa",
        uberServerToken = "i62YyuNa-budKDytw1Le6HTQzt-p17kwG8ub0B72";

    var map;
    var orgnLatLng;
    var orgnCoords;
    var destCoords;

    /* ============================= */
    /* GOOGLE MAPS FUNCTIONS : BEGIN */
    /* ============================= */

    /* Initialize Google Maps */
    function initGoogleMaps()
    {
        console.log("%c   [echo] Setting up Google Maps",
                    "font-family: Courier New;");
        var markers = [];
        var mapOptions = {
            mapTypeControl          : true,
            mapTypeControlOptions   : {
                style   : google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            },
            mapTypeId               : google.maps.MapTypeId.TERRAIN,
            streetViewControl       : true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            zoom                    : 11,
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
                // orgnCoords = pos.coords;
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

        /* Get the origin address' co-ordinates and group number. */
        google.maps.event.addListener(orgnAddrBox, "places_changed", function()
        {
            var places = orgnAddrBox.getPlaces();
            if(places.length == 0)
            {
                return;
            }
            orgnCoords = places[0].geometry.location;
            $scope.group("nyc", orgnCoords.A, orgnCoords.F);
        });        

        /* Get the destination address' co-ordinates and group number. */
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
        of the current map's viewport. */
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
            // var content = "ERROR: The Geolocation service failed.";
            var content = "The City of New York."
        }
        else
        {
            var content = "ERROR: Your browser does not support Geolocation.";
        }

        var mapOptions = {
            content : content,
            map     : map,
            position: new google.maps.LatLng(40.7962998, -73.9210438)
        };
        var infoWindow = new google.maps.InfoWindow(mapOptions);
        map.setCenter(mapOptions.position);
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

    /* Draw a rectangle using a pair of co-ordinates. */
    function drawRectangle(map, lat, lng, color)
    {
        new google.maps.Rectangle(
        {
            strokeColor  : color,
            strokeOpacity: 0,
            strokeWeight : 0,
            fillColor    : color,
            fillOpacity  : 0.25,
            map          : map,
            bounds       : new google.maps.LatLngBounds(
                new google.maps.LatLng(lat - RADIUS, lng - RADIUS),
                new google.maps.LatLng(lat + RADIUS, lng + RADIUS))
        });
    };

    /* Draw rectangles using a set of co-ordinate pairs. */
    function drawRectangles(map, coords, color)
    {
        for(var i = 0; i < coords.length; i++)
        {
            drawRectangle(map, coords[i][0], coords[i][1], color);
        }
    };

    /* Calculate the group number using the co-ordinates. */
    $scope.group = function(city, lat, lng)
    {
        console.log("%c   [echo] Calculating group information for the location (" +
                    lat + ", " + lng + ")",
                    "font-family: Courier New;");
        GlobalService.groups(city, function(res1)
        {
            /*
            console.log("%cGroups>",
                        "font-family: Courier New; font-weight: bold;");
            console.log(res1);
            */

            for(var i = 0; i < res1.length; i++)
            {
                GlobalService.coords(city, res1[i].gid, function(res2)
                {
                    for(var j = 0; j < res2[0].coords.length; j++)
                    {
                        if(lat >= res2[0].coords[j][0] - RADIUS &&
                           lat <= res2[0].coords[j][0] + RADIUS &&
                           lng >= res2[0].coords[j][1] - RADIUS &&
                           lng <= res2[0].coords[j][1] + RADIUS)
                        {
                            console.log("%c   [echo] Origin address belongs to group " + res2[0].gid,
                                        "font-family: Courier New;");
                            drawRectangles(map, res2[0].coords, "#FF0000");
                            break;
                        }
                    }
                });
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
        console.log("%c   [echo] Querying Uber based on the selected source and destination",
                    "font-family: Courier New;");
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
        queryUber(orgnCoords.A, orgnCoords.F, destCoords.A, destCoords.F);
    };

    $scope.formatCarType = function(carType)
    {
        return carType.charAt(0).toUpperCase() + carType.slice(1);
    };

    /* Main */
    google.maps.event.addDomListener(window, "load", initGoogleMaps);
});
/* End of app.js */