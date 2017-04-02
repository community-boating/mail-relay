#!/usr/bin/env nodejs
var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var ini = require('ini')

var sendgrid = require('./relays/sendgrid')

var app = express();
var config = ini.parse(fs.readFileSync('./private.ini', 'utf-8'))

// validate legit request
app.use(function(req, res, next) {
	if (req.method != 'POST' || req.path != '/relay') res.end();					// only accept POSTs going to /relay
	else if (!req.headers['cbi-auth']) res.end();									// cbi-auth header exists?
	else if (req.headers['cbi-auth'] != config.general.cbiAuthToken) res.end();		// cbi-auth header is correct?
	else next();
});

app.use(function(req, res, next) { req.config = config;  next(); })	// attach config

app.use(bodyParser.text());

app.post('/relay', sendgrid);

app.listen(8080, function() {
	console.log('Mail relay listening on port 8080');
});
