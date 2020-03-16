const resourceDir = "./resources/";
const fs = require('fs');

module.exports = {
    read: function (fileName, fileExtension, folderName, callback, res = undefined) {
        var fileNameRevised= getWritableName(fileName);
        if(folderName === undefined)
            folderName= "";
        var fullFilePath = resourceDir + fileExtension + "/" +folderName+ "/"+fileNameRevised+'.'+fileExtension;
        fs.readFile(fullFilePath, 'utf8', function (err, data) {
            if (err == null) {
                if (fileExtension !== 'json') {
                    callback(null, data.toString());
                } else {
                    callback(null, JSON.parse(data.toString()));
                }
            }
            else {
                if(res)
                    res.status(500).send("Failed to read data : "+fileToWrite);
                console.log("Failed to read data : "+fileToWrite);
            }
        });
    },
    write: function (fileName, fileExtension, folderName, content, res = undefined){
        module.exports.createFolder(resourceDir + fileExtension + "/" +folderName );
        var fileNameRevised= getWritableName(fileName);
        if(folderName && folderName.length>0)
            folderName += "/";
        var fullFilePath = resourceDir + fileExtension + "/" +folderName+fileNameRevised+'.'+fileExtension;
        fs.writeFile(fullFilePath, content, function(err) {
            if(err) {
                if(res)
                    res.send('Fetch failed.');
                return console.log(err);
            }
            console.log("The file saved: "+fullFilePath);
            if(res && !res.finished)
                res.send("The file saved: "+fullFilePath);
        });
    },
    update: function (fileName, fileExtension, folderName, content, res = undefined){
        module.exports.createFolder(resourceDir + fileExtension );
        var fileNameRevised= getWritableName(fileName);
        if(folderName === undefined)
            folderName= "";
        else
            folderName += "/";
        var fullFilePath = resourceDir + fileExtension + "/" +folderName+fileNameRevised+'.'+fileExtension;
        fs.stat(fullFilePath, function(err, stat) {
            if(err == null) {
                //file exists
                try {
                    fs.writeFile(fullFilePath, content, function(err) {
                        if(err) {
                            if(res)
                                res.send('Fetch failed.');
                            return console.log(err);
                        }
                        console.log("The file updated: "+fullFilePath);
                        if(res && !res.finished)
                            res.send("The file updated: "+fullFilePath);
                    });
                } catch(err) {
                    res.status(500).send(err.message);
                }
            } else if(err.code === 'ENOENT') {
                res.status(500).send(err.message);
            }
        });
    },
    remove: function (fileName, fileExtension, folderName, res = undefined){
        var fileNameRevised= getWritableName(fileName);
        if(folderName === undefined)
            folderName= "";
        else
            folderName += "/";
        var fullFilePath = resourceDir + fileExtension + "/" +folderName+fileNameRevised+'.'+fileExtension;
        module.exports.removeWithPath(fullFilePath, res);
    },
    removeWithPath: function (fullFilePath, res = undefined) {
        fs.access(fullFilePath, fs.F_OK, (err) => {
            if (err) {
                res.status(500).send(err.message);
            }
            //file exists
            try {
                fs.unlinkSync(fullFilePath); //file removed
                console.log("The file removed: "+fullFilePath);
                if(res && !res.finished)
                    res.send("The file removed: "+fullFilePath);
            } catch(err) {
                res.status(500).send(err.message);
            }
        });
    },
    createFolder: function (newDir){
        if (newDir == ".")
            return false;
        if (newDir.endsWith("/"))
            newDir = newDir.substring(0,newDir.length-1);
        if (!fs.existsSync(newDir)){
            if(newDir.includes('/')){
                //console.log(newDir + " -> " + newDir.split('/').slice(0,-1).join('/'));
                module.exports.createFolder(newDir.split('/').slice(0,-1).join('/'));
            }
            fs.mkdirSync(newDir);
            return true;
        }
        else return false;
    }
};

function getWritableName(fileName){
    return fileName.replace(/[?#:]/g,'_');
}