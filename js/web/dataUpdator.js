function makeUpdateByElement(domElement){
    var context = getURLParameter("context");
    if(domElement.classList && domElement.classList[0]){
        var data_id = domElement.classList[0];
        if(data_id.includes('section'))
            makeUpdate('section', data_id, false);
        else
            makeUpdate(context, data_id);
    }
}

function makeUpdate(context, data_id, doRefresh = true){
    var data_row_elements = document.getElementsByClassName(data_id);

    var jsonDatum = convertToJson(context, data_id, data_row_elements);

    // for bibtex collecting
    if (context === 'plant' && jsonDatum['written'])
        updateCompletePaperIDs(jsonDatum, jsonDatum['written']);

    if(jsonDatum)
        updateWithCompleteJsonDatum(context, jsonDatum, "update", doRefresh);
}

function makeUpdateForReaction(thoughtId, commentId, itemToAdd){
    var context = getURLParameter("context");
    var reactionString = document.getElementById(commentId+"_reaction").innerHTML;
    if(itemToAdd) {
        var data_row_elements = document.getElementsByClassName(thoughtId);
        var jsonDatum = convertToJson(context, thoughtId, data_row_elements);

        if (reactionString.length > 0)
            jsonDatum["comment"]["reactions"] = parseReaction(reactionString);
        if(!jsonDatum["comment"].hasOwnProperty('reactions')|| !Array.isArray(jsonDatum["comment"]["reactions"]))
            jsonDatum["comment"]["reactions"] = [];
        jsonDatum["comment"]["reactions"].push(itemToAdd);
    }
    if(jsonDatum)
        updateWithCompleteJsonDatum(context, jsonDatum, "update");
}

function sendMetadataUpdate(type, content){
    var url = "http://"+defaultConfig.web.url+':'+defaultConfig.web.port+"/register/"+type+"?content="+content;
    $.get( url, function( data ) {
        location.reload();
        ////////////////// TO DO: refresh /////////////////////
        //$("#dataTable").load(window.location.href+"#dataTable" );
    });
}

function parseReaction(reactionString){
    var result = [];
    if(reactionString && reactionString.length > 0){
        var arrays = reactionString.split("<br>");
        for(var k = 0 ; k < arrays.length ; k++){
            var values = arrays[k].split(" - ");
            result.push({content: values[0], reactor:values[1], timestamp:""});
        }
    }
    return result;
}

function collectReactions(commentId){
    if(document.getElementById(commentId+"_reaction")){
        var stringValue = document.getElementById(commentId+"_reaction").innerHTML;
        return parseReaction(stringValue);
    }
    return [];
}

function getDefaultJsonByType(context, id){
    // it needs to get 'editables'.....
    var newJsonDatum = {};
    if(context === 'carve'){
        newJsonDatum['id'] = id;
        newJsonDatum['order'] = -1;
        newJsonDatum['written'] = false;
        newJsonDatum['toPlant'] = false;
        newJsonDatum['importance'] = 0;
        newJsonDatum['paperID'] = [];
    }
    else if(context === 'plant'){
        newJsonDatum['id'] = id;
        newJsonDatum['sectionID'] = "";
        newJsonDatum['comment'] = {};
        newJsonDatum['written'] = false;
    }
    else if(context === 'collect'){
        newJsonDatum['id'] = id;
        newJsonDatum['importance'] = 0;
        newJsonDatum['contributor'] = getContributorFromLS();
        newJsonDatum['timestamp'] = ""; // dummy timestamp
    }
    else if(context === 'section'){
        newJsonDatum['id'] = id;
        newJsonDatum['name'] = "";
        newJsonDatum["sectionIDofParent"] = "";
        newJsonDatum['order'] = -1;
    }
    return newJsonDatum;
}

function convertToJson(context, id, elements){
    var jsonDatum = getDefaultJsonByType(context, id);
    for(var i=0; i<elements.length ; i++){
        var attributeName = elements[i].dataset.attributeType;
        var value = (elements[i].type === 'checkbox') ? elements[i].checked : elements[i].innerHTML;
        // for the new entry input
        if(elements[i].type === 'textarea' || elements[i].type === 'number')
            value = elements[i].value;
        // if it has link in it, just grasp text value
        if(typeof value === 'string' && value.includes("</a>"))
            value = elements[i].textContent;

        // should be generalized //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // it needs to get 'editables'.....
        if(attributeName === 'comment')
            jsonDatum[attributeName] = {"content":value, "commenter":getContributorFromLS(), "timestamp":"", "reactions":collectReactions(elements[i].id)};
        else if(attributeName === 'importance')
            jsonDatum[attributeName] = parseFloat(value);
        else if(attributeName === 'order')
            jsonDatum[attributeName] = parseInt(value);
        else if(attributeName === 'toPlant')
            jsonDatum[attributeName] = value;
        else if(attributeName === 'paperID'){
            if(value)
                jsonDatum[attributeName] = value.split(',');
            else
                jsonDatum[attributeName] = [];
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
    if(idArray && Array.isArray(idArray)) {
        if (!idArray.includes(idItem))
            idArray.push(idItem);
    }else{
        idArray = [];
        idArray.push(idItem);
    }
}

function updateOrderAttribute(table){
    var needToUpdate = [];
    var lastMax = 1;

    for(var i =1 ; i< table.rows.length ; i++){
        var row = table.rows[i];
        if(hasClass(row,'entry') === false)
            continue;
        var orderValue = -1;
        var id;
        for(var t=0; t<row.childNodes.length ; t++){
            if (row.childNodes[t].className === "unselectable") {
                var divElement = row.childNodes[t].children[0];
                id = divElement.classList[0];
                orderValue = parseInt(divElement.innerHTML);
                break;
            }
        }

        if(orderValue < lastMax){ // this is where the new attributes fall in
            if(lastMax === 1) //  fine, moving on
            {}
            else{  // needs an update
                divElement.innerHTML = lastMax;
                if(id)
                    needToUpdate.push(id);
                lastMax +=1;
            }
        }
        else if(orderValue === lastMax){ // fine, increments the checking criteria
            lastMax += 1;
        }
        else{
            divElement.innerHTML = lastMax;
            if(id)
                needToUpdate.push(id);
            lastMax +=1;
        }
    }
    return needToUpdate;
}

function sendJsonDatum(context, data, command, doRefresh){
    // construct an HTTP request
    var xhr = new XMLHttpRequest();
    var id_str = command === 'update' ? "?id="+data.id : "";
    var url = "http://"+defaultConfig.web.url+':'+defaultConfig.web.port+"/"+command+"/"+contextToDefinition(context) + id_str;
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    // send the collected data as JSON
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            //console.log(xhr.responseText);

            if(doRefresh)
                location.reload();

            ////////////////// TO DO: refresh /////////////////////
            //$("#dataTable").load(window.location.href+"#dataTable" );
        }
    };
}