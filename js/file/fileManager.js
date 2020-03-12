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
        module.exports.createFolder(resourceDir + fileExtension );
        var fileNameRevised= getWritableName(fileName);
        if(folderName === undefined)
            folderName= "";
        else
            folderName += "/";
        var fullFilePath = resourceDir + fileExtension + "/" +folderName+fileNameRevised+'.'+fileExtension;
        fs.writeFile(fullFilePath, content, function(err) {
            if(err) {
                if(res)
                    res.send('Fetch failed.');
                return console.log(err);
            }
            console.log("The file saved: "+fullFilePath);
            if(res)
                res.send("The file saved: "+fullFilePath);
        });
    },
    doesFileExist: function(fileName, res = undefined){
        var fileNameRevised= getWritableName(fileName);
        fs.access(bibDir+fileNameRevised+'.bib', fs.F_OK, (err) => {
            if (err) {
                res.send("Not exist.");
                return;
            }
            res.send(fileNameRevised+'.bib');
            //file exists
        })
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