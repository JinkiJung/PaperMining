function generateDataEnterForm(context, headers){
    if(context === 'carve' || context === 'plant')
        return ;
    document.getElementById("dataEnterForm").innerHTML = generateNewEntry(context, headers);
    var modal = document.getElementById('myModal');
    // Get the button that opens the modal
    var btn = document.getElementById("newEntryBtn");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    initializeInputFields(context);

    // When the user clicks the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
        if(getURLParameter("context")!==undefined)
            initializeInputFields(getURLParameter("context"));
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

function generateShortRand(){
    return Math.random().toString(36).substr(2, 7);
}

function initializeInputFields(context){
    // give random paperID
    document.getElementById("new_id").value = contextToDefinition(context)+ '_' + generateShortRand();

    if(document.getElementById("new_importance"))
        document.getElementById("new_importance").value = 0;

    if(document.getElementById("new_section"))
        document.getElementById("new_section").value = "unassigned";

    // set contributor's name from local
    if(document.getElementById("new_contributor") && hasLocalUserName())
        document.getElementById("new_contributor").value = getContributorFromLS();
}

function generateNewEntry(context, header){
    var result = "<button id=\"newEntryBtn\" >Add new</button>";
    result += "<div id=\"myModal\" class=\"modal\">";
    result += "<div class=\"modal-content\">";
    result += "<span class=\"close\">&times;</span>";
    result += generateNewEntryCore(context, header);
    result += "</div></div>";
    return result;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function drawConfirmCircle(color) {
    var canvas = document.getElementById("imgCanvas");
    var context = canvas.getContext("2d");
    var rect = canvas.getBoundingClientRect();
    var posx = e.clientX - rect.left;
    var posy = e.clientY - rect.top;

    context.fillStyle = color;
    context.beginPath();
    context.arc(posx, posy, 50, 0, 2 * Math.PI);
    context.fill();
}

function createPDFUploadPopup(rowId){
    return "<a href=\"#\" onClick=\"passTitle(); return false;\">Upload</a><noscript>You need Javascript to use the previous link or use <a href=\"index.html\" target=\"_blank\">Upload</a></noscript><textarea readonly class='new_input_field' id=\"" + rowId + "\" ></textarea>";
}

function generateNewEntryCore(context, header){
    var result = "<table>";
    //*
    for(var k=0; k<header.length; k++){
        result +="<tr>";
        var textValue="";

        result += "<td class=table_title width=10><b>"+capitalizeFirstLetter(header[k])+"</b></td>";
        result += generateForm("new",undefined, header[k]);
        result +="</tr>";
    }
    var paperID = getURLParameter("paperID");
    if(paperID)
        result += "<tr><td colspan=2><button id=\"submit_\" onclick='addNewData(\""+String(context)+"\", \""+String(paperID)+"\")'>Submit</button> ";
    else
        result += "<tr><td colspan=2><button id=\"submit_\" onclick='addNewData(\""+String(context)+"\")'>Submit</button> ";
    result += "<button onclick='clearInputField()'>Clear</button></td></tr>";
    result += "</table>";
    return result;
}

function addNewData(context, paperID){
    var jsonDatum = collectDatum(context, paperID);
    if(jsonDatum)
        registerValidDatum(context, jsonDatum, "store");
}

function hasLocalUserName(){
    var userName = getContributorFromLS();
    if(userName && userName.length > 0)
        return true;
    else
        return false;
}

function collectDatum(context, paperID) {
    if(!hasLocalUserName())
    {
        alert("The contributor's name is empty. Move to Home page and enter your name.");
        return undefined;
    }
    var newJsonDatum = {};
    var fieldNames = document.getElementsByClassName('new_input_field');
    for(var i=0; i<fieldNames.length ; i++){
        //if(fieldNames[i].value){
            var attributeName = fieldNames[i].id.substring(4);
            if(attributeName === 'comment')
                newJsonDatum[attributeName] = {"content":fieldNames[i].value, "commenter":getContributorFromLS(), "timestamp":"time"};
            // should be generalized //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            else if(attributeName === 'importance')
                newJsonDatum[attributeName] = parseFloat(fieldNames[i].value);
            else if(attributeName === 'toPlant')
                newJsonDatum[attributeName] = fieldNames[i].checked;
            // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            else
                newJsonDatum[attributeName] = fieldNames[i].value;
        //}
    }
    // add order attribute
    newJsonDatum['order'] = -1;
    newJsonDatum['written'] = false;
    newJsonDatum['toPlant'] = false;
    if(context === 'collect'){
        newJsonDatum['timestamp'] = ""; // dummy timestamp
        newJsonDatum['contributor'] = getContributorFromLS();
    }
    else if(context === 'mine'){
        if(paperID){
            if(newJsonDatum['paperID']===undefined)
                newJsonDatum['paperID'] = [];
            newJsonDatum['paperID'].push(paperID);
        }
        if(newJsonDatum['importance'] === "")
            newJsonDatum['importance'] = 0;
        if(newJsonDatum['comment']){
            newJsonDatum['comment']['commenter'] = getContributorFromLS();
            newJsonDatum['comment']['timestamp'] = ""; // dummy timestamp
        }
    }
    return newJsonDatum;
}

function validateDatum(context, schema, data, command = undefined) {
    var ajv = new Ajv;
    var valid = ajv.validate(schema, data);
    if (!valid) { alert(getAjvErrorMessages(ajv.errors)); location.reload(); return false; }
    else if(command)
        sendJsonDatum(context, data, command);
    return true;
}

function sendJsonDatum(context, data, command){
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
            location.reload();
            ////////////////// TO DO: refresh /////////////////////
            //$("#dataTable").load(window.location.href+"#dataTable" );
        }
    };
}

function getAjvErrorMessages(errors){
    var message = "";
    for(var i=0; i<errors.length ; i++){
        message += "Given input " + errors[i].message;
        if(i!==errors.length-1)
            message += "\n";
    }
    return message;
}

function registerValidDatum(context, jsonDatum, command = undefined){
    $.ajax({
        type: "GET",
        url: "../json/schema/paperMining.json",
        dataType: "text",
        success: function (data) {
            var schemaData = JSON.parse(data);
            var result = validateDatum(context, schemaData["definitions"][contextToDefinition(context)], jsonDatum, command);
        },
        fail: function (data) {
            alert("Error in loading json schema.");
        }
    });
}

function createTextArea(type, textValue){
    return "<textarea onBlur=\"checkEntry('new_paper_"+type+"');\" style=\"border: none; width: 100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;\" id=\"new_paper_"+type+"\" cols=\"20\">"+textValue+"</textarea>";
}

function createBibButtons(){
    return "<button onclick=\"passNewEntryParameter('title2bibtex','title='+getTextareaContent('new_paper_title'));\">Get bib</button><span id = \"status\"></span>";
}

function clearInputField(){
    var fieldNames = document.getElementsByClassName('new_input_field');
    for(var i=0; i<fieldNames.length ; i++) {
        if (fieldNames[i].value) {
            fieldNames[i].value = "";
        }
    }
}

function checkBibTexEntry(entered){
    applyBib($("#"+entered).val());
    checkEntry(entered);
}

function checkEntry(entered){

    if($("#"+entered).val().length>0 || $("#"+entered).val()=="[enter new user name]"){
        document.getElementById(entered+"_img").src = "../asset/confirm.png";
    }
    else{
        document.getElementById(entered+"_img").src = "../asset/undefined.png";
    }
}


function getTitleFromTextArea(){
    return $("#new_title").val();
}

function setPDFFilePath(text){
    document.getElementById("new_pdf").value = text;
}

function passTitle(){
    var title = getTitleFromTextArea();
    if(title && title.length > 0){
        window.open('http://'+defaultConfig.web.url+':'+defaultConfig.web.port+'/uploadPDF?title='+title,'pagename','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable,height=240,width=500');
        //return true;
    }
    else
        alert("Please enter the paper title before uploading it.");
}
