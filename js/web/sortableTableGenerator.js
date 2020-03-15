function getTitle(jsonData, paperID){
    if(paperID !== 'null')
        return "[Mining]<br>"+getTitleFromPaperID(jsonData["papers"], paperID);
    else
        return jsonData["projectName"]
}

function generateTable(context, projectName, jsonData, jsonSchema, isEditable){
    var result = "";
    var trStyle = "";
    /*
    if(type !== 'papers')
        trStyle = "class=\"nodrop nodrag\"";
     */
    result += "<table id=\"sortableTable\"><tr "+trStyle+">";
    var headers = getVisiblesByContext(context, jsonSchema[contextToDefinition(context)]["properties"], isEditable);
    var editables = getEditablesByContext(context, jsonSchema[contextToDefinition(context)]["properties"]);

    sortingState = Array(headers.length).fill(false);
    // header
    result += generateTableHeader(headers);
    // new entry
    if(isEditable === true)
        generateDataEnterForm(context, headers);

    if(jsonData){
        if(jsonData.length > 0)
            result += generateTableBody(context, jsonData, headers, editables);
        else
            result += generateDummyBody(context, headers, isEditable);
    }
    // existing data
    //result += generateDataRows(type,projectName, data, headers);
    return result + "</table>";
}

function getTitleFromPaperID(jsonData, paperID){
    var item = getPaperFromPaperID(jsonData, paperID);
    if(item && item.length > 0)
        return item[0]["title"];
}

function getPaperFromPaperID(jsonPaperData, paperID){
    var items = [];
    for(var i=0; i<jsonPaperData.length ; i++){
        if(jsonPaperData[i]["id"] === paperID)
            items.push(jsonPaperData[i]);
    }
    return items;
}

function getThoughtFromPaperID(jsonThoughtData, paperID){
    var items = [];
    for(var i=0; i<jsonThoughtData.length ; i++){
        if(jsonThoughtData[i]["paperID"] === paperID)
            items.push(jsonThoughtData[i]);
    }
    return items;
}

function generateTableHeader(headers){
    var result = "";
    for( var k=0; k<headers.length ; k++){
        result+= "<td class=table_header><button class=\"tip\" onclick=\"sortTable("+k+")\">"+ capitalizeFirstLetter(headers[k]) + "<span class=\"description\">"+headers[k]+"</span></button></td>";
    }
    result += "</tr>";
    return result;
}

function generateContent(obj, key){
    if(typeof obj === 'object'){
        if (key ==='section')
            return obj['name'];
        else if(key ==='comment')
            return obj['content'];
        else
            return "error";
    }
    else if(typeof obj === 'boolean')
        return obj === true ? "checked" : "";
    else if(obj)
        return obj;
    else if(obj === 0)
        return "0";
    else
        return "";
}

function generateForm(id, obj, key, editable = true){
    var htmlElement = "p";
    var rowId = generateRowID(id, key);
    var rowContent = generateContent(obj, key);
    if(obj === undefined && key){ // for new entry
        // should be generalized //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if(key === 'importance' || key === 'order'){
            return "<td><input type=\"number\" class='new_input_field' id=\"" + rowId + "\" >" + rowContent + "</input></td>";
        }
        else if(key === 'toPlant')
            return "<td><input type=\"checkbox\" class='new_input_field' id=\"" + rowId + "\" >" + rowContent + "</input></td>";
        else if(key === 'pdf')
            return "<td>" + createPDFUploadPopup(rowId) + "</td>";
        // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        else
            return "<td><textarea class='new_input_field' id=\"" + rowId + "\" >" + rowContent + "</textarea></td>";
    }
    else if(typeof obj === "boolean"){
        if(editable)
            return "<td><input type='checkbox' id=\"" + rowId + "\" " + rowContent + " class = \""+id+"\" data-attribute-type = '"+key+"'></input></td>";
        else
            return "<td><div id=\"" + rowId + "\">"+rowContent+"</div></td>";
    }
    else if(key==="id" || key ==='paperID'){
        if(editable)
            return "<td><a href='table.html?context=mine&paperID="+obj+"' class = '"+id+"' data-attribute-type = '"+key+"'>"+ rowContent + "</a></td>";
        else
            return "<td><div id=\"" + rowId + "\">"+rowContent+"</div></td>";
    }
    else if(key==="bibtex"){
        if(editable)
            return "<td><button id=\"" + rowId + "\" value = " + rowContent + " onclick=\"setClipboard('"+rowContent+"')\">Copy</button><br><textarea id=\"" + rowId + "\"  class = '"+id+"' data-attribute-type = '"+key+"'>" + rowContent + "</textarea></td>";
        else
            return "<td><button id=\"" + rowId + "\" value = " + rowContent + " onclick=\"setClipboard('"+rowContent+"')\">Copy</button></td>";
    }
    else if(key==="pdf"){
        if(editable)
            return "<td><a href='../"+rowContent+"'>Open</a><br><textarea id=\"" + rowId + "\" class = '"+id+"' data-attribute-type = '"+key+"'>" + rowContent + "</textarea></td>";
        else
            return "<td><a href='../"+rowContent+"'>Open</a></td>";
    }
    else{
        if(editable)
            return "<td><div id=\"" + rowId + "\" contenteditable=\"true\" class = '"+id+"' data-attribute-type = '"+key+"'>" + rowContent + "</></td>";
        else
            return "<td><div id=\"" + rowId + "\">"+rowContent+"</div></td>";
    }
}

function contextToData(context){
    return contextToDefinition(context) + 's';
}

function contextToDefinition(context){
    if(context === 'collect')
        return 'paper';
    else if(context === 'mine')
        return 'thought';
    else if(context === 'carve')
        return 'thought';
    else if(context === 'plant')
        return 'thought';
    else
        return "";
}

function generateDeleteButton(context, id){
    var url = "http://"+defaultConfig.web.url+':'+defaultConfig.web.port+"/remove/"+contextToDefinition(context)+"?id="+id;
    return "<td><button onclick=\"callGetToRemove('"+url+"')\">Delete</button></td>";
}

function callGetToRemove(url){
    var r = confirm("Do you want to remove it?");
    if (r === true) {
        $.get( url, function( data ) {
            location.reload();
            ////////////////// TO DO: refresh /////////////////////
            //$("#dataTable").load(window.location.href+"#dataTable" );
        });
    }
}

function generateRowID(id, key){
    if(id === "new")
        return id + "_" + key;
    else
        return id + "_" + key + generateShortRand();
}

function generateRow(context, jsonDatum, key, editables) {
    var id = jsonDatum['id'];
    if(key === 'delete')
        return generateDeleteButton(context, id);
    if (jsonDatum === undefined || key === undefined || jsonDatum[key] === undefined)
        return "";
    return generateForm(id, jsonDatum[key], key, editables.includes(key));
}

function generateTableBody(context, jsonData, keys, editables){
    var result = "";
    for(var t=0; t < jsonData.length; t++) {
        result += "<tr class=\"entry\">";
        for (var k = 0; k < keys.length; k++) {
            result += generateRow(context, jsonData[t], keys[k], editables);
        }
        result += "</tr>";
    }
    return result;
}

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function generateDummyBody(context, headers, isEditable) {
    var message = "<br>No data to show.<br><br>";
    if(context === 'carve')
        message += " You need to add your thoughts in the <b>Mine</b> page of a paper. <br><br> Go to the <a href='./table.html?context=collect'><b>Collect</b></a> page and click 'id' of the paper!<br><br>";
    else if(context === 'plant')
        message += " You need to select the thoughts to be planted in the <a href='./table.html?context=carve'><b>Carve</b></a> page by clicking 'ToPlant' checkbox!<br><br>";
    else if(isEditable)
        message += " Click 'Add new' button to add the first "+contextToDefinition(context)+"!<br><br>";
    return "<tr class=\"entry\"><td colspan='"+headers.length+"'><center>"+message+"</center></td></tr>";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function isEditable(context, jsonDatum){
    for(var t in jsonDatum) {
        if(t === '_editable'&& jsonDatum[t]["default"].includes(context)){
            return true;
        }
    }
    return false;
}

function isVisible(context, jsonDatum){
    for(var t in jsonDatum) {
        if(t === '_visible' && jsonDatum[t]["default"].includes(context)){
            return true;
        }
    }
    return false;
}

function getEditablesByContext(context, jsonData){
    var keys = [];
    for(var k in jsonData) {
        if(isEditable(context, jsonData[k]))
            keys.push(k);
    }
    return keys;
}

function getVisiblesByContext(context, jsonData, isEditable){
    var keys = [];
    for(var k in jsonData) {
        if(isVisible(context, jsonData[k]))
            keys.push(k);
    }
    if(isEditable === true)
        keys.push('delete');
    return keys;
}


function sortTable(numElement) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("sortableTable");
    switching = true;
    /*Make a loop that will continue until
    no switching has been done:*/

    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        /*Loop through all table rows (except the
        first, which contains table headers):*/
        rows = table.rows;
        console.log(rows);
        for (i = 0; i < (rows.length - 1); i+=1) {
            if(hasClass(rows[i],'entry') === false)
                continue;
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            x = getPriority(rows[i].getElementsByTagName("TD")[numElement].children[0]);
            y = getPriority(rows[i + 1].getElementsByTagName("TD")[numElement].children[0]);
            console.log(x);
            console.log(y);
            //check if the two rows should switch place:
            if(x!==y && compareWithContext(x,y) ^ sortingState[numElement]){
                shouldSwitch=true;
                break;
            }
        }
        if (shouldSwitch) {
            /*If a switch has been marked, make the switch
            and mark that a switch has been done:*/
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }

    console.log(sortingState[numElement]);
    sortingState[numElement] = !sortingState[numElement];
    console.log(sortingState[numElement]);
}

function compareWithContext(x, y){
    console.log(typeof x);
    if(typeof x === 'integer' || typeof x === 'number')
        return x > y;
    else{
        console.log(x.toLowerCase().localeCompare(y.toLowerCase()));
        return x.toLowerCase().localeCompare(y.toLowerCase()) > 0;
    }

    console.log(x);
    console.log(y);
    
}

function getPriority(datum){
    var attributeType = datum.dataset.attributeType;
    if(attributeType === "toPlant" || attributeType === "written")
        return datum.checked;
    else if(attributeType === "importance" || attributeType === "order")
        return parseFloat(datum.innerHTML);
    else
        return datum.innerHTML;
}