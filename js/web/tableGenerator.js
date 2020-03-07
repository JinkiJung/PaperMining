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
                url: "../resources/json/test.json",
                dataType: "text",
                success: function(data) {
                    var jsonData = JSON.parse(data);
                    var context = getURLParameter("context");
                    if(context==='null')
                        context = 'collect';

                    var paperID = getURLParameter("paperID");

                    document.getElementById("title").innerHTML = "<center><H3>"+getTitle(jsonData, paperID)+"</H3></center>";
                    if(context === "collect"){
                        document.getElementById("dataTable").innerHTML = generateTable(context,title, jsonData["papers"], jsonSchema["definitions"]);
                    }
                    else if(context === 'mine'){
                        document.getElementById("dataTable").innerHTML = generateTable(context,title, getThoughtFromPaperID(jsonData["thoughts"],paperID), jsonSchema["definitions"]);
                    }
                    else{
                        document.getElementById("dataTable").innerHTML = generateTable(context,title, jsonData["thoughts"], jsonSchema["definitions"]);
                    }

                    /*
                    labelDescription = generateLabel("Paper", csvDataText);
                    labelPriorityMaps = getLabelPriorityMap("Paper",csvDataText);

                    document.getElementById("paperList").innerHTML = generateTable("paper", projectName, parseText(csvData),labelDescription);

                    $(".new_entry").hide();
                    $(".expandNewEntry").click(function () {
                        $(".new_entry").show("fast");
                    });

                    $("button").each(function( index ) {
                        if($(this).hasClass("rowSubmitButton"))
                            $(this).hide();
                    });

                    $('div[contenteditable=true]').focusin(function(){
                        $("#btn_"+this.id).show("fast");
                    });
                    $('div[contenteditable=true]').focusout(function(){
                        $("#btn_"+this.id).delay(1500).hide("fast");
                    });

                    $('div[contenteditable=true]').keydown(function(e) {
                        // trap the return key being pressed
                        if (e.keyCode == 13) {
                            // insert 2 br tags (if only one br tag is inserted the cursor won't go to the second line)
                            //document.execCommand('insertHTML', false, '<br><br>');
                            // prevent the default behaviour of return key pressed
                            //console.log($(this).attr('id')+"\t"+$(this).html());

                            passOneParameter(projectName, $(this));
                        }
                    });

                    generateNewEntryInterface(csvDataText); // from newEntryInterface.js

                     */
                }
            });
        }
    });
});

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}
