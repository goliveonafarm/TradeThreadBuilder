import * as exports from './uniqs.js';
Object.entries(exports).forEach(([name, exported]) => window[name] = exported);
let myListIndex = 0;
let myTradeItems = [];

let questionMarkToolTip = document.getElementById('questionMarkToolTip');
questionMarkToolTip.addEventListener("mouseover", () => {
    document.querySelector(".toolTipClass").style.display = "block";
});
questionMarkToolTip.addEventListener("mouseleave", () => {
    document.querySelector(".toolTipClass").style.display = "none";
});

//save/load Attributes from local storage
document.getElementById('btnSaveAttrNickID').addEventListener("click", () => {
    const jsonArr = JSON.stringify(AttributeName.attrArray);
    localStorage.setItem("attrArray", jsonArr);
    console.log(`Saved attribute nicknames`);
});
document.getElementById('btnLoadAttrNickID').addEventListener('click', loadAttrNickNames);

function loadAttrNickNames() {
    const attrJSONStr = localStorage.getItem("attrArray");
    const parsedAttrArr = JSON.parse(attrJSONStr);
    exports.AttributeName.updateValues(parsedAttrArr);
    setAttrNickNames();
    console.log(`loadAttrNickNames() successful`);
}

let tradeThreadTextArea = document.getElementById('tradeThreadTextAreaID');
tradeThreadTextArea.style.resize = "none";
tradeThreadTextArea.addEventListener("mouseup", e => {
    let selectStart = e.target.selectionStart;
    let myString = document.getElementById('tradeThreadTextAreaID').value.substring(0, selectStart);
    let mySplitArray = myString.split('\n');
    myListIndex = mySplitArray.length - 1;
    console.log('this number will let you pick a row 0, 1,...nth', myListIndex);
})
function updateAttrNickname(index) {
    let _index = index;
    let attrTextAreas = document.querySelector('#attrTextAreaID' + _index).value;
    AttributeName.setAttrNickName(index, attrTextAreas)
}
function resetAttrNickNames() {
    AttributeName.resetNickNames();
    setAttrNickNames();
}
function setAttrNickNames() {
    let attrHTMLRows = document.querySelectorAll('.attrColID');
    attrHTMLRows.forEach(element => element.innerHTML = ``);
    //Creates the rows, columns, and txtarea for editing attribute nick names
    AttributeName.attrArray.forEach(element => {
        let index = (exports.AttributeName.attrArray.indexOf(element));
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
    console.log('setAttrNickNames() successful')
}

document.getElementById('btnResetAttrNickID').addEventListener('click', resetAttrNickNames);

//#region item creation
// let myListIndex = 0; clicked LineNumber in trade thread

//1.11 Create new item - takes base and sets _arr to null, adds copy to trade
function createItem(baseName) {//Base.baseArray[0]
    let base = exports.Base.baseArray.filter(function (e) {
        return e._baseName == `${baseName}`
    })
    let Z = JSON.parse(JSON.stringify(base[0]))
    myTradeItems.push(new Item(Z));
}
//1.12 Add copy of unique to trade
function addUnique(uniqName) {
    let unique = exports.Unique.uniqueArr.filter(function (e) {
        return e._name == `${uniqName}`
    })
    let base = exports.Base.baseArray.filter(function (e) {
        return e._baseName == `${unique[0]._base._baseName}`;
    })
    // let targetUnique = JSON.parse(JSON.stringify(unique))
    let G = {}
    let B = JSON.parse(JSON.stringify(unique[0]));
    let Z = JSON.parse(JSON.stringify(base[0]))
    Object.assign(G, B, { _base: Z });
    //Object.assign(g, unique);
    myTradeItems.push(G)
    console.log('Added unique to trade list: ', G, `\nCurrent Trade List:`, myTradeItems)
}

//1.2 removeItem based on myListIndex (modified by click event in textarea)
function removeItem(myListIndex) {
    console.log("Removed item:", myTradeItems[myListIndex]);
    myTradeItems.splice(myListIndex, 1);
}

//2.1 add attribute to selected item
//console.log(unique.constructor.name )

function addAttribute(attrNameClass, attrValue, index) {
    //takes trade list and myListIndex
    let _currentItem = myTradeItems[index]; //myList[0];
    //AttributeName.attrArray[0];
    let _attr = exports.AttributeName.attrArray.filter(function (e) { return e._attrName == `${attrNameClass}` });
    //console.log(_attr)
    let _attrValue = attrValue; //40;
    _currentItem._arr.push(new exports.BasicAttribute(_attr, _attrValue));
}

//2.1test add attribute to item[0]
//addAttribute('Sockets', 4);
//console.log(myTradeItems[myListIndex]._arr)

//2.2 remove attribute (runs off class function)
function removeAttribute(index) {
    myTradeItems.splice(index, 1)
}
//2.2test remove from item[0]
//removeAttribute(0);

//display trade list
function displayTradeList() {
    myTradeItems.forEach(element => {
        //console.log(element);

        if (element instanceof exports.Unique) {
            //console.log('its unique: ', element, element.constructor.name);
            // console.log(element._arr);
        }
        else if (element._base instanceof exports.Armor) {
            //console.log('its armor:' , element.constructor.name)
        }
        else if (element._base instanceof exports.Weapon) {
            // console.log('its weapon:' , element.constructor.name, element._base[0].constructor.name)
        }
    });
}

displayTradeList();
loadAttrNickNames();

addUnique('Ormus\' Robes');
addUnique('Ormus\' Robes');
addUnique('Ormus\' Robes');
addUnique('The Gladiator\'s Bane')
myTradeItems[3]._base._isEth = true;
console.log(myTradeItems[3]._base);

createItem('Dusk Shroud')
document.getElementById(`testID1`).addEventListener("click", updateTradeList);

function updateTradeList() {
    tradeThreadTextArea.value = ``;
    myTradeItems.forEach(element => {
        let tempString = ``;
        let name = element._name;
        let magicClass = element._magicClass
        let isEth = (element._base._isEth) ? ` / Ethereal` : ``;
        let sockets = (element._base._sockets != 0 || element._magicClass == null) ? ` / ${element._base._sockets} OS` : ``;
        let ed = (element._base._ed != null) ? ` / ${element._base._ed}% ed` : ``;
        let def = ` / ${calcDefHere(element)} def`
        let array = element._arr;
        tempString += `${name}${isEth}${sockets}${ed}${def}`;
        if (element._magicClass == null) { tempString = `${name}${isEth}${sockets}${ed}${def}` }
        array.forEach(element => {
            tempString += ` / ${element._attributeName._attrNickName} ${element._attrFloorActVal}`;
            if (element._attrType == 'skillAttribute') {
                tempString += ` / ${element._classOrTreeName} ${element._attributeName._attrNickName} ${element._attrFloorActVal}`;
            }
            if (element._attrType == 'twoFieldAttribute') {
                tempString += ` / ${element._attributeName._attrNickName} ${element._attrFloorActVal}-${element._attrCeilActVal}`;
            }
        })
        console.log(tempString)
        
        tradeThreadTextArea.value += `${tempString}\n`;
    });
}


function calcDefHere(element) {
    let isEth = (element._base._isEth) ? 1.50 : 1.00;
    let ed = element._base._ed;
    let def = element._base._defActVal;
    let addedDef = element._base._addedDef;
    def += addedDef;

    let ethMultiplier = isEth ? 1.50 : 1.00;
    if (ed === null) return Math.floor(def * ethMultiplier);
    return Math.floor((parseFloat((def + 1) * ethMultiplier)) * ((parseFloat(ed) * 0.01) + 1));
}