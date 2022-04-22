import { AttributeName, Base, Unique } from './uniqs.js'

let tempStorage = [];
function displayAttFields() {
    let attrDivs = [];
    let indexer = 0;
    for (const element of AttributeName.attrArray) {
        let index = (AttributeName.attrArray.indexOf(element));

        const smallRow = document.createElement("div");
        

        //Create attrName col
        const attrNameCol = document.createElement("div");
        attrNameCol.classList.add("col-2");
        const attrNameColTextNode = document.createTextNode(`${element._attrName}`)
        attrNameCol.appendChild(attrNameColTextNode);
        //Create attrNickName col
        const attrNickCol = document.createElement("textarea");
        attrNickCol.classList.add("col-2");
        attrNickCol.setAttribute("type", "text");
        attrNickCol.setAttribute("rows", 1);
        attrNickCol.innerHTML = `${element._attrNickName}`;
        //Append each to small row
        smallRow.appendChild(attrNameCol);
        smallRow.appendChild(attrNickCol);
        //document.getElementById("containerTestID").innerHTML += "<p>Yoo have append this paragraph " + " times";
        //Add small row to attrDivs[]
        attrDivs.push(smallRow);
        if(indexer >= 6){
           // appendAttrFields(attrDivs);
        }
        appendAttrFields(attrDivs);
        //TEST append small row to containerAttrListID
        document.getElementById("containerAttrListID").appendChild(smallRow);
    }
}

for(const element in AttributeName.attrArray){
    let index = (AttributeName.attrArray.indexOf(element)); 
}

function appendAttrFields(attrDivArray){
    let _attrDivArray = attrDivArray;
    let bR = document.createElement("div");
    bR.classList.add("row");

    for(const element of _attrDivArray){
        let indexer = _attrDivArray.indexOf(element);
        //console.log(indexer, element[0].innerText)
        if((2 % indexer) == 0) {
           
            bR = null;
            bR = document.createElement("div");
            bR.classList.add("row");
            bR.classList.add("form-control")
    };
        bR.appendChild(element);
        document.getElementById("containerTest1ID").appendChild(bR);
    }
}

//displayAttFields();



//  containerAttrListID