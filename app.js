import { AttributeName, Base, Unique } from './uniqs.js'
let attrHTMLRows = document.querySelectorAll('#attrColID');

//Creates the rows, columns, and txtarea for editing attribute names
AttributeName.attrArray.forEach(element => {

    let index = (AttributeName.attrArray.indexOf(element));
    let row = document.createElement("div");
    row.classList.add("row");
    let nameCol = document.createElement("div");
    nameCol.classList.add("col-6");
    nameCol.innerText=`${element._attrName}`
    let nickNameCol = document.createElement("div");
    nickNameCol.classList.add("col-6");
    let nickTxtArea = document.createElement("textarea");
    nickTxtArea.classList.add('w-100');
    nickTxtArea.setAttribute("rows", 1);
    nickTxtArea.style.overflow = "hidden";
    nickTxtArea.innerText=`${element._attrNickName}`
//need to add listener to textarea
    nickNameCol.appendChild(nickTxtArea);
    row.appendChild(nameCol);
    row.appendChild(nickNameCol);
    attrHTMLRows[index % 4].appendChild(row);
});