const resourceDir = "./resources/";
const fs = require('fs');

module.exports = {
    read: function (fileName, fileExtension, callback) {
        var fileNameRevised= getWritableName(fileName);
        fs.readFile(resourceDir + fileExtension + "/" +fileNameRevised+'.'+fileExtension, 'utf8', function (err, data) {
            if (err == null) {
                if (fileExtension !== 'json') {
                    callback(null, data.toString());
                } else {
                    callback(null, JSON.parse(data.toString()));
                }
            }
            else {
                console.log("Failed to read data : "+fileToWrite);
                return undefined;
            }
        });
    },
    write: function (fileName, fileExtension, content, res = undefined){
        module.createFolder(resourceDir + fileExtension );
        var fileNameRevised= getWritableName(fileName);
        fs.writeFile(resourceDir + fileExtension + "/" +fileNameRevised+'.'+fileExtension, content, function(err) {
            if(err) {
                if(res != undefined)
                    res.send('Fetch failed.');
                return console.log(err);
            }
            console.log("The file saved: "+fileNameRevised+"."+fileExtension);
            if(res)
                res.send("The file saved: "+fileNameRevised+"."+fileExtension);
        });
    },
    doesFileExist: function(fileName, res = undefined){
        var fileNameRevised= getWritableName(fileName);
        console.log(fileNameRevised);
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