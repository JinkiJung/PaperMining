const fs = require('fs');
const fileManager = require('../file/fileManager');
const dbFullPath = './resources/json/data.json';

module.exports = {
    appendDatumToDB: function (context, jsonDatum) {
        fs.readFile(dbFullPath, function read(err, rawData) {
            if (err) {
                throw err;
            }
            var jsonData = JSON.parse(rawData);
            jsonData[context+'s'].push(jsonDatum);
            fileManager.write("data", "json", "", JSON.stringify(jsonData));
        });
    },
    updateDatumToDB: function(context, jsonDatum){
        fs.readFile(dbFullPath, function read(err, rawData) {
            if (err) {
                throw err;
            }
            var jsonData = JSON.parse(rawData);
            var index = getIndex(jsonData[context+'s'], jsonDatum.id);
            if(index>=0){
                updateAttribute(context, index, jsonData, jsonDatum);
                fileManager.write("data", "json", "", JSON.stringify(jsonData));
            }
        });
    },
    updateDataToDB: function(context, updatedJsonData){
        fs.readFile(dbFullPath, function read(err, rawData) {
            if (err) {
                throw err;
            }
            var jsonData = JSON.parse(rawData);
            jsonData[context+'s'] = updatedJsonData;
            fileManager.write("data", "json", "", JSON.stringify(jsonData));
        });
    },
    updateMetaData: function(jsonMetadata){
        fs.readFile(dbFullPath, function read(err, rawData) {
            if (err) {
                throw err;
            }
            var jsonData = JSON.parse(rawData);
            updateMetadata(jsonData, jsonMetadata);
            fileManager.write("data", "json", "", JSON.stringify(jsonData));
        });
    }
}

function updateMetadata(jsonData, jsonDatum) {
    for(var key in jsonDatum) {
        jsonData[key] = jsonDatum[key];
    }
}

function updateAttribute(context, index, jsonData, jsonDatum) {
    for(var key in jsonDatum) {
        jsonData[context+'s'][index][key] = jsonDatum[key];
    }
}

function getIndex(jsonData, id){
    for(var i=0; i<jsonData.length ; i++){
        if(jsonData[i].id === id)
            return i;
    }
    return -1;
}