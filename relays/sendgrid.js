var https = require('https');

var relay = function(req, res, next) {
	req.utf8Body = (new Buffer(req.body,'hex')).toString('utf-8');
	req.jsonBody = JSON.parse(req.utf8Body)

	req.sgString =	'to=' + encodeURIComponent(req.jsonBody.to) + '&' +
					((!!req.jsonBody.bcc) ? 'bcc=' + encodeURIComponent(req.jsonBody.bcc) + '&' : '') +
					'from=' + encodeURIComponent(req.jsonBody.from) + '&' +
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

	var sgReq = https.request(options, function(sgRes) {
		console.log('statusCode: ', sgRes.statusCode);
		console.log('headers: ', sgRes.headers);

		sgRes.on('data', function(d) {
			console.log("! " + d)
		})

		res.send('S')
	});

	sgReq.on('error', function(e) {
		console.log(e);
	});

	sgReq.write(req.sgString);
	sgReq.end();
};

module.exports = relay;
