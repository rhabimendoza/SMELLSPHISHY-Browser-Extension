/** 
    Program Title: all.js
    Main Purpose: Url string format
    Programmer: Rhabi Mendoza
    Date Written: September 30, 2024
    Date Revised: November 8, 2024

    Purpose:
        a. Format url to look presentable
    Algorithms:
        a. formatURL - next line url characters based on limit
 **/

// Next line url
function formatURL(urlInput, limitLen){

    // Make storage variable
    var formatted_url = '';
    
    // Next line characters
    for(var i = 0; i < urlInput.length; i += limitLen){
        formatted_url += urlInput.slice(i, i + limitLen) + '<br>';
    }

    // Return formatted url
    return formatted_url;

}