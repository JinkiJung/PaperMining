function generateSectionManageForm(context, header, descriptions, sections){
    if(context === 'collect' || context === 'plant')
        return ;
    document.getElementById("sectionManageForm").innerHTML = generateSectionForm(header, descriptions, sections);
    var modal = document.getElementById('sectionModal');
    // Get the button that opens the modal
    var btn = document.getElementById("sectionManageBtn");
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
        location.reload();
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            location.reload();
        }
    };
}

function generateSectionForm(header, descriptions, sections){
    var buttonName = "Manage section";
    var result = "<button id=\"sectionManageBtn\" >"+buttonName+"</button>";
    result += "<div id=\"sectionModal\" class=\"modal\">";
    result += "<div class=\"modal-content\">";
    result += "<span class=\"close\">&times;</span>";
    result += generateSectionTable(header, descriptions, sections);
    result += "</div></div>";
    return result;
}

function getHeader(jsonData){
    var keys = [];
    for(var k in jsonData) {
        keys.push(k);
    }
    return keys;
}

function addNewSectionRow(headerString){
    var headers = headerString.split(':');
    var newSectionID = getDataIDWithRand("section");

    // add dummy section data
    var jsonDatum = getDefaultJsonByType("section", newSectionID);
    jsonDatum['order'] = document.getElementById("sectionTable").rows.length-1;
    updateWithCompleteJsonDatum("section", jsonDatum, "store", false);

    createNewSectionRow(newSectionID, headers);
}

function createNewSectionRow(newSectionID, headers){
    // new entry
    var table = document.getElementById("sectionTable");
    var row = table.insertRow(table.rows.length-1);

    var sections = [];
    for(var i=1; i<table.rows.length-2 ; i++){
        sections.push({id:table.rows[i].cells[0].textContent, name:table.rows[i].cells[1].textContent});
    }
    var selectString = generateSectionIDSelection("section", newSectionID, sections, "", newSectionID,"sectionIDofParent",true);
    for(var k=0; k<headers.length; k++){
        if(headers[k] === 'id')
            row.insertCell(k).innerHTML = generateForm(newSectionID, newSectionID, headers[k],false, false, selectString);
        else if(headers[k] === 'order')
            row.insertCell(k).innerHTML = generateForm(newSectionID, table.rows.length-2, headers[k],true, false, selectString);
        else
            row.insertCell(k).innerHTML = generateForm(newSectionID, "", headers[k],true, false, selectString);
    }

    new SlimSelect({
        select: '#'+newSectionID + "_section_select"
    });

    updateByFocusOut();
    /*
    $('#'+generateCellID(newSectionID,"name")).focusout(function(){
        try{
            makeUpdate("section", newSectionID);
        }
        catch (e) {
            alert(e.message);
        }
    });

     */
}

function generateSectionTable(headers, descriptions, sections){
    var result = "<table id='sectionTable'>";
    //*

    result += generateTableHeader(headers, descriptions);
    for(var t=0; t<sections.length ; t++){
        result += "<tr class=\"entry\">";
        var id = sections[t].id;

        var selectString = generateSectionIDSelection("section", id, sections, sections[t]["sectionIDofParent"], id,"sectionIDofParent",true);

        for(var k=0; k<headers.length; k++){
            if(headers[k] === 'id')
                result += generateForm(id, sections[t][headers[k]], headers[k],false, false, selectString);
            else
                result += generateForm(id, sections[t][headers[k]], headers[k],true, false, selectString);
        }
        result += "</tr>";
    }

    result += "<tr><td colspan='"+headers.length+"'><center><button onclick='addNewSectionRow(\""+headers.join(':')+"\")'>Add new section</button></center></td></tr>";

    result += "</table>";
    return result;
}