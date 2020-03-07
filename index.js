// grab the packages we need
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

//var fileUploader = require('./js/fileUploader/fileUploader')(app);
//var router = require('./js/router/router.js')(app);

app.use(express.static('./'));
app.listen(port);
console.log('PaperMining: web server running on 5000...');