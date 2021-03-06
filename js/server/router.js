const router = require('express').Router();
const fileManager = require('../file/fileManager');
const dbManager = require('../db/DBManager');
const express = require('express');
const validator = require('../validator/validatorForServer');
const fs = require('fs');
const paperMiningMetadata = ["title", "abstract"];
const paperMiningTypes = ["thought", "section", "paper"];
const bibGenerator = require('../bibtex/title2bibtex');

module.exports = function(app){
    app.post('/store/:type', express.json({type: '*/*'}), (req, res) => {
        if(paperMiningTypes.includes(req.params.type))
            validateAndStore(req.params.type, req, res);
        else
            res.status(500).send("Type error: '"+req.params.type+"' does not supported.");
    });

    app.post('/update/:type', express.json({type: '*/*'}), (req, res) => {
        if(paperMiningTypes.includes(req.params.type))
            validateAndUpdate(req.params.type, req, res);
        else
            res.status(500).send("Type error: '"+req.params.type+"' does not supported.");
    });

    app.get('/remove/:type', express.json({type: '*/*'}), (req, res) => {
        if(paperMiningTypes.includes(req.params.type))
            remove(req.params.type, req, res);
        else
            res.status(500).send("Type error: '"+req.params.type+"' does not supported.");
    });

    app.get('/getBibtex', (req, res) => {
        if(req.query['title'] && req.query['title'].length>0)
            bibGenerator.title2bibtex(req.query['title'], res);
        else
            res.status(500).send("request does not have the 'title' parameter.");
    });

    app.get('/register/:type', express.json({type: '*/*'}), (req, res) => {
        ///////////////////////////////// TO DO: metadata type to json schema ///////////////////////////////////////////////
        if(paperMiningMetadata.includes(req.params.type))
            if(req.query['content'] && req.query['content'].length > 0){
                var jsonDatum = {};
                jsonDatum[req.params.type] = req.query['content'];
                dbManager.updateMetaData(jsonDatum);
                res.end("OK");
            }

            else
                res.status(500).send("Content error: the request does not content.");
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

function validateAndUpdate(dataType, req, res){
    res.setHeader('Access-Control-Allow-Origin', 'http://'+defaultConfig.web.url+':'+defaultConfig.web.port);
    if(req.body) {
        try {
            var jsonDatum = req.body;

            // read schema file
            fs.readFile('./json/schema/paperMining.json', function read(err, data) {
                if (err) {
                    throw err;
                }
                var jsonSchema = JSON.parse(data);
                var fileName = jsonDatum.id;
                var problem = validator.findProblem(dataType,jsonSchema["definitions"][dataType], jsonDatum);

                if(problem)
                    res.status(500).send(problem.message);
                else{
                    // check the coincidence of param 'id' and data 'id
                    if(jsonDatum.id !== req.query['id']){
                        res.status(500).send("the parameter 'id' does not match with data attribute 'id'.");
                        return ;
                    }
                    try{
                        fileManager.update(fileName, "json", dataType+"s", JSON.stringify(jsonDatum),res);
                        dbManager.updateDatumToDB(dataType, jsonDatum);
                    }
                    catch(e) {
                        res.status(500).send(e.message); // error in the above string (in this case, yes)!
                        console.log(e.message);
                    }
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


function validateAndStore(dataType, req, res){
    res.setHeader('Access-Control-Allow-Origin', 'http://'+defaultConfig.web.url+':'+defaultConfig.web.port);
    if(req.body) {
        try {
            var jsonDatum = req.body;

            // read schema file
            fs.readFile('./json/schema/paperMining.json', function read(err, data) {
                if (err) {
                    throw err;
                }
                var jsonSchema = JSON.parse(data);
                var fileName = jsonDatum.id;
                console.log(fileName);
                var problem = validator.findProblem(dataType,jsonSchema["definitions"][dataType], jsonDatum);
                if(problem)
                    res.status(500).send(problem);
                else{
                    fileManager.write(fileName, "json", dataType+"s", JSON.stringify(jsonDatum),res);
                    dbManager.appendDatumToDB(dataType, jsonDatum);
                    //res.end("OK");
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
