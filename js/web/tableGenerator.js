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
                    if(context === 'mine'){
                        document.getElementById("dataTable").innerHTML = generateTable(context,title, getThoughtFromPaperID(jsonData["thoughts"],paperID), jsonSchema["definitions"], !accessedFromGitHub());
                    }
                    else{
                        document.getElementById("dataTable").innerHTML = generateTable(context,title, jsonData[contextToData(context)], jsonSchema["definitions"], !accessedFromGitHub());
                    }

                    if(!accessedFromGitHub()){
                        updateByFocusOut();
                        fetchBibtexByFocusOut();
                    }
                    if(context === 'carve' || context === 'plant') {
                        //////////////////////////////////////////////////////////////////////////////////////////
                        sortTable(1); // order
                        //////////////////////////////////////////////////////////////////////////////////////////
                    }
                    if(context === 'carve'){
                        enableDragAndDrop();
                    }
                }
            });
        }
    });
});

function getJsonDatum(id, order){
    return {"id": id, "order": order};
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

function enableDragAndDrop(){
    $("tbody").tableDnD({
        onDragClass: "myDragClass"
    });
    $("tbody").bind("DOMSubtreeModified", function() {

    });
    $("tbody").mouseup(function(){
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
        console.log($(this).val());
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
                makeUpdate($(this)[0]);
            }
            catch (e) {
                alert(e.message);
            }
        }
    });

    $('input[type=checkbox]').click(function(){
        try{
            makeUpdate($(this)[0]);
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