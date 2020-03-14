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
    var headers = getVisiblesByContext(context, jsonSchema[contextToDefinition(context)]["properties"]);
    var editables = getEditablesByContext(context, jsonSchema[contextToDefinition(context)]["properties"]);
    // header
    result += generateTableHeader(headers);
    // new entry
    if(isEditable === true)
        generateDataEnterForm(context, headers);

    result += generateTableBody(context, jsonData, headers, editables);
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
        result+= "<td class=table_header><button class=\"tip\" onclick=\"sortTable("+k+",3)\">"+ capitalizeFirstLetter(headers[k]) + "<span class=\"description\">"+headers[k]+"</span></button></td>";
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
            alert( "The data has removed." );
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
        result += "<tr class=\"new_entry\">";
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

function reverseTableRows(skipInterval) {
    var table = document.getElementById("sortableTable"),
        newTbody = document.createElement('tbody'),
        oldTbody = table.tBodies[0],
        rows = table.rows,
        i = rows.length - 1;
    for(var i=0; i<skipInterval ; i++){
        newTbody.appendChild(rows[0]); // header
    }
    for (i = rows.length-1; i >= 0; i-=1) {

        //console.log(rows[i+1]);
        newTbody.appendChild(rows[i]);
    }
    oldTbody.parentNode.replaceChild(newTbody, oldTbody);
}

function getContentOnly(data){
    var elements = String(data.outerHTML).split(/<|>/);
    for(var i=0; i<elements.length ; i++){
        if(elements[i].length!=0 && elements[i]!="td" && !elements[i].includes("Section") && !elements[i].includes("contenteditable") && !elements[i].includes("class="))
            return String(elements[i]);
    }
}

function invalidateSortingState(){
    for(var t=0; t<sortingState.length ; t++)
        sortingState[t]=0;
}

function sortTable(numElement, skipInterval, priorityMap) {
    var priorityMap = labelPriorityMaps[numElement];
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("sortableTable");
    switching = true;
    /*Make a loop that will continue until
    no switching has been done:*/
    if(sortingState[numElement]==0){ //no sorted state

        while (switching) {
            //start by saying: no switching is done:
            switching = false;
            rows = table.rows;
            /*Loop through all table rows (except the
            first, which contains table headers):*/
            for (i = skipInterval; i < (rows.length - 1); i+=1) {
                if(hasClass(rows[i],"new_entry"))
                    continue;
                //start by saying there should be no switching:
                shouldSwitch = false;
                /*Get the two elements you want to compare,
                one from current row and one from the next:*/
                x = getContentOnly(rows[i].getElementsByTagName("TD")[numElement]);
                y = getContentOnly(rows[i + 1].getElementsByTagName("TD")[numElement]);
                //check if the two rows should switch place:
                if(compareWithContext(x.toLowerCase(),y.toLowerCase(),priorityMap)){
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
        invalidateSortingState();

        sortingState[numElement]=1;
    }
    else if(sortingState[numElement]>0){ //no sorted state
        reverseTableRows(skipInterval);
    }

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

function getVisiblesByContext(context, jsonData){
    var keys = [];
    for(var k in jsonData) {
        if(isVisible(context, jsonData[k]))
            keys.push(k);
    }
    keys.push('delete');
    return keys;
}
