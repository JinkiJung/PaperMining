var multer	=	require('multer');
const path	=	require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');
const baseDir = './resources/pdf/';
var paperTitle = "aPaper";
//
module.exports = function(app)
{
    var storage	=	multer.diskStorage({
        destination: function (req, file, callback) {
            //
            var uploadPath = baseDir;
            callback(null, uploadPath);
        },
        filename: function (req, file, callback) {
            if (paperTitle===undefined || paperTitle==="aPaper")
                paperTitle = file.fieldname + '-' + Date.now();
            callback(null, paperTitle+".pdf");
        }
    });
    var upload = multer({ storage : storage}).single('userPaper');

    app.get('/uploadPDF',function(req,res){
        //updator.update();
        paperTitle= getWritableName(req.query['title']);
        res.sendFile(path.resolve(__dirname+'../../../html/pdfFileUploader.html'));
    });

    app.post('/api/pdf',checkUploadPath, function(req,res){
        upload(req,res,function(err) {
            if(err) {
                return res.status(500).end("Error uploading file.");
            }
            console.log("PDF file stored: " + baseDir + getWritableName(paperTitle) + '.pdf');
            res.end(baseDir + getWritableName(paperTitle) + '.pdf');
        });
    });
}

function getWritableName(fileName){
    return fileName.replace(/[ ?#:]/g,'_');
}

// for creating a folder when it doesn't exist
function checkUploadPath(req, res, next) {
    if(fs.existsSync(baseDir))
        next();
    /*
    if(folderCreator.createFolder(baseDir)>0)
        next();
    var uploadPath = baseDir;
       fs.exists(uploadPath, function(exists) {
          if(exists) {
            next();
          }
          else {
            fs.mkdir(uploadPath, function(err) {
              if(err) {
                console.log('Error in folder creation');
                next();
              }
              next();
            })
          }
       })
       */
}
