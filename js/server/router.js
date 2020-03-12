const router = require('express').Router();
var fileManager = require('../file/fileManager');
var express = require('express');
var validator = require('../validator/validatorForServer');
const fs = require('fs');

module.exports = function(app){
    app.post('/thought', express.json({type: '*/*'}), (req, res) => {
        validateAndStore("thought", req, res);
    });

    app.post('/paper', express.json({type: '*/*'}), (req, res) => {
        validateAndStore("paper", req, res);
    });

    app.post('/section', express.json({type: '*/*'}), (req, res) => {
        validateAndStore("section", req, res);
    });
}

function validateAndStore(context, req, res){
    res.setHeader('Access-Control-Allow-Origin', 'http://'+defaultConfig.web.url+':'+defaultConfig.web.port);
    if(req.body) {
        try {
            // append timestamp from server
            //serverTime.getCurrentTime();

            // read schema file
            fs.readFile('./json/schema/paperMining.json', function read(err, data) {
                if (err) {
                    throw err;
                }
                var jsonSchema = JSON.parse(data);
                var fileName = req.body.id;
                if(context === 'section')
                    fileName = req.body.name;

                var problem = validator.findProblem(context,jsonSchema["definitions"][context], req.body);
                if(problem)
                    res.status(500).send(problem);
                else{
                    fileManager.write(fileName, "json", context+"s", JSON.stringify(req.body),res);
                    fs.readFile('./resources/json/data.json', function read(err, rawData) {
                        if (err) {
                            throw err;
                        }
                        var jsonData = JSON.parse(rawData);
                        jsonData[context+'s'].push(req.body);
                        fileManager.write("data", "json", "", JSON.stringify(jsonData));
                    });
                }
            });
        } catch(e) {
            res.status(500).send(e.message); // error in the above string (in this case, yes)!
        }
    }
}