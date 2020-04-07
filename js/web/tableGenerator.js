$(document).ready(function() {
    // load paper mining json schema file
    $.ajax({
        type: "GET",
        url: "../json/schema/paperMining.json",
        dataType: "text",
        success: function (schemaData) {
            var jsonSchema = JSON.parse(schemaData);

            // load project file
            $.ajax({
                type: "GET",
                url: "../resources/json/data.json",
                dataType: "text",
                success: function(data) {
                    var jsonData = JSON.parse(data);
                    var context = getURLParameter("context");
                    if(context==='null')
                        context = 'collect';

                    if(context === 'plant')
                        jsonData[contextToData(context)] = filterForPlant(jsonData[contextToData(context)]);

                    var paperID = getURLParameter("paperID");

                    document.getElementById("title").innerHTML = "<center><H3>"+getTitle(jsonData, paperID)+"</H3></center>";

                    var sections = getSafeJsonData(jsonData['sections']);
                    var papers = getSafeJsonData(jsonData['papers']);

                    if(context === 'mine'){
                        document.getElementById("dataTable").innerHTML = generateTable(context, getThoughtFromPaperID(jsonData["thoughts"],paperID), jsonSchema["definitions"], sections, !accessedFromGitHub());
                    }
                    else{
                        document.getElementById("dataTable").innerHTML = generateTable(context, getSafeJsonData(jsonData[contextToData(context)]), jsonSchema["definitions"], sections, !accessedFromGitHub(), papers);
                    }

                    enableSlimSelect();

                    if(!accessedFromGitHub()){
                        updateByFocusOut();
                        fetchBibtexByFocusOut();
                    }
                    if(context === 'plant') {
                        //////////////////////////////////////////////////////////////////////////////////////////
                        sortTable(0); // order
                        //////////////////////////////////////////////////////////////////////////////////////////
                    }
                    else if(context === 'carve'){
                        //////////////////////////////////////////////////////////////////////////////////////////
                        sortTable(1); // order
                        //////////////////////////////////////////////////////////////////////////////////////////
                        enableDragAndDrop();
                    }
                }
            });
        }
    });
});

function getEmojiPopup(button){
    const picker = new EmojiButton();
    picker.togglePicker(button);
    picker.on('emoji', emoji => {
        console.log(button.dataset.referenceInput);
        document.querySelector('#'+button.dataset.referenceInput).innerHTML = "<button class=\"hbtn\">"+emoji+"1</button>" +getEmojiButton(button.dataset.referenceInput);
    });
}

function getSafeJsonData(jsonData){
    if(jsonData=== undefined)
        return [];
    else
        return jsonData;
}

function getJsonDatum(id, order){
    return {"id": id, "order": order};
}

function enableDragAndDrop(){
    $("#sortableTable").tableDnD({
        onDragClass: "myDragClass"
    });
    $("#sortableTable").bind("DOMSubtreeModified", function() {

    });
    $("#sortableTable").mouseup(function(){
        var context = getURLParameter("context");
        var needToUpdate = updateOrderAttribute($(this)[0]);
        for(var i=0; i<needToUpdate.length ; i++){
            registerValidDatum(context, needToUpdate[i], "update");
        }
    });
}

function filterForPlant(jsonData){
    if(jsonData === undefined)
        return [];
    var filteredJsonData = [];
    for(var i=0; i<jsonData.length ; i++){
        if(jsonData[i]["toPlant"]===true)
            filteredJsonData.push(jsonData[i]);
    }
    return filteredJsonData;
}

function fetchBibtexByFocusOut(){
    $('#new_title').focusout(function() {
        //console.log($(this).val());
    });
}

function updateByFocusOut(){
    var storedText = "";
    $('div[contenteditable=true]').focusin(function(){
        storedText = $(this)[0].innerHTML;
    });
    $('div[contenteditable=true]').focusout(function(){
        if($(this)[0].innerHTML !== storedText){
            try{
                makeUpdateByElement($(this)[0]);
            }
            catch (e) {
                alert(e.message);
            }
        }
    });

    $('input[type=checkbox]').click(function(){
        try{
            makeUpdateByElement($(this)[0]);
        }
        catch (e) {
            alert(e.message);
        }
    });
}

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function accessedFromGitHub(){
    return window.location.href.toLowerCase().includes("github");
}