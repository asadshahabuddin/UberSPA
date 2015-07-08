/*
    Author : Asad Shahabuddin
    File   : app.js
    Details: JS for 'UberSPA'.
    Email  : shahabuddin.a@husky.neu.edu
*/

/* ========================= */
/* UTILITY FUNCTIONS : BEGIN */
/* ========================= */
/* Output to console. */
var cout = function(obj, color, fontWeight)
{
    if(color === undefined)
    {
        color = "black";
    }
    if(fontWeight === undefined)
    {
        fontWeight = "normal";
    }
    console.log("%c" + obj, "color: " + color + "; font-family: Courier New; font-weight: " + fontWeight + ";")
};

/* Echo to console. */
var echo = function(obj)
{
    console.log("%c   [echo] " + obj, "font-family: Courier New;")
};

/* Output a warning to console. */
var warning = function(obj)
{
    console.log("%c[warning] " + obj, "color: yellow; font-family: Courier New;")
};

/* Output an error to console. */
var error = function(obj)
{
    console.log("%c  [error] " + obj, "color: red; font-family: Courier New;")
};
/* ======================= */
/* UTILITY FUNCTIONS : END */
/* ======================= */

var app = angular.module("UberSPApp", []);
cout(">Uber Surge Pricing application", "navy", "bold");

app.controller("UberSPController", function($scope, GlobalService, $q)
{
    echo("Inside the main controller");
    /* Constants */
    RADIUS = 0.003;

    /* Scope variables */
    $scope.primary         = false;
    $scope.secondary       = false;
    $scope.primaryPrices   = {};
    $scope.primaryTimes    = {};
    $scope.secondaryOrgns  = {};
    $scope.secondaryPrices = {};
    $scope.secondaryTimes  = {};

    /* Global variables */
    var map;
    var orgnCoords;
    var destCoords;
    var orgnMarker;
    var destMarker;
    var orgnOverlays = [];
    var destOverlays = [];
    var groupMap = {};
    var groupId;
    var groupCenter;
    var altOrgns = [];

    /* ============================= */
    /* GOOGLE MAPS FUNCTIONS : BEGIN */
    /* ============================= */

    /* Initialize Google Maps. */
    var initGoogleMaps = function()
    {
        echo("Setting up Google Maps");
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

        /* Try HTML5 geolocation. */
        if(navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(
            function(pos)
            {
                /* Success */
                currentPositionSuccessCallback(pos);
            },
            function()
            {
                /* Failure */
                currentPositionFailureCallback(true);
            });
        }
        else
        {
            /* Browser does not support geolocation */
            currentPositionFailureCallback(false);
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
        pick list. Retrieve the matching places for that item. */
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

        /* Get the origin address' co-ordinates, group number and overlay. */
        google.maps.event.addListener(orgnAddrBox, "places_changed", function()
        {
            var places = orgnAddrBox.getPlaces();
            if(places.length == 0)
            {
                return;
            }

            orgnCoords = places[0].geometry.location;
            if(orgnMarker != undefined)
            {
                orgnMarker.setMap(null);
            }

            /* Get the icon, place name and location. */
            var image = {
                url       : places[0].icon,
                size      : new google.maps.Size(71, 71),
                origin    : new google.maps.Point(0, 0),
                anchor    : new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            /* Create a marker for the place. */
            orgnMarker = new google.maps.Marker(
            {
                map     : map,
                icon    : image,
                title   : places[0].name,
                position: orgnCoords
            });
            /* Calculate the group information and draw an overlay on the map. */
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

    /* Callback to successful HTML5 geolocation. */
    var currentPositionSuccessCallback = function(pos)
    {
        var orgnLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        var infoWindow = new google.maps.InfoWindow(
        {
            map     : map,
            position: orgnLatLng,
            content : "You are here."
        });

        echo("Current position is (" + pos.coords.latitude + ", " + pos.coords.longitude + ")");
        map.setCenter(orgnLatLng);
        /* Set the origin address field. */
        GlobalService.reverseGeocode(orgnLatLng,
        function(res, status)
        {
            reverseGeocodeCallback(res, status, document.getElementById("orgn-addr"))
        });
    };

    /* Callback to failed HTML5 geolocation. */
    var currentPositionFailureCallback = function(err)
    {
        if(err)
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

    /* Callback to successful reverse geocoding. */
    var reverseGeocodeCallback = function(res, status, elem)
    {
        if(status = google.maps.GeocoderStatus.OK)
        {
            if(res[0])
            {
                cout("Current address>", "black", "bold");
                cout(res[0].formatted_address);
                elem.value = res[0].formatted_address;
            }
        }
    };

    /* Draw a rectangle using a pair of co-ordinates. */
    var drawRectangle = function(map, lat, lng, color)
    {
        return new google.maps.Rectangle(
        {
            strokeColor  : color,
            strokeOpacity: 0.25,
            strokeWeight : 0.25,
            fillColor    : color,
            fillOpacity  : 0.50,
            map          : map,
            bounds       : new google.maps.LatLngBounds(
                new google.maps.LatLng(lat - RADIUS, lng - RADIUS),
                new google.maps.LatLng(lat + RADIUS, lng + RADIUS))
        });
    };

    /* Draw rectangles using a set of co-ordinate pairs. */
    var drawRectangles = function(map, coords, color)
    {
        var overlays = [];
        for(var i = 0; i < coords.length; i++)
        {
            orgnOverlays.push(drawRectangle(map, coords[i][0], coords[i][1], color));
        }
        return overlays;
    };

    /* Create a map entry of the group id and it's corresponding co-ordinate pairs. */
    var createGroupMapEntry = function(city, gid)
    {
        var deferred = $q.defer();
        GlobalService.coords(city, gid, function(res)
        {
            groupMap[gid] = res[0].coords;
            deferred.resolve();
        });
        return deferred.promise;
    };

    /* Create a map of all the group ids and their corresponding co-ordinate pairs. */
    var createGroupMap = function(city)
    {
        var promises = [];
        cout("   Downloading group data...");

        GlobalService.groups(city, function(res)
        {
            for(i = 0; i < res.length; i++)
            {
                groupMap[res[i].gid] = [];
                promises.push(createGroupMapEntry(city, res[i].gid));
            }
            $q.all(promises).then(function(res)
            {
                cout("   Download complete.");
            });
        });
    };

    /* Calculate the group id and co-ordinates of its center. */
    var groupInfo = function(city, lat, lng)
    {
        for(var gid in groupMap)
        {
            var coords = groupMap[gid];
            for(var i = 0; i < coords.length; i++)
            {
                if(lat >= coords[i][0] - RADIUS &&
                   lat <= coords[i][0] + RADIUS &&
                   lng >= coords[i][1] - RADIUS &&
                   lng <= coords[i][1] + RADIUS)
                {
                    groupId     = gid;
                    groupCenter = coords;
                    return;
                }
            }
        }
    };

    /* Calculate the group number using the co-ordinates and draw and overlay on the map. */
    $scope.group = function(city, lat, lng)
    {
        echo("Calculating group information for the location (" + lat + ", " + lng + ")");
        /* Clear the previous overlays. */
        for(var i = 0; i < orgnOverlays.length; i++)
        {
            orgnOverlays[i].setMap(null);
        }
        orgnOverlays = [];
        
        /*
        (1) Calculate the group id and co-ordinates of its center.
        (2) Draw the group as an overlay on the map.
        */
        groupInfo(city, lat, lng);
        echo("Origin address belongs to group " + groupId);
        drawRectangles(map, groupCenter, "#0040FF");
    };

    /* Calculate the distnace matrix between the the two positions. */
    var distanceMatrix = function(orgnCoords, destCoords, time)
    {
        var deferred = $q.defer();

        GlobalService.distance(orgnCoords, destCoords, function(res, status)
        {
            if(status === google.maps.DistanceMatrixStatus.OK &&
               res.rows[0].elements[0].duration.value <= time)
            {
                altOrgns.push(destCoords);
                /*
                cout(res.originAddresses[0]                 + " to " +
                     res.destinationAddresses[0]            + " would take " +
                     res.rows[0].elements[0].duration.value + " seconds on foot.");
                */
            }
            deferred.resolve();
        });

        return deferred.promise;
    };

    /* Find alternative origin locations. */
    var findAltOrigins = function(time)
    {
        var deferred = $q.defer();
        var promises = [];

        for(var gid in groupMap)
        {
            var coords = groupMap[gid];
            for(var i = 0; i < coords.length; i++)
            {
                promises.push(distanceMatrix(orgnCoords,
                                             new google.maps.LatLng(coords[i][0], coords[i][1]),
                                             time));
            }
        }
        $q.all(promises).then(function(res)
        {
            deferred.resolve();
            cout("\nAlternative origins>", "black", "bold");
            console.log(altOrgns);
        });

        return deferred.promise;
    };

    /* Calculate the distance between two co-ordinate pairs. */
    var dist = function(x1, y1, x2, y2)
    {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    /* =========================== */
    /* GOOGLE MAPS FUNCTIONS : END */
    /* =========================== */

    /* ====================== */
    /* UBER FUNCTIONS : BEGIN */
    /* ====================== */
    
    /* Query Uber to retrieve price estimates for the primary origin. */
    var uberPrimaryPriceEstimates = function(orgnCoords, destCoords, carType)
    {
        var deferred = $q.defer();
        $scope.primaryPrices = {};
        echo("Querying Uber for prices");

        GlobalService.uberPriceEstimates(orgnCoords, destCoords, function(res)
        {
            cout("\nPrice estimates>", "black", "bold");
            console.log(res.prices);
            $scope.primary = true;

            /* Update the AngularJS scope variable and apply the scope. */
            for(var i = 0; i < res.prices.length; i++)
            {
                if(res.prices[i].display_name.toLowerCase() === carType.toLowerCase())
                {
                    $scope.primaryPrices[res.prices[i].product_id] = res.prices[i];
                    break;
                }
            }
            $scope.$apply();
            deferred.resolve();
        });

        return deferred.promise;
    };

    /* Query Uber to retrieve ETAs for the primary origin. */
    var uberPrimaryTimeEstimates = function(orgnCoords, carType)
    {
        $scope.primaryTimes = {};
        var deferred = $q.defer();
        echo("Querying Uber for ETAs");

        GlobalService.uberTimeEstimates(orgnCoords, function(res)
        {
            cout("\nTime estimates>", "black", "bold");
            console.log(res.times);
            for(var i = 0; i < res.times.length; i++)
            {
                if(res.times[i].display_name.toLowerCase() === carType.toLowerCase())
                {
                    $scope.primaryTimes[res.times[i].product_id] = res.times[i].estimate;
                    break;
                }
            }
            $scope.$apply();
            deferred.resolve();
        });

        return deferred.promise;
    };

    /* Query Uber to retrieve price estimates for the secondary origin. */
    var uberSecondaryPriceEstimates = function(orgnCoords, destCoords, carType)
    {
        $scope.secondaryPrices = {};
        var deferred = $q.defer()
        var orgnAddress = "";
        var key = orgnCoords.A + "" + orgnCoords.F;
        echo("Querying Uber for prices");

        /* Determine the origin address. */
        GlobalService.reverseGeocode(orgnCoords, function(res, status)
        {
            orgnAddress = res[0].formatted_address;
        });
        /* Calculate the price estimates */
        GlobalService.uberPriceEstimates(orgnCoords, destCoords, function(res)
        {
            /* Update the AngularJS scope variable and apply the scope. */
            for(var i = 0; i < res.prices.length; i++)
            {
                if(res.prices[i].display_name.toLowerCase() === carType.toLowerCase() &&
                   res.prices[i].low_estimate < $scope.primaryPrices[res.prices[i].product_id].high_estimate)
                {
                    $scope.secondary = true;
                    if($scope.secondaryPrices[key] === undefined)
                    {
                        $scope.secondaryPrices[key] = {};
                        $scope.secondaryPrices[key].orgn = orgnAddress;
                        $scope.secondaryPrices[key].prices = [];
                    }
                    $scope.secondaryPrices[key].prices.push(res.prices[i]);
                }
            }
            $scope.$apply();
            deferred.resolve();
        });

        return deferred.promise;
    };

    /* Find all the Uber options from the source to the destination. */
    $scope.findUber = function(carType)
    {
        var promises = [];
        
        promises.push(uberPrimaryPriceEstimates(orgnCoords, destCoords, carType));
        promises.push(uberPrimaryTimeEstimates(orgnCoords, carType));
        $q.all(promises).then(function(res)
        {   
            return findAltOrigins(2000);
        }).then(function()
        {
            promises = [];
            for(var i = 0; i < altOrgns.length; i++)
            {
                promises.push(uberSecondaryPriceEstimates(altOrgns[i], destCoords, carType));
            }
            $q.all(promises).then(function(res)
            {
                cout("\nAlternative prices>", "black", "bold");
                console.log($scope.secondaryPrices);
            });
        });
    };

    /* Format the 'car type' field. */
    $scope.formatCarType = function(carType)
    {
        return carType.charAt(0).toUpperCase() + carType.slice(1);
    };

    /* ==================== */
    /* UBER FUNCTIONS : END */
    /* ==================== */

    /* Main */
    google.maps.event.addDomListener(window, "load", initGoogleMaps);
    createGroupMap("nyc");
});
/* End of app.js */