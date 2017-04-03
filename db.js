var mysql = require("mysql");
var fs = require('fs')
var ini = require('ini')

var dbCredentials = ini.parse(fs.readFileSync('./private.ini', 'utf-8')).mysql;

module.exports = function(email) {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(dbCredentials);
		connection.query(
			"Insert into email_log set email_to = ?, email_from = ?, subject = ?, plain_body = ?, html_body = ?, headers = ?, bcc = ?, from_name = ?, sent_date = ?",
			[email.to, email.from, email.subject, email.text, email.html, email.headers, email.bcc, email.fromName, (new Date())],
			function(err, results) {
				connection.end();
				if (err) reject(err);
				else resolve();
			}
		)
	});
}
