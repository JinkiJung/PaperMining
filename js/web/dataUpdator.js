function makeUpdate(domElement){
    var context = getURLParameter("context");
    if(domElement.classList && domElement.classList[0]){
        var data_id = domElement.classList[0];
        var data_row_elements = document.getElementsByClassName(data_id);
        var jsonDatum = convertToJson(context, data_id, data_row_elements);
        if(jsonDatum)
            registerValidDatum(context, jsonDatum, "update");
    }
}

function convertToJson(context, id, elements){
    var jsonDatum = {"id": id};
    for(var i=0; i<elements.length ; i++){
        var attributeName = elements[i].dataset.attributeType;
        var value = (elements[i].type === 'checkbox') ? elements[i].checked : elements[i].innerHTML;
        if(attributeName === 'comment')
            jsonDatum[attributeName] = {"content":value, "commenter":getValueFromLS(), "timestamp":"time"};
        // should be generalized //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        else if(attributeName === 'importance')
            jsonDatum[attributeName] = parseFloat(value);
        else if(attributeName === 'order')
            jsonDatum[attributeName] = parseInt(value);
        else if(attributeName === 'toPlant')
            jsonDatum[attributeName] = value;
        // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        else
            jsonDatum[attributeName] = value;
    }
    if(context === 'mine')
        jsonDatum['paperID'] = getURLParameter("paperID");
    return jsonDatum;
}