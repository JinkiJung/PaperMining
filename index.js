var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// load configuration file
const config = require('./json/conf/config.json');
global.defaultConfig = config.development;

var fileUploader = require('./js/server/fileUploader.js')(app);
var router = require('./js/server/router.js')(app);

app.use(express.json({type: '*/*'}));
app.use(express.static('./'));

app.listen(defaultConfig.web.port);

console.log('PaperMining: web server running on '+defaultConfig.web.url+':'+defaultConfig.web.port+'...');