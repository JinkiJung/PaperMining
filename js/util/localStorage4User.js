function setContributorToLS(value){
    if(typeof(Storage)!=="undefined")
    {
        localStorage.setItem("contributor_local" , value);
    }
}

function getContributorFromLS()
{
    var value = localStorage.getItem('contributor_local');
    if(value==undefined || value == null)
        return '';
    else {
        return value;
    }
}

function saveUserName(elementId){
    var userEntry = document.getElementById(elementId);
    var value = userEntry.textContent;
    setContributorToLS(value);
}
