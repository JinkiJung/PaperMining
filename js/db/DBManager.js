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
            jsonData[context+'s'].push(jsonDatum);
            fileManager.write("data", "json", "", JSON.stringify(jsonData));
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