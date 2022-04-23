import { AttributeName, Base, Unique } from './uniqs.js'

function updateAttrNickname(index){
    let _index = index;
    let attrTextAreas = document.querySelector('#attrTextAreaID' + _index).value;
    console.log(attrTextAreas);
    AttributeName.setAttrNickName(index, attrTextAreas)
}
function resetAttrNickNames(){
    AttributeName.resetNickNames();
    setAttrNickNames();
}
function setAttrNickNames(){
    let attrHTMLRows = document.querySelectorAll('.attrColID');
    attrHTMLRows.forEach(element => element.innerHTML =``);
    //Creates the rows, columns, and txtarea for editing attribute names
    AttributeName.attrArray.forEach(element => {
        let index = (AttributeName.attrArray.indexOf(element));
        let row = document.createElement("div");
        row.classList.add("row");
        let nameCol = document.createElement("div");
        nameCol.classList.add("col-6");
        nameCol.innerText = `${element._attrName}`;
        let nickNameCol = document.createElement("div");
        nickNameCol.classList.add("col-6");
        let nickTxtArea = document.createElement("textarea");
        nickTxtArea.classList.add('w-100');
        nickTxtArea.classList.add('text-nowrap');
        //nickTxtArea.classList.add('attrTextAreaClass')
        nickTxtArea.setAttribute('id', 'attrTextAreaID' + index);
        nickTxtArea.setAttribute("rows", 1);
        nickTxtArea.style.overflow ="hidden";
        nickTxtArea.style.resize="none";
        nickTxtArea.innerText = `${element._attrNickName}`;
        nickTxtArea.addEventListener("keyup", () => { updateAttrNickname(index) })
        nickNameCol.appendChild(nickTxtArea);
        row.appendChild(nameCol);
        row.appendChild(nickNameCol);
        attrHTMLRows[index % 4].appendChild(row);
    });
}

document.getElementById('btnResetAttrNickID').addEventListener('click', resetAttrNickNames);

function testFun() {
    console.log(`${AttributeName.attrArray[0]._attrNickName}`);
}

//Initialize-
setAttrNickNames();