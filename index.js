var request = require('request')
	, jsdom = require('jsdom')
	, fs = require('fs')
	, url = require('url');

module.exports.search = function(input, marker, callback){
	var pagination = {};
	if (marker === 'false') { marker = 1; pagination.prev = false; }
	else pagination.prev = marker - 1;
	var search = {
		search: input
		, pages: marker
		, page: 'torrents'
		, active: 1
	};
	request({url: 'http://linuxtracker.org/index.php', qs: search}, function(error, response, body) {
		if (error) return callback(error);
		jsdom.env({
			html: body,
			scripts: ['./node_modules/jquery/tmp/jquery.js']
		}, function(err, window){
			var $ = window.jQuery;
			var results = [];
			$.each($('img'), function(index,value) {
				if ($(value).attr('src') === 'images/download.gif') {
					var item = $(value);
					results.push({
						name: item.closest('td').siblings('.lista[align="left"]').text()
						, url: item.closest('a').attr('href')
					});
				};
			});
			// The pagination links are a pain to parse out of the dom. If there are exactly 50 results just assume there's another page.
			if (results.length === 50) pagination.next = parseInt(marker) + 1;
			if (marker > 0) pagination.prev = parseInt(marker) - 1;
			callback(false, results, pagination);
		});
	});
};

module.exports.download = function(url, path, callback){
	url = 'http://linuxtracker.org/'+url;
	request({url: url}, function(error, response, body) {
		if (error) callback(error);
		else callback(false);
	}).pipe(fs.createWriteStream(path));
};
