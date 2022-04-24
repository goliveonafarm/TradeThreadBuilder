import { AttributeName, BasicAttribute, Base, Item, Unique } from './uniqs.js'

//#region toolTip
let questionMarkToolTip = document.getElementById('questionMarkToolTip');
questionMarkToolTip.addEventListener("mouseover", () => {
    document.querySelector(".toolTipClass").style.display = "block";
});
questionMarkToolTip.addEventListener("mouseleave", () => {
    document.querySelector(".toolTipClass").style.display = "none";
});
//#endregion

//#region save/load Attributes from local
document.getElementById('btnSaveAttrNickID').addEventListener("click", () => {
    const jsonArr = JSON.stringify(AttributeName.attrArray);
    localStorage.setItem("attrArray", jsonArr);
    console.log(`Saved local attribute array`);
});
document.getElementById('btnLoadAttrNickID').addEventListener('click', () => {
    const attrJSONStr = localStorage.getItem("attrArray");
    const parsedAttrArr = JSON.parse(attrJSONStr);
    console.log(`Loaded local attribute array`);
    AttributeName.attrArray = parsedAttrArr;
    setAttrNickNames();
});
//#endregion

let tradeThreadTextArea = document.getElementById('tradeThreadTextAreaID');
tradeThreadTextArea.addEventListener("mouseup", e => {
    let selectStart = e.target.selectionStart;
    let myString = document.getElementById('tradeThreadTextAreaID').value.substring(0, selectStart);
    let mySplitArray = myString.split('\n');
    console.log(mySplitArray.length);
})

function updateAttrNickname(index) {
    let _index = index;
    let attrTextAreas = document.querySelector('#attrTextAreaID' + _index).value;
    console.log(attrTextAreas);
    AttributeName.setAttrNickName(index, attrTextAreas)
}
function resetAttrNickNames() {
    AttributeName.resetNickNames();
    setAttrNickNames();
}
function setAttrNickNames() {
    let attrHTMLRows = document.querySelectorAll('.attrColID');
    attrHTMLRows.forEach(element => element.innerHTML = ``);
    //Creates the rows, columns, and txtarea for editing attribute names
    AttributeName.attrArray.forEach(element => {
        let index = (AttributeName.attrArray.indexOf(element));
        let row = document.createElement("div");
        row.style.fontSize = "11px"
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
        nickTxtArea.style.overflow = "hidden";
        nickTxtArea.style.resize = "none";
        nickTxtArea.innerText = `${element._attrNickName}`;
        nickTxtArea.addEventListener("keyup", () => { updateAttrNickname(index) })
        nickTxtArea.addEventListener("mouseup", (e) => { e.target.select() })
        nickNameCol.appendChild(nickTxtArea);
        row.appendChild(nameCol);
        row.appendChild(nickNameCol);
        attrHTMLRows[index % 4].appendChild(row);
    });
}

document.getElementById('btnResetAttrNickID').addEventListener('click', resetAttrNickNames);

function createAttribute(AttributeName) {

}

let myList = [];
let g = Base.baseArray[0];

function createItem(base) {//Base.baseArray[0]
    myList.push(new Item(base, []));
}

createItem(g);

function addAttributes(index, attrNameClass, attrValue) {
    let _index = index;
    let _currentItem = myList[_index]; //myList[0];
    let _attrName = attrNameClass; //AttributeName.attrArray[0];
    let _attrValue = attrValue; //40;
    _currentItem._arr.push(new BasicAttribute(_attrName, _attrValue));
}



console.log(myList[0]);


function removeAttribute(index) {
    let _currentItem = myList[0];
    let _index = index;
    _currentItem.deleteAttribute(_index);
}

removeAttribute(1);


console.log(myList[0]);

function testFun() {
    console.log(`${AttributeName.attrArray[0]._attrNickName}`);
}

//Initialize-
setAttrNickNames();