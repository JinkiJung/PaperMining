function getTitle(jsonData, paperID){
    if(paperID !== 'null')
        return "[Mining by "+getContributorFromLS()+"]<br>"+getTitleFromPaperID(jsonData["papers"], paperID);
    else
        return jsonData["title"]
}

function generateTable(context, jsonData, jsonSchema, sectionList, isEditable){
    var result = "";
    var trStyle = "";
    trStyle = "class=\"nodrop nodrag\"";
    result += "<table id=\"sortableTable\"><tr "+trStyle+">";
    var headers = getVisiblesByContext(context, jsonSchema[contextToDefinition(context)]["properties"], isEditable);
    var descriptions = getDescriptionsByContext(context, jsonSchema[contextToDefinition(context)]["properties"], isEditable);
    var editables = getEditablesByContext(context, jsonSchema[contextToDefinition(context)]["properties"]);

    sortingState = Array(headers.length).fill(false);
    // header
    result += generateTableHeader(headers, descriptions);
    // new entry
    if(isEditable === true)
        generateDataEnterForm(context, editables, sectionList);
    if(context === 'plant')
        generateBibtexCopyBtn();

    if(jsonData){
        if(jsonData.length > 0)
            result += generateTableBody(context, jsonData, headers, sectionList, editables);
        else
            result += generateDummyBody(context, headers, isEditable);
    }
    // existing data
    //result += generateDataRows(type,projectName, data, headers);
    return result + "</table>";
}

function generateTableBody(context, jsonData, keys, sectionList, editables){
    var result = "";
    for(var t=0; t < jsonData.length; t++) {
        result += generateRow(context, jsonData[t], keys, sectionList, editables);
    }
    return result;
}

function generateRow(context, jsonDatum, keys, sectionList, editables){
    if(isNotRelated(context, jsonDatum))
        return "";
    var result = "<tr class=\"entry\">";

    // for bibtex collecting
    if (context === 'plant' && jsonDatum['written'])
        updateCompletePaperIDs(jsonDatum, jsonDatum['written']);

    var isUnordered = false;
    // for ordering warning
    if ( (context === 'carve' || context === 'plant') && jsonDatum['order'] < 0)
        isUnordered = true;

    for (var k = 0; k < keys.length; k++) {
        result += generateCell(context, jsonDatum, keys[k], sectionList, editables, isUnordered);
    }
    return result + "</tr>";
}

function generateCell(context, jsonDatum, key, sectionList, editables, isUnordered) {
    var id = jsonDatum['id'];
    if(key === 'delete')
        return generateDeleteButton(context, id);
    if (jsonDatum === undefined || key === undefined || jsonDatum[key] === undefined)
        return "";
    var editable = ((context ==='mine' || context ==='carve') && key === 'id') ? false : editables.includes(key);

    var selectString = getSelectOfSectionList(context, id, sectionList, jsonDatum['sectionID'], editable);

    return generateForm(id, jsonDatum[key], key, selectString, editable, isUnordered);
}

function generateForm(id, obj, key, selectString, editable = true, isUnordered = false){
    var cellID = generateCellID(id, key);
    var rowContent = generateContent(obj, key);
    if(obj === undefined && key){ // for new entry
        // should be merted to below //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if(key === 'importance' || key === 'order'){
            return "<td><input type=\"number\" id=\"" + cellID + "\" class = '"+id+"'>" + rowContent + "</input></td>";
        }
        else if(key === 'toPlant')
            return "<td><input type=\"checkbox\" id=\"" + cellID + "\" class = '"+id+"'>" + rowContent + "</input></td>";
        else if(key === 'pdf')
            return "<td>" + createPDFUploadPopup(cellID) + "</td>";
        else if(key==="sectionID"){
            return "<td><textarea id=\"" + cellID + "\" class = '"+id+"' data-attribute-type = '"+key+"' hidden></textarea>"+selectString+"</td>";
        }
        // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        else
            return "<td><textarea id=\"" + cellID + "\" class = '"+id+"'>" + rowContent + "</textarea></td>";
    }
    else if(typeof obj === "boolean"){
        if(editable)
            return "<td><input type='checkbox' id=\"" + cellID + "\" " + rowContent + " class = \""+id+"\" data-attribute-type = '"+key+"'></input></td>";
        else
            return "<td><div id=\"" + cellID + "\">"+rowContent+"</div></td>";
    }
    else if(key==="id"){
        var unorderedWarning = isUnordered ? "<b>[Need to be organized]</b><br>" : "";
        if(editable)
            return "<td><a href='table.html?context=mine&paperID="+obj+"' class = '"+id+"' data-attribute-type = '"+key+"'>"+ rowContent + "</a></td>";
        else
            //return "<td><div id=\"" + cellID + "\" class='unselectable'>"+rowContent+"</div></td>";
            return "<td>"+unorderedWarning + rowContent + "</td>";
    }
    else if(key ==='paperID'){
        return "<td>"+collectPaperIDs(id, key, rowContent)+"</td>";
    }
    else if(key==="bibtex"){
        if(editable)
            return "<td><div contenteditable=\"true\"  id=\"" + cellID + "\"  class = '"+id+"' data-attribute-type = '"+key+"'>" + rowContent + "</div><br><button id=\"" + cellID + "\" value = " + rowContent + " onclick=\"setClipboard('"+rowContent+"')\">Copy</button></td>";
        else
            return "<td><button id=\"" + cellID + "\" value = " + rowContent + " onclick=\"setClipboard('"+rowContent+"')\">Copy</button></td>";
    }
    else if(key==="pdf"){
        if(editable)
            return "<td><div contenteditable=\"true\"  id=\"" + cellID + "\" class = '"+id+"' data-attribute-type = '"+key+"'>" + rowContent + "</div><br><a href='../"+rowContent+"'>Open</a></td>";
        else
            return "<td><a href='../"+rowContent+"'>Open</a></td>";
    }
    else if(key==="order"){
        return "<td class='unselectable'><div id=\"" + cellID + "\" class = '"+id+"' data-attribute-type = '"+key+"'>"+rowContent+"</div></td>";
    }
    else if(key==="comment"){
        return "<td>"+getComment(rowContent, cellID, id, key, editable)+"</td>";
    }
    else if(key==="sectionID"){
        return "<td><div id=\"" + cellID + "\" class = '"+id+"' data-attribute-type = '"+key+"' hidden>"+getValueForHiddenSectionID(rowContent)+"</div>"+selectString+"</td>";
    }
    else{
        if(editable)
            return "<td><div id=\"" + cellID + "\" contenteditable=\"true\" class = '"+id+"' data-attribute-type = '"+key+"'>" + rowContent + "</></td>";
        else
            return "<td><div id=\"" + cellID + "\">"+rowContent+"</div></td>";
    }
}

function getTitleFromPaperID(jsonData, paperID){
    var item = getPaperFromPaperID(jsonData, paperID);
    if(item && item.length > 0)
        return item[0]["title"];
}

function getPaperFromPaperID(jsonPaperData, paperID){
    var items = [];
    if(jsonPaperData){
        for(var i=0; i<jsonPaperData.length ; i++){
            if(jsonPaperData[i]["id"] === paperID)
                items.push(jsonPaperData[i]);
        }
    }
    return items;
}

function getThoughtFromPaperID(jsonThoughtData, paperID){
    var items = [];
    if(jsonThoughtData){
        for(var i=0; i<jsonThoughtData.length ; i++){
            for(var t=0; t<jsonThoughtData[i]["paperID"].length ; t++){
                if(jsonThoughtData[i]["paperID"][t] === paperID)
                    items.push(jsonThoughtData[i]);
            }
        }
    }
    return items;
}

function generateTableHeader(headers, descriptions){
    var result = "";
    if(headers){
        for( var k=0; k<headers.length ; k++){
            result+= "<td class='table_header'><button class=\"tip\" onclick=\"sortTable("+k+")\">"+ capitalizeFirstLetter(headers[k]) + "<span class=\"description\">"+descriptions[k]+"</span></button></td>";
        }
    }
    result += "</tr>";
    return result;
}

function generateContent(obj, key){
    if(typeof obj === 'object'){
        if (key ==='section')
            return obj['name'];
        else if(key ==='comment')
            return obj;
        else if(Array.isArray(obj))
            return obj;
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

function selectAndAddNewData(context, id, value){
    storeItToHiddenSectionID(id, value);
    if(id!=='new') // when it comes to column update
        makeUpdate(context, id);
}

function storeItToHiddenSectionID(id, value){
    document.getElementById(id + '_sectionID').innerHTML = value;
}

function getValueForHiddenSectionID(text){
    if(text && text.length>0 && text !== 'unassigned')
        return text;
    else
        return "";
}

function getSelectOfSectionList(context, id, sectionList, value, isEditable){
    if(isEditable){
        var result = "<select id=\""+id+"_select\" onchange='selectAndAddNewData(\""+context+"\",\""+id+"\",this.value)'>";
        result += "<option selected disabled>unassigned</option>";
        for(var i=0; i< sectionList.length ; i++){
            if(value && value === sectionList[i].id)
                result+= "<option selected=\"selected\" value=\""+sectionList[i].id+"\">"+sectionList[i].name+"</option>";
            else
                result+= "<option value=\""+sectionList[i].id+"\">"+sectionList[i].name+"</option>";
        }
        return result + "</select>";
    }
    else{
        if(value){
            for(var i=0; i< sectionList.length ; i++){
                if(value === sectionList[i].id){
                    return sectionList[i].name;
                }
            }
        }
        return 'unassigned';
    }
}

function getComment(obj, itemId, id, key, isEditable){
    if(isEditable === true)
        return "<div id=\"" + itemId + "\" contenteditable=\"true\" class = '"+id+"' data-attribute-type = '"+key+"'>" + obj["content"] + "</div><div class='commenter'> by "+obj["commenter"]+"</div>" +getReactions(id, itemId, obj["reactions"]);
    else
        return "<div id=\"" + itemId + "\">"+obj["content"]+"</div>";
}

function collectPaperIDs(id, key, paperIdArray){
    var result = "";
    if(paperIdArray === undefined)
        return result;

    for(var i=0; i<paperIdArray.length; i++){

        result += "<a href='table.html?context=mine&paperID="+paperIdArray[i]+"' class = '"+id+"' data-attribute-type = '"+key+"'>"+ paperIdArray[i] + "</a>";
        if(i < paperIdArray.length-1)
            result += ", ";
    }
    return result;
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

function generateCellID(id, key){
    if(id === "new")
        return id + "_" + key;
    else if (id.includes("_")) // it already has randString
        return id + "_" + key;
    else
        return id + "_" + key + "_" + generateShortRand();
}

function isNotRelated(context, jsonDatum){
    if(context === "mine"){
        if(jsonDatum && jsonDatum['comment']['commenter'])
            if(jsonDatum['comment']['commenter'] !== getContributorFromLS())
                return true;
    }
    return false;
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

function getDescriptionsByContext(context, jsonData, isEditable){
    var descriptions = [];
    for(var k in jsonData) {
        if(isVisible(context, jsonData[k])){
            descriptions.push(jsonData[k]["description"]);
        }
    }
    if(isEditable === true)
        descriptions.push('To say good bye to data');
    return descriptions;
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
        for (i = 0; i < (rows.length - 1); i+=1) {
            if(hasClass(rows[i],'entry') === false)
                continue;
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            x = getPriority(rows[i].getElementsByTagName("TD")[numElement].children[0]);
            y = getPriority(rows[i + 1].getElementsByTagName("TD")[numElement].children[0]);
            //check if the two rows should switch place:
            if(x!==y && compareWithContext(x,y) ^ sortingState[numElement]){
                shouldSwitch = true;
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

    sortingState[numElement] = !sortingState[numElement];

}

function compareWithContext(x, y){
    if(typeof x === 'integer' || typeof x === 'number')
        return x > y;
    else{
        return x.toLowerCase().localeCompare(y.toLowerCase()) > 0;
    }

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