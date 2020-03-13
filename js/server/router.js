const router = require('express').Router();
const fileManager = require('../file/fileManager');
const dbManager = require('../db/DBManager');
const express = require('express');
const validator = require('../validator/validatorForServer');
const fs = require('fs');
const paperMiningTypes = ["thought", "section", "paper"];

module.exports = function(app){
    app.post('/store/:type', express.json({type: '*/*'}), (req, res) => {
        if(paperMiningTypes.includes(req.params.type))
            validateAndStore(req.params.type, req, res);
        else
            res.status(500).send("Type error: '"+req.params.type+"' does not supported.");
    });

    app.post('/update/:type', express.json({type: '*/*'}), (req, res) => {
        if(paperMiningTypes.includes(req.params.type))
            validateAndStore(req.params.type, req, res);
        else
            res.status(500).send("Type error: '"+req.params.type+"' does not supported.");
    });

    app.get('/remove/:type', express.json({type: '*/*'}), (req, res) => {
        if(paperMiningTypes.includes(req.params.type))
            remove(req.params.type, req, res);
        else
            res.status(500).send("Type error: '"+req.params.type+"' does not supported.");
    });
}

function remove(dataType, req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'http://' + defaultConfig.web.url + ':' + defaultConfig.web.port);
    var id = req.query["id"];
    if(id === undefined){
        res.status(500).send("request does not have the 'id' parameter.");
    }
    else{
        fs.readFile('./resources/json/data.json', function read(err, rawData) {
            if (err) {
                throw err;
            }
            var jsonData = JSON.parse(rawData);
            var jsonDatum = getDatum(jsonData[dataType+'s'], id);

            if(jsonDatum === undefined)
                res.status(500).send("there is no data corresponding to the id: " + id);
            else{
                // remove PDF
                if(dataType === 'paper'){
                    fileManager.removeWithPath(jsonDatum['pdf'], res);
                }
                // remove json
                fileManager.remove(id, "json", dataType + "s", res);
                // update DB
                if(removeDatum(jsonData[dataType+'s'], jsonDatum)){
                    dbManager.updateDataToDB(dataType, jsonData[dataType+'s']);
                    res.send("OK");
                }
                else
                    res.status(500).send("there is no data corresponding to the id: " + id);
            }
        });
    }
}

function removeDatum(jsonData, jsonDatum){
    const index = jsonData.indexOf(jsonDatum);
    if (index > -1) {
        jsonData.splice(index, 1);
        return true;
    }
    else return false;
}

function getDatum(jsonData, id){
    for(var i=0; i<jsonData.length ; i++){
        if(jsonData[i].id === id)
            return jsonData[i];
    }
}

function validateAndStore(dataType, req, res){
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
                var problem = validator.findProblem(dataType,jsonSchema["definitions"][dataType], req.body);
                if(problem)
                    res.status(500).send(problem);
                else{
                    fileManager.write(fileName, "json", dataType+"s", JSON.stringify(req.body),res);
                    dbManager.appendDatumToDB(dataType, req.body);
                }
            });
        } catch(e) {
            res.status(500).send(e.message); // error in the above string (in this case, yes)!
            console.log(e.message);
        }
    }
    else{
        res.status(500).send("request does not have a body.");
        console.log("request does not have a body.");
    }

}