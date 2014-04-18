
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var handleFiles = require('./routes/handleFiles');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());

// this 3 lines have to be before app.use(app.router)
// https://stackoverflow.com/questions/21877098/upload-file-using-express-failed-cannot-read-property-of-undefined
app.use(express.multipart());
app.use(express.bodyParser({ keepExtensions: true }));
app.use(express.methodOverride());


app.use(app.router);
app.use(require('less-middleware')(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/upload', handleFiles.receiveUpload);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
