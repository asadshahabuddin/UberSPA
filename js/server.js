/*
    Author: Asad Shahabuddin
    File: server.js
    Details: Configuration script for uberspa-farpoint.
    Email ID: shahabuddin.a@husky.neu.edu
*/

var express    = require("express");
var bodyParser = require("body-parser");
var multer     = require("multer");
var app        = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

/* Set the environment variables we need */
var ip      = process.env.OPENSHIFT_NODEJS_IP      || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT    || 3000;

app.listen(port, ip);