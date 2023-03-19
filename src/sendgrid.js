var https = require('https');
var os = require("os");

var saveToDB = require("./db");

var relay = function(req, res, next) {
	req.utf8Body = (new Buffer(req.body,'hex')).toString('utf-8');
	req.jsonBody = JSON.parse(req.utf8Body)

	// inject the hostname of this server into the email headers
	req.jsonBody.headers = req.jsonBody.headers.replace(/}/,", \"X-CBI-Relay\" : \"" + os.hostname() + "\"}")

	var trackingId = null
	var instance = null

	try {
		const headersParsed = JSON.parse(req.jsonBody.headers)
		instance = headersParsed["X-CBI-Instance"]
		trackingId = headersParsed["X-CBI-Tracking-Id"]
		instance = headersParsed["X-CBI-Instance"]
		console.log("Found instance: ", instance)
		console.log("Found trackingId: ", trackingId)
	} catch (e) {
		console.log("Error trying to parse for trackingId")
	}

	req.sgString =	'to=' + encodeURIComponent(req.jsonBody.to) + '&' +
					((!!req.jsonBody.bcc) ? ('bcc=' + encodeURIComponent(req.jsonBody.bcc) + '&') : '') +
					'from=' + encodeURIComponent(req.jsonBody.from) + '&' +
					((!!req.jsonBody.fromName) ? ('fromname=' + encodeURIComponent(req.jsonBody.fromName) + '&') : '') +
					'subject=' + encodeURIComponent(req.jsonBody.subject) + '&' +
					'text=' + encodeURIComponent(req.jsonBody.text) + '&' +
					'html=' + encodeURIComponent(req.jsonBody.html) + '&' +
					'headers=' + encodeURIComponent(req.jsonBody.headers);

	var options = {
		hostname: req.config.sendgrid.host,
		path: req.config.sendgrid.path,
		method: 'POST',
		headers : {
			"Authorization" : req.config.sendgrid.authToken,
			"Content-Type" : "application/x-www-form-urlencoded; charset=utf-8",
			"Content-Length" : req.sgString.length,
			"Content-Encoding" : 'utf-8'
		}
	};

	console.log("About to send the following email to sendgrid: " + req.jsonBody.headers)

	new Promise(function(resolve, reject) {
		var sgReq = https.request(options, function(sgRes) {
			console.log('sendgrid statusCode: ', sgRes.statusCode);
			console.log('sendgrid headers: ', sgRes.headers);

			sgRes.on('data', function(d) {
				console.log("Response from sendgrid: " + d)
			})

			// Tell APEX we successfully sent the email to sendgrid
			res.send('S')
			resolve();
		});

		sgReq.on('error', function(e) {
			console.log(e);
			reject(e);
		})

		sgReq.write(req.sgString);
		sgReq.end();
	}).then(function() {
		return saveToDB(req.jsonBody, instance, trackingId);
	}).catch(function(err) {
		console.log("Promise caught an error: " + err)
	});
};

module.exports = relay;
