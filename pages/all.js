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
function formatUrl(url, limit){

    // Make storage variable
    let formatted_url = '';
    
    // Next line characters
    for(let i = 0; i < url.length; i += limit){
        formatted_url += url.slice(i, i + limit) + '<br>';
    }

    // Return formatted url
    return formatted_url;

}