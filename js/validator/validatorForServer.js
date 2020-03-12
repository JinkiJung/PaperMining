var Ajv = require('ajv');

module.exports = {
    findProblem: function (context, schema, data) {
        var ajv = new Ajv();
        var validate = ajv.compile(schema);
        var valid = validate(data);
        if (!valid) {
            //res.status(500).send(getAjvErrorMessages(ajv.errors));
            console.log(getAjvErrorMessages(ajv.errors));
            return getAjvErrorMessages(ajv.errors);
        }
        else{
            return undefined;
        }
    }
};

function getAjvErrorMessages(errors){
    var message = "";
    for(var i=0; i<errors.length ; i++){
        message += "Given input " + errors[i].message;
        if(i!==errors.length-1)
            message += "\n";
    }
    return message;
}