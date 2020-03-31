function isEmoji(value){
    var regex = "/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g";
    return value.match(regex);
}

function getReactions(thoughtId, commentId, reactions){
    var result = " <button class=\"hbtn\"  onclick='getCommentPopup(this)' data-reference-thought='"+thoughtId+"' data-reference-comment='"+commentId+"' data-reference-input=\"" + commentId + "_reaction\"> +💬 </button><br>";
    if(reactions){
        result += "<div class=\"reaction\" id=\""+commentId+"_reaction\" data-attribute-type = 'reaction'>";
        for(var i=0; i<reactions.length; i++){
            //var emojipart = "<div id=\""+rowId+"_emoji\">"+getEmojiButton(rowId)+"</div>";
            result += reactions[i]["content"]+" - "+reactions[i]["reactor"];
            if(i < reactions.length-1)
                result+="<br>";
        }
    }
    else
        result += "<div id=\""+commentId+"_reaction\">";
    return result + "</div>";
}

function getEmojiButton(rowId){
    return "<button class=\"hbtn\" onclick='getEmojiPopup(this)' data-reference-input=\"" + (rowId.includes('_emoji')? rowId : rowId + "_emoji") + "\"> +😀 </button>";
}

function getCommentPopup(button) {
    var comment = prompt("Enter "+getContributorFromLS()+"'s reaction to the comment:", "");
    if (comment !== null) {
        makeUpdateForReaction(button.dataset.referenceThought,  button.dataset.referenceComment,{content:comment, reactor:getContributorFromLS(), timestamp:""});
        //document.querySelector('#' + button.dataset.referenceInput).innerHTML += ""+comment + " - "+getContributorFromLS();
    }
}