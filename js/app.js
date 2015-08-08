/*
    Author : Asad Shahabuddin
    Created: Aug 7, 2015
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

/* Sleep for the specied number of milliseconds. */
var sleep = function(milliseconds)
{
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++)
    {
        if((new Date().getTime() - start) > milliseconds)
        {
            break;
        }
    }
};
/* ======================= */
/* UTILITY FUNCTIONS : END */
/* ======================= */

var app = angular.module("UberSPApp", ["ngRoute"]);
cout(">Uber Surge Pricing application", "navy", "bold");

app.config(function($routeProvider)
{
    $routeProvider
    .when("/",
    {
        templateUrl: "html/welcome.html"
    })
    .when("/boston",
    {
        templateUrl: "html/boston.html",
        controller : "BostonCtrl"
    })
    .when("/chicago",
    {
        templateUrl: "html/chicago.html",
        controller : "ChicagoCtrl"
    })
    .when("/dc",
    {
        templateUrl: "html/dc.html",
        controller : "DCCtrl"
    })
    .when("/la",
    {
        templateUrl: "html/la.html",
        controller : "LACtrl"
    })
    .when("/london",
    {
        templateUrl: "html/london.html",
        controller : "LondonCtrl"
    })
    .when("/miami",
    {
        templateUrl: "html/miami.html",
        controller : "MiamiCtrl"
    })
    .when("/nyc",
    {
        templateUrl: "html/nyc.html",
        controller : "NYCCtrl"
    })
    .when("/paris",
    {
        templateUrl: "html/paris.html",
        controller : "ParisCtrl"
    })
    .when("/seattle",
    {
        templateUrl: "html/seattle.html",
        controller : "SeattleCtrl"
    });
});
/* End of app.js */