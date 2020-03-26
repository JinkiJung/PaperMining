function insertPMHeader(context){
    var collectClass = "top_button";
    var carveClass = "top_button";
    var plantClass = "top_button";
    if(context === 'collect')
        collectClass = "top_button_chosen";
    else if(context === 'carve')
        carveClass = "top_button_chosen";
    else if(context === 'plant')
        plantClass = "top_button_chosen";
    var homeButton ="<input class=\"home_button\" type=\"button\" value=\"Home\" onClick=\"location.href='../index.html'\">";
    var collectButton ="<input class=\""+collectClass+"\" type=\"button\" value=\"Collect: See all papers\" onClick=\"location.href='table.html?context=collect'\">";
    var carveButton ="<input class=\""+carveClass+"\" type=\"button\" value=\"Carve: See all thoughts\" onClick=\"location.href='table.html?context=carve'\">";
    var plantButton ="<input class=\""+plantClass+"\" type=\"button\" value=\"Plant: See final result\" onClick=\"location.href='table.html?context=plant'\">";
    return homeButton+collectButton+carveButton+plantButton+"<br>";
}

document.getElementById("pmHeader").innerHTML = insertPMHeader(getURLParameter("context"));

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}