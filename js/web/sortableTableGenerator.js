function getTitle(jsonData, paperID){
    if(paperID !== 'null')
        return "[Paper Mining]<br>"+getTitleFromPaperID(jsonData["papers"], paperID);
    else
        return jsonData["projectName"]
}

function generateTable(context, projectName, jsonData, jsonSchema){
    var result = "";
    var trStyle = "";
    /*
    if(type !== 'papers')
        trStyle = "class=\"nodrop nodrag\"";
     */
    result += "<table id=\"sortableTable\"><tr "+trStyle+">";

    var headers = [];
    if(context === 'collect')
        headers = getKeysByContext(context, jsonSchema["paper"]["properties"]);
    else
        headers = getKeysByContext(context, jsonSchema["thought"]["properties"]);

    // header
    result += generateTableHeader(headers);
    // new entry
    generateDataEnterForm(headers);

    result += generateTableBody(jsonData, headers);
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
    else
        return obj;
}

function generateForm(obj, key){
    var htmlElement = "p";
    var rowId = generateRowID(obj, key);
    var rowContent = generateContent(obj, key);
    if(typeof obj === "boolean")
        return "<td><input type='checkbox' id=\"" + rowId + "\" value = " + rowContent + "></input></td>";
    else if(key==="id" || key ==='paperID')
        return "<td><a href='table.html?context=mine&paperID="+obj+"'>"+ rowContent + "</a></td>";
    else if(key==="bibtex")
        return "<td><button id=\"" + rowId + "\" value = " + rowContent + " onclick=\"setClipboard('"+rowContent+"')\">Copy</button></td>";
    else if(key==="pdf")
        return "<td><a href='../resources/pdf/'"+rowContent+"'>Open</a></td>";
    else
        return "<td><textarea id=\"" + rowId + "\" >" + rowContent + "</textarea></td>";
        //return "<td><p id='"+rowId+"'>"+rowContent+"</p></td>";
}

function generateDeleteButton(){
    return "<td><button onclick=\"setClipboard('GG')\">Delete</button></td>";
}

function generateRowID(obj, key){
    if(obj)
        return obj + "_" + key;
}

function generateRow(jsonDatum, key) {
    if(key === 'delete')
        return generateDeleteButton();
    if (jsonDatum === undefined || key === undefined || jsonDatum[key] === undefined)
        return "";
    return generateForm(jsonDatum[key], key);
}

function generateTableBody(jsonData, keys){
    var result = "";
    for(var t=0; t < jsonData.length; t++) {
        result += "<tr class=\"new_entry\">";
        for (var k = 0; k < keys.length; k++) {
            result += generateRow(jsonData[t], keys[k]);
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

function compareWithContext(x,y,priorityMap){
    if(priorityMap.size>0){
        var xValue = priorityMap.get(x);
        var yValue = priorityMap.get(y);
        return (xValue==undefined?9999:xValue)>(yValue==undefined?9999:yValue);
    }
    else
        return x > y;
}

function checkUpdated(dateString){

    if(dateString==undefined)
        return 0;
    var time = dateString.split('/');
    var today = new Date();
    var paperDate = new Date(time[0], Number(time[1]) - 1, time[2]);
    var betweenDay = (today.getTime() - paperDate.getTime()) / 1000/60/60/24;

    if(betweenDay <= 12) return 1;
    else return 0;
}

function getUUID(type, id, label){
    return type+"_"+id+"_"+label;
}

function getUpdateButton(projectName, type, id, label){
    return "<button id=btn_"+getUUID(type,id,label)+" class='rowSubmitButton' onclick=\"passOneParameter('"+projectName+"',undefined,"+getUUID(type,id,label)+")\">Update</button>";
}

function generateDataRows(type, projectName, data, headers){
    var result = "";
    var dateIndex = headers.indexOf("timestamp");
    var commentIndex = headers.indexOf("comment");
    var tagIndex = headers.indexOf("tag");

    for (var i=data.length-1; i>=1; i--) {
        var dataLine = "";
        var dataRow = data[i];
        var shouldHighlighted = checkUpdated(dataRow[dateIndex]);
        var id = i;

        if(type =='tag'){
            var tagName = ("_"+dataRow[tagIndex]).replace(" ","_");
            dataLine += "<tr class=\"_tag "+tagName+"\">";
        }
        else{
            var tags = getPaperTags(i);
            dataLine += "<tr class=\"clickable _tag "+tags+"\">";
        }

        for(var k=0; k<dataRow.length ; k++){
            var label = headers[k];
            if(k==0){
                id = dataRow[k];
                dataLine+= "<td style=\"display:none;\">"+ dataRow[k] + "</td>";
            }
            else{
                var highLightStyle = "";
                if(shouldHighlighted)
                    highLightStyle ="class='highlight'";

                // last element
                if(k==dataRow.length-1){
                    if(type == 'tag')
                        dataLine += "<td><a href=\"detail.html?proj="+projectName+"&id="+dataRow[k]+"\">"+dataRow[k]+"</a></td>";
                    else
                        dataLine += "<td "+"><a href=\"detail.html?proj="+projectName+"&id="+(id)+"\">paper detail</a></td>";
                }
                else
                {
                    if(type == 'tag'){
                        if(k==commentIndex)
                            dataLine+= "<td class=unselectable><a onclick = \"setClipboard('"+ dataRow[k]+"')\">"+dataRow[k] + "</a></td>";
                        else
                            dataLine+= "<td class=unselectable>"+ dataRow[k] + "</td>";
                    }
                    else{
                        if(label =='timestamp')
                            dataLine+= "<td "+"><div id="+getUUID("paper",id,label)+" contenteditable=\"true\">"+ convertUTCDateToLocalDate(dataRow[k]) + "</div><br>" + getUpdateButton(projectName, "paper",i,label)+"</td>";
                        else
                            dataLine+= "<td "+"><div id="+getUUID("paper",id,label)+" contenteditable=\"true\">"+ dataRow[k] + "</div><br>" + getUpdateButton(projectName, "paper",i,label)+"</td>";
                    }
                }
            }
        }
        result += dataLine + "</tr>";
    }
    return result;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getAllKeys(jsonData){
    var keys = [];
    for(var k in jsonData) keys.push(k);
    return keys;
}

function getKeysByContext(context, jsonData){
    var keys = [];
    for(var k in jsonData) {
        for(var t in jsonData[k]) {
            if(t === '_visible' && jsonData[k][t]["default"].includes(context)){
                keys.push(k);
            }
        }
    }
    keys.push('delete');
    return keys;
}

function zeroPad(nr,base){
    var  len = (String(base).length - String(nr).length)+1;
    return len > 0? new Array(len).join('0')+nr : nr;
}

function convertUTCDateToLocalDate(string) {
    var timestamp = string.split('/');
    var date = new Date(Date.UTC(Number(timestamp[0]), Number(timestamp[1]-1), Number(timestamp[2]),
        Number(timestamp[3]), Number(timestamp[4]), Number(timestamp[5])));
    var datevalues = [
        zeroPad(date.getFullYear(),1000),
        zeroPad(date.getMonth()+1,10),
        zeroPad(date.getDate(),10),
        zeroPad(date.getHours(),10),
        zeroPad(date.getMinutes(),10),
        zeroPad(date.getSeconds(),10)
    ];
    return datevalues.join('/');
}

function getPaperDetail(index, columnLength){

    var paperTagInfo="";
    var paperDetail = "";
    if(tagArray[index]!=undefined && tagArray[index].length!=undefined){
        for(var k=0; k<tagArray[index].length ; k++){
            // should be refined
            paperDetail += "<b>["+tagArray[index][k][1] + "]\t";
            paperDetail += "["+tagArray[index][k][3] + "]</b><br>";
            paperDetail += tagArray[index][k][2] + " - by " + tagArray[index][k][4]+", " + tagArray[index][k][5]+"<br>";
        }
    }
    paperTagInfo += "<tr class=\"content\"><td colspan="+columnLength+">"+paperDetail+"</td></tr>";
    return paperTagInfo;
}

//////////////////////////////////// tag part ////////////////////////////////////

function getMaxPaperID(data){
    var maxID = 0;
    for (var i=1; i<data.length; i++) {
        var paperID = data[i][data[i].length-1] * 1;
        if(paperID > maxID)
            maxID = paperID;
    }
    return maxID;
}

function generateTagArray(data) {
    tagArray = new Array(getMaxPaperID(data)+1);
    for (var i=1; i<data.length; i++) {
        var paperID = data[i][data[i].length-1];
        if(tagArray[paperID]!=undefined){
            tagArray[paperID].push(data[i]);
        }
        else{
            var tempArray = new Array();
            tempArray.push(data[i]);
            tagArray[paperID] = tempArray;
        }
    }
    return tagArray;
}
