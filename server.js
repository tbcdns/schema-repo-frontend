var config = require('./config.js');
var port = process.env.PORT || config.LOCAL_PORT;

var express = require('express');
var dust = require('dustjs-linkedin');
var helpers = require('dustjs-helpers');
var cons = require('consolidate');
var bodyParser = require('body-parser');
var router = require('./routes.js')(express);
var app = express();

app.engine('dust', cons.dust);
app.set('views', __dirname+'/views');
app.set('view engine', 'dustjs-linkedin');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(router);

app.listen(port);