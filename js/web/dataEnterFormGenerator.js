function generateDataEnterForm(context, headers, descriptions, sections){
    if(context === 'plant')
        return ;
    document.getElementById("dataEnterForm").innerHTML = generateNewEntry(context, headers, descriptions, sections);
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

function getDataIDWithRand(dataType){
    return dataType+ '_' + generateShortRand();
}

function initializeInputFields(context){
    // give random paperID
    document.getElementById("new_id").value = getDataIDWithRand(contextToDefinition(context));

    if(document.getElementById("new_importance"))
        document.getElementById("new_importance").value = 0;

    if(document.getElementById("new_section"))
        document.getElementById("new_section").value = "unassigned";

    // set contributor's name from local
    if(document.getElementById("new_contributor") && hasLocalUserName())
        document.getElementById("new_contributor").value = getContributorFromLS();

    if(document.getElementById("new_order"))
        document.getElementById("new_order").value = -1;
}

function generateNewEntry(context, header, descriptions, sections){
    var buttonName = "Add " + contextToDefinition(context);
    if(context === 'carve')
        buttonName += " without reference";
    var result = "<button id=\"newEntryBtn\" >"+buttonName+"</button>";
    result += "<div id=\"myModal\" class=\"modal\">";
    result += "<div class=\"modal-content\">";
    result += "<span class=\"close\">&times;</span>";
    result += generateNewEntryCore(context, header, descriptions, sections);
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

function createPDFUploadPopup(key, rowId){
    return "<a href=\"#\" onClick=\"passTitle(); return false;\">Upload</a><noscript>You need Javascript to use the previous link or use <a href=\"index.html\" target=\"_blank\">Upload</a></noscript><textarea readonly class='new' id=\"" + rowId + "\" data-attribute-type = '"+key+"'></textarea>";
}

function generateNewEntryCore(context, headers, descriptions, sections){
    var result = "<table>";
    //*
    var id = 'new';
    var selectString = generateSectionIDSelection(context, id, sections, undefined, undefined, "sectionID",true);

    for(var k=0; k<headers.length; k++){
        result +="<tr>";
        result += generateTableHeaderCell(headers[k], descriptions[k], k);
        result += generateForm(id,undefined, headers[k],true, false, selectString);
        result +="</tr>";
    }
    result += "<tr><td colspan=2><button id=\"submit_\" onclick='addNewData(\""+String(context)+"\")'>Submit</button> ";
    result += "<button onclick='clearInputField()'>Clear</button></td></tr>";
    result += "</table>";
    return result;
}

function addNewData(context){
    var jsonDatum = collectDatum(context);
    if(jsonDatum)
        updateWithCompleteJsonDatum(context, jsonDatum, "store");
}

function hasLocalUserName(){
    var userName = getContributorFromLS();
    if(userName && userName.length > 0)
        return true;
    else
        return false;
}

function collectDatum(context) {
    if(!hasLocalUserName())
    {
        alert("The contributor's name is empty. Move to Home page and enter your name.");
        return undefined;
    }
    //var newJsonDatum = getDefaultJsonByType(contextToDefinition(context));
    var fieldNames = document.getElementsByClassName('new');

    return convertToJson(context, 'new', fieldNames);
}

function validateDatum(context, schema, data, command = undefined, doRefresh) {
    var ajv = new Ajv;
    var valid = ajv.validate(schema, data);
    if (!valid) {
        alert(getAjvErrorMessages(ajv.errors));
        return false;
    }
    else if(command)
        sendJsonDatum(context, data, command, doRefresh);
    return true;
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

function updateWithCompleteJsonDatum(context, jsonDatum, command = undefined, doRefresh = true){
    $.ajax({
        type: "GET",
        url: "../json/schema/paperMining.json",
        dataType: "text",
        success: function (data) {
            var schemaData = JSON.parse(data);
            var result = validateDatum(context, schemaData["definitions"][contextToDefinition(context)], jsonDatum, command, doRefresh);
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
    var fieldNames = document.getElementsByClassName('new');
    for(var i=0; i<fieldNames.length ; i++) {
        if (fieldNames[i].value) {
            fieldNames[i].value = "";
        }
    }
    var context = getURLParameter("context");
    initializeInputFields(context);
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

function setPDFFilePath(filePath){
    document.getElementById("new_pdf").value = filePath;
}

function getTitleFromTextArea(){
    return $("#new_title").val();
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

function enableSlimSelect(){
    var slimSelectElements = document.getElementsByClassName('slimSelectPM');
    for(var i=0; i<slimSelectElements.length ; i++){
        if(slimSelectElements[i].type === 'select-one' || slimSelectElements[i].type === 'select-multiple'){
            new SlimSelect({
                select: '#'+slimSelectElements[i].id
            })
        }
    }
}
