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

function sendMetadataUpdate(type, content){
    var url = "http://"+defaultConfig.web.url+':'+defaultConfig.web.port+"/register/"+type+"?content="+content;
    $.get( url, function( data ) {
        location.reload();
        ////////////////// TO DO: refresh /////////////////////
        //$("#dataTable").load(window.location.href+"#dataTable" );
    });
}

function convertToJson(context, id, elements){
    var jsonDatum = {"id": id};
    for(var i=0; i<elements.length ; i++){
        var attributeName = elements[i].dataset.attributeType;
        var value = (elements[i].type === 'checkbox') ? elements[i].checked : elements[i].innerHTML;
        if(attributeName === 'comment')
            jsonDatum[attributeName] = {"content":value, "commenter":getContributorFromLS(), "timestamp":""};
        // should be generalized //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        else if(attributeName === 'importance')
            jsonDatum[attributeName] = parseFloat(value);
        else if(attributeName === 'order')
            jsonDatum[attributeName] = parseInt(value);
        else if(attributeName === 'toPlant')
            jsonDatum[attributeName] = value;
        else if(attributeName === 'paperID'){
            addToPaperIdList(jsonDatum[attributeName], value);
        }
        // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        else
            jsonDatum[attributeName] = value;
    }
    if(context === 'mine')
        addToPaperIdList(jsonDatum['paperID'], getURLParameter("paperID"));
    return jsonDatum;
}

function addToPaperIdList(idArray, idItem){
    if(idArray && Array.isArray(idArray))
        idArray.push(idItem);
    else{
        idArray = [];
        idArray.push(idItem);
    }
}

function updateOrderAttribute(table){
    var needToUpdate = [];
    for(var i =1 ; i< table.rows.length ; i++){
        var row = table.rows[i];
        for(var t=0; t<row.childNodes.length ; t++){
            if (row.childNodes[t].className === "unselectable") {
                var divElement = row.childNodes[t].children[0];
                var id = divElement.classList[0];
                if(divElement.innerHTML != i.toString()){
                    divElement.innerHTML = i;
                    needToUpdate.push(getJsonDatum(id, i));
                }
                break;
            }
        }
    }
    return needToUpdate;
}