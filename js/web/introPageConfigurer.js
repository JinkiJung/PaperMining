var userEntry = document.getElementById("contributor_local");
userEntry.innerHTML = ""+getContributorFromLS();

var focused_value = "";
var focused_id = "";
$('div[contenteditable=true]').focus(function() {
    focused_id = $(this)[0].id;
    focused_value = $(this)[0].innerHTML;
});

$('div[contenteditable=true]').blur(function() {

    if(focused_id === $(this)[0].id && focused_value !== $(this)[0].innerHTML)
    {
        var context = "";
        if(focused_id === "project_title")
            context = "title";
        else if(focused_id === "project_abstract")
            context = "abstract";
        else if(focused_id === "contributor_local")
            context = "user name";
        if(checkElement(focused_id, context)){
            if(focused_id === "contributor_local")
                saveUserName(id);
            else
                sendMetadataUpdate(context, $(this)[0].innerHTML);
        }
        focused_id = "";
        focused_value = "";
    }
    //if(doesHaveUserName())
        //saveUserName("contributor_local");
});

function checkAndForward(){
    if(doesHaveProjectTitle() && doesHaveProjectAbstract() && doesHaveUserName())
        window.location.href = "./html/table.html?context=collect";
}

function doesHaveProjectTitle(){
    return checkElement("project_title", "title");
}

function doesHaveProjectAbstract(){
    return checkElement("project_abstract", "abstract");
}

function doesHaveUserName(){
    return checkElement("contributor_local", "user name");
}

function checkElement(id, context){
    if(accessedFromGitHub())
        return true;
    var content = document.getElementById(id).textContent;
    if(content.length ===0){
        alert("You must enter "+context+".");
        $("#"+id).effect("highlight", {}, 5000);
        return false;
    }
    else
        return true;
}

function accessedFromGitHub(){
    return window.location.href.toLowerCase().includes("github");
}

if(accessedFromGitHub()){
    document.getElementById("project_title").innerHTML = "PaperMining blank project";
    document.getElementById("project_abstract").innerHTML = "This example is made to give you a better understanding how it works."
}
else{
    // load project file
    $.ajax({
        type: "GET",
        url: "./resources/json/data.json",
        dataType: "text",
        success: function (data) {
            var jsonData = JSON.parse(data);
            document.getElementById("project_title").innerHTML = jsonData["title"];
            document.getElementById("project_abstract").innerHTML = jsonData["abstract"];
        }
    });
}
