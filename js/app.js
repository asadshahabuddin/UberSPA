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
    /* Uber API Constants */
    var uberClientId = "EVYAt6HcmlxXyvp3m7FX4k5claG6Bqa",
        uberServerToken = "i62YyuNa-budKDytw1Le6HTQzt-p17kwG8ub0B72";

    /* Create variables to store latitude and longitude */
    var userLatitude   = 42.3344028,
        userLongitude  = -71.1009781,
        partyLatitude  = 42.3508452,
        partyLongitude = -71.1481954;

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
});
/* End of app.js */