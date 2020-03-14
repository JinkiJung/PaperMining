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

                    var paperID = getURLParameter("paperID");

                    document.getElementById("title").innerHTML = "<center><H3>"+getTitle(jsonData, paperID)+"</H3></center>";
                    if(context === 'mine'){
                        document.getElementById("dataTable").innerHTML = generateTable(context,title, getThoughtFromPaperID(jsonData["thoughts"],paperID), jsonSchema["definitions"]);
                    }
                    else{
                        document.getElementById("dataTable").innerHTML = generateTable(context,title, jsonData[contextToData(context)], jsonSchema["definitions"]);
                    }

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
                                //$(this)[0].innerHTML = storedText;
                                location.reload();
                            }
                        }
                    });

                    $('input[type=checkbox]').click(function(){
                        try{
                            makeUpdate($(this)[0]);
                        }
                        catch (e) {
                            alert(e.message);
                            //$(this)[0].innerHTML = storedText;
                            location.reload();
                        }
                    });
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
