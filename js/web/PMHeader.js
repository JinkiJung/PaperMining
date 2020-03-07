function insertPMHeader(){
    var homeButton ="<input class=\"home_button\" type=\"button\" value=\"Home\" onClick=\"location.href='../index.html'\">";
    var collectButton ="<input class=\"top_button\" type=\"button\" value=\"Collect: See all papers\" onClick=\"location.href='table.html?context=collect'\">";
    var carveButton ="<input class=\"top_button\" type=\"button\" value=\"Carve: See all thoughts\" onClick=\"location.href='table.html?context=carve'\">";
    var plantButton ="<input class=\"top_button\" type=\"button\" value=\"Plant: See final result\" onClick=\"location.href='table.html?context=plant'\">";
    return homeButton+collectButton+carveButton+plantButton+"<br>";
}

document.getElementById("pmHeader").innerHTML = insertPMHeader();
