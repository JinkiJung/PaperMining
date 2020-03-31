let completePaperIDs = new Set();

function generateBibtexCopyBtn() {
    document.getElementById("dataEnterForm").innerHTML = "<button id=\"getBibtexBtn\" >Copy complete bibtexes</button>";
    var btn = document.getElementById("getBibtexBtn");

    // When the user clicks the button, open the modal
    btn.onclick = function() {
        var bibtexes = "";
        var paperIDs = Array.from(completePaperIDs);
        $.ajax({
            type: "GET",
            url: "../resources/json/data.json",
            dataType: "text",
            success: function (data) {
                var jsonData = JSON.parse(data);
                var papers = jsonData["papers"];
                var paperIDsWithEmptyBibtex= [];
                for(var i=0 ; i< paperIDs.length ; i++){
                    for(var t=0; t<papers.length ; t++){
                        if(papers[t].id === paperIDs[i]){
                            if(papers[t].bibtex.length < 1)
                                paperIDsWithEmptyBibtex.push(papers[t].title);
                            else
                                bibtexes += papers[t].bibtex + "\n";
                            break;
                        }
                    }
                }

                // warning of empty bibtex
                if(paperIDsWithEmptyBibtex.length>0)
                    alert("There were some bibtex missing from: \n" + paperIDsWithEmptyBibtex.join("\n"));
                setClipboard(bibtexes);
            }
        });
    }
}

function updateCompletePaperIDs(thought, toBeAdded){
    if(thought["paperID"]) {
        for (var i = 0; i < thought["paperID"].length; i++) {
            var paperID = thought["paperID"][i];
            if(toBeAdded===true)
                completePaperIDs.add(paperID);
            else if(toBeAdded===false)
                completePaperIDs.remove(paperID);
        }
    }
}