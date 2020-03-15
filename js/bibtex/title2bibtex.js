module.exports = {
    title2bibtex: function (title, res) {
        // using spawn instead of exec, prefer a stream over a buffer
        // to avoid maxBuffer issue
        console.log("Getting bibtex request is proceeding for :" + title);
        var spawn = require('child_process').spawn;
        var process = spawn('python', ['./python/collectPaper.py',
            title, // starting funds
        ]);
        process.stdout.on('data', function (data) {
            var removeQuatation = replaceAll(replaceAll(data.toString(),"'",""),"\\n","");
            var bibtexPart = removeQuatation.substring(removeQuatation.indexOf('bibtex')+6,removeQuatation.indexOf('source'));
            res.send(bibtexPart.substring(bibtexPart.indexOf(':')+1,bibtexPart.lastIndexOf('}')+1).trim().replace(/(\r\n|\n|\r)/gm, ""));
        });
    }
};

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}