/*
    Author : Asad Shahabuddin
    Created: May 21, 2015
    Email  : shahabuddin.a@husky.neu.edu
*/

/**
 * (1) Data has been moved to data.txt.
 */

var express    = require("express");
var bodyParser = require("body-parser");
var multer     = require("multer");
var mongoose   = require("mongoose");
var app        = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

/* Set the environment variables we need. */
var ip      = process.env.OPENSHIFT_NODEJS_IP      || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT    || 3000;
var connStr = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/cs8674';

/* Connect to MongoDB instance. */
var db = mongoose.connect(connStr);

/* Author information */
var author = {
    fnm  : "Asad",
    lnm  : "Shahabuddin",
    alias: "Leo",
    email1: "asad808@ccs.neu.edu",
    email2: "shahabuddin.a@husky.neu.edu",
    url   : "http://net4.ccs.neu.edu/home/asad808/",
    city  : "Boston",
    state : "MA"
};

/* ======================== */
/* CITY COLLECTIONS : BEGIN */
/* ======================== */

/* Enforce schema */
var BostonSchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "boston"});

var ChicagoSchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "chicago"});

var DCSchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "washingtondc"});

var LASchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "losangeles"});

var LondonSchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "london"});

var MiamiSchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "miami"});

var NYCSchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "newyorkcity"});

var ParisSchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "paris"});

var SeattleSchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "seattle"});

var SFSchema = new mongoose.Schema({
    gid   : String,
    coords: []
}, {collection: "sanfrancisco"});

/* Model */
var BostonModel  = mongoose.model("BostonModel" , BostonSchema);
var ChicagoModel = mongoose.model("ChicagoModel", ChicagoSchema);
var DCModel      = mongoose.model("DCModel"     , DCSchema);
var LAModel      = mongoose.model("LAModel"     , LASchema);
var LondonModel  = mongoose.model("LondonModel" , LondonSchema);
var MiamiModel   = mongoose.model("MiamiModel"  , MiamiSchema);
var NYCModel     = mongoose.model("NYCModel"    , NYCSchema);
var ParisModel   = mongoose.model("ParisModel"  , ParisSchema);
var SeattleModel = mongoose.model("SeattleModel", SeattleSchema);
var SFModel      = mongoose.model("SFModel"     , SFSchema);

/* ====================== */
/* CITY COLLECTIONS : END */
/* ====================== */

/* ===================== */
/* GET LISTENERS : BEGIN */
/* ===================== */

/* Easter egg */
app.get("/asciimo", function(req, res)
{
    var link = "http://i.imgur.com/kmbjB.png";
    res.send("<html><body><img src='" + link + "'></body></html>");
});

/* API summary */
app.get("/api", function(req, res)
{
    res.send(
        "<body style='font-family: Arial;'>" + 
            "<h1>Farpoint</h1>" +
            "<p style='font-size: 18px;'>Uber Surge Pricing Application (SPA) API</p>" +
        "</body>");
});

/* Author information */
app.get("/api/author", function(req, res)
{
    res.json(author);
});

/* Get the group numbers for Boston. */
app.get("/api/boston/groups", function(req, res)
{
    BostonModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* Get the group numbers for Chicago. */
app.get("/api/chicago/groups", function(req, res)
{
    ChicagoModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* Get the group numbers for Washington, D.C. */
app.get("/api/dc/groups", function(req, res)
{
    DCModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* Get the group numbers for Los Angeles. */
app.get("/api/la/groups", function(req, res)
{
    LAModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* Get the group numbers for London. */
app.get("/api/london/groups", function(req, res)
{
    LondonModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* Get the group numbers for Miami. */
app.get("/api/miami/groups", function(req, res)
{
    MiamiModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* Get the groups numbers for New York City. */
app.get("/api/nyc/groups", function(req, res)
{
    NYCModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* Get the group numbers for Paris. */
app.get("/api/paris/groups", function(req, res)
{
    ParisModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* Get the group numbers for Seattle. */
app.get("/api/seattle/groups", function(req, res)
{
    SeattleModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* Get the group numbers for San Francisco. */
app.get("/api/sf/groups", function(req, res)
{
    SFModel.find({}, {gid: 1}, function(err, data)
    {
        res.json(data);
    });
});

/* The set of co-ordinate pairs for the group - Boston. */
app.get("/api/boston/group/:gid/coords", function(req, res)
{
    BostonModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* The set of co-ordinate pairs for the group - Chicago. */
app.get("/api/chicago/group/:gid/coords", function(req, res)
{
    ChicagoModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* The set of co-ordinate pairs for the group - Washington, D.C. */
app.get("/api/dc/group/:gid/coords", function(req, res)
{
    DCModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* The set of co-ordinate pairs for the group - Los Angeles. */
app.get("/api/la/group/:gid/coords", function(req, res)
{
    LAModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* The set of co-ordinate pairs for the group - London. */
app.get("/api/london/group/:gid/coords", function(req, res)
{
    LondonModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* The set of co-ordinate pairs for the group - Miami. */
app.get("/api/miami/group/:gid/coords", function(req, res)
{
    MiamiModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* The set of co-ordinate pairs for the group - New York City. */
app.get("/api/nyc/group/:gid/coords", function(req, res)
{
    NYCModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* The set of co-ordinate pairs for the group - Paris. */
app.get("/api/paris/group/:gid/coords", function(req, res)
{
    ParisModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* The set of co-ordinate pairs for the group - Seattle. */
app.get("/api/seattle/group/:gid/coords", function(req, res)
{
    SeattleModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* The set of co-ordinate pairs for the group - San Francisco. */
app.get("/api/sf/group/:gid/coords", function(req, res)
{
    SFModel.find({gid: req.params.gid}, function(err, doc)
    {
        res.json(doc);
    });
});

/* =================== */
/* GET LISTENERS : END */
/* =================== */

/* Main */
app.listen(port, ip);

/* End of server.js */