var express = require('express');

var app = express();
var port = process.argv[2];

//a port to listen on must be provided
if(typeof port === 'undefined'){
	console.error('no port defined!');
	process.exit();
}	

// all environments
app.use(express.logger());
app.use(express.static(__dirname + '/public_html'));

app.listen(port);
console.log('serving on port: ' + port);


