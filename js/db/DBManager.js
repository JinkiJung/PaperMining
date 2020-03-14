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
                jsonData[context+'s'][index] = jsonDatum;
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
    }
}

function getIndex(jsonData, id){
    for(var i=0; i<jsonData.length ; i++){
        if(jsonData[i].id === id)
            return i;
    }
    return -1;
}