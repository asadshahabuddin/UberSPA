/*
    Author : Asad Shahabuddin
    File   : service.js
    Details: REST Service for the Uber Surge Pricing application.
    Email  : shahabuddin.a@husky.neu.edu
*/

app.factory("GlobalService", function GlobalService($http)
{
	/* Constants */
	UBER_CLIENT_ID    = "EVYAt6HcmlxXyvp3m7FX4k5claG6Bqa";
    UBER_SERVER_TOKEN = "i62YyuNa-budKDytw1Le6HTQzt-p17kwG8ub0B72";

	/* Geocode the formatted address to an equivalent co-ordinate pair. */
    function geocode(address, callback)
    {
        new google.maps.Geocoder().geocode({"address": address},
    	callback);
    };

    /* Reverse geocoding to a formatted address. */
    function reverseGeocode(latlng, callback)
    {
    	new google.maps.Geocoder().geocode({"latLng": latlng},
		callback);
    };

    /* Use HTML5 geolocation to get the current location. */
    function currentPosition(successCallback, failureCallback)
    {
    	navigator.geolocation.getCurrentPosition(
		successCallback, failureCallback);
    };

	/* Get the distance matrix for a pair of locations. */
    var distance = function(orgn, dest, callback)
    {
        new google.maps.DistanceMatrixService().getDistanceMatrix(
        {
            origins     : [orgn],
            destinations: [dest],
            travelMode  : google.maps.TravelMode.WALKING,
            unitSystem  : google.maps.UnitSystem.METRIC
        }, callback);
    };

    /* Query Uber to retrieve price estimates. */
    var uberPriceEstimates = function(orgnCoords, destCoords, callback)
    {
        $.ajax(
        {
            url: "https://api.uber.com/v1/estimates/price",
            headers:
            {
                Authorization: "Token " + UBER_SERVER_TOKEN
            },
            data:
            {
                start_latitude : orgnCoords.A,
                start_longitude: orgnCoords.F,
                end_latitude   : destCoords.A,
                end_longitude  : destCoords.F
            },
            success: callback
        });
    };

    /* Query Uber to retrieve ETAs. */
    var uberTimeEstimates = function(orgnCoords, callback)
    {
    	$.ajax(
        {
            url: "https://api.uber.com/v1/estimates/time",
            headers:
            {
                Authorization: "Token " + UBER_SERVER_TOKEN
            },
            data:
            {
                start_latitude : orgnCoords.A,
                start_longitude: orgnCoords.F
            },
            success: callback
        });
    };

    /* Get the list of groups for the city. */
    var groups = function(city, callback)
    {
        $http.get("/api/" + city + "/groups")
        .success(callback);
    };

    /* Get the set of co-ordinate pairs for the group id in the city. */
    var coords = function(city, gid, callback)
    {
        $http.get("/api/" + city + "/group/" + gid + "/coords")
        .success(callback);
    };

    return {
    	geocode           : geocode,
    	reverseGeocode    : reverseGeocode,
    	currentPosition   : currentPosition,
        distance          : distance,
        uberPriceEstimates: uberPriceEstimates,
        uberTimeEstimates : uberTimeEstimates,
        groups            : groups,
        coords            : coords
    };
});
/* End of service.js */