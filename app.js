import * as exports from './uniqs.js';
Object.entries(exports).forEach(([name, exported]) => window[name] = exported);
let myListIndex = 0;
let myTradeItems = [];
let sortWithCategory = false;
let deleteFlag = false;
let chosenMagicClass = null;
let chosenClass = null;
let chosenName = null;
let currentItem = null;
let infoWindow = document.getElementById('lblCurrentItemID');
let attributeArea = document.getElementById('attrAreaID');


document.querySelectorAll(".returnTypeClass").forEach(item => {
    item.addEventListener("click", () => {
        chosenMagicClass = (item.innerText);
        document.getElementById('returnTypeBtnID').textContent = chosenMagicClass;
    })
})

document.getElementById('categBtnID').addEventListener("click", () => {
    sortWithCategory = true;
    sortTradeList();
    sortWithCategory = false;
    infoWindow.innerText = "Categorized by item class";
})
document.getElementById('sortBtnID').addEventListener("click", () => {
    sortTradeList();
    infoWindow.innerText = "Sorted trading list"
});
document.getElementById('removeBtnID').addEventListener("click", () => {
    sortTradeList();
    deleteFlag = true;
    infoWindow.innerText = `Click on an item in the trade window to remove it`;
})


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
    infoWindow.innerText = "Saved custom attribute names";

});
document.getElementById('btnLoadAttrNickID').addEventListener('click', () => {
    loadAttrNickNames();
    infoWindow.innerText = "Loaded custom attribute names";
});

function loadAttrNickNames() {
    const attrJSONStr = localStorage.getItem("attrArray");
    const parsedAttrArr = JSON.parse(attrJSONStr);
    exports.AttributeName.updateValues(parsedAttrArr);
    setAttrNickNames();

}
document.getElementById('saveBtnID').addEventListener('click', () => {
    const tradeJSONArr = JSON.stringify(myTradeItems);
    localStorage.setItem("tradeArray", tradeJSONArr);
    infoWindow.innerText = "Saved trade list";

})
document.getElementById('loadBtnID').addEventListener('click', () => {
    const tradeJSONStr = localStorage.getItem("tradeArray");
    const parsedTradeStr = JSON.parse(tradeJSONStr);
    myTradeItems = parsedTradeStr;
    updateTradeList();
    infoWindow.innerText = "Loaded trade list";
})

let tradeThreadTextArea = document.getElementById('tradeThreadTextAreaID');
tradeThreadTextArea.style.resize = "none";
tradeThreadTextArea.addEventListener("mouseup", e => {
    let selectStart = e.target.selectionStart;
    let myString = document.getElementById('tradeThreadTextAreaID').value.substring(0, selectStart);
    let mySplitArray = myString.split('\n');
    myListIndex = mySplitArray.length - 1;
    if (deleteFlag) {
        myTradeItems.splice(myListIndex, 1);
        sortTradeList();
        infoWindow.innerText = `Item in position ${myListIndex} removed`;
    }
})
document.getElementById('clearBtnID').addEventListener("click", () => {
    tradeThreadTextArea.value = ``;
    myTradeItems = [];
    infoWindow.innerText = "Trade thread deleted. Load or start a new one";

})
document.getElementById('clipboardBtnID').addEventListener("click", () => {
    tradeThreadTextArea.select();
    document.execCommand("copy");
    infoWindow.innerText = "Copied to clipboard!"
})
function updateAttrNickname(index) {
    let _index = index;
    let attrTextAreas = document.querySelector('#attrTextAreaID' + _index).value;
    exports.AttributeName.setAttrNickName(index, attrTextAreas)
}
function resetAttrNickNames() {
    exports.AttributeName.resetNickNames();
    setAttrNickNames();
}
function setAttrNickNames() {
    let attrHTMLRows = document.querySelectorAll('.attrColID');
    attrHTMLRows.forEach(element => element.innerHTML = ``);
    //Creates the rows, columns, and txtarea for editing attribute nick names
    exports.AttributeName.attrArray.forEach(element => {
        //get index
        let index = (exports.AttributeName.attrArray.indexOf(element));
        //create row for all cols
        let row = document.createElement("div");
        row.style.fontSize = "11px"
        row.classList.add("row");
        //_attrName col
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

document.getElementById('btnAddItemID').addEventListener("click", () => {
    addUnique(currentItem._name);
    sortTradeList();
})
//1.12 Add copy of unique to trade
function addUnique(uniqName) {
    let unique = exports.Unique.uniqueArr.filter(function (e) {
        return e._name == `${uniqName}`
    })
    let base = exports.Base.baseArray.filter(function (e) {
        return e._baseName == `${unique[0]._base._baseName}`;
    })
    let G = {}
    let B = JSON.parse(JSON.stringify(unique[0]));
    let Z = JSON.parse(JSON.stringify(base[0]))
    Object.assign(G, B, { _base: Z });
    myTradeItems.push(G)
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

loadAttrNickNames();

function updateTradeList() {
    tradeThreadTextArea.value = ``;
    let lastClassType = null;;
    myTradeItems.forEach(element => {
        if (sortWithCategory) {
            if (lastClassType != element._base._itemClass) {
                if (lastClassType != null) { tradeThreadTextArea.value += `\n` }
                lastClassType = element._base._itemClass;
                tradeThreadTextArea.value += `${lastClassType}\n`;
            }
        }
        let array = element._arr;
        array.forEach(elementOne => {
            if (elementOne._attributeName._attrName == "% Enhanced Defense") { element._base._ed = elementOne._attrFloorActVal; }
            if (elementOne._attributeName._attrName == "Defense") { element._base._addedDef = elementOne._attrFloorActVal; }
        })
        let tempString = ``;
        let name = element._name;
        let isEth = (element._base._isEth) ? ` / Ethereal` : ``;
        let sockets = (element._base._sockets != 0 || element._magicClass == null) ? ` / ${element._base._sockets} OS` : ``;
        let ed = (element._base._ed != null && element._base._type == 'Armor') ? ` / ${element._base._ed}${exports.AttributeName.attrArray[0]._attrNickName}` : ` / ${element._base._ed}${exports.AttributeName.attrArray[1]._attrNickName}`;
        if (element._base._ed == 0) { ed = `` }
        let def = (element._base._type == 'Armor') ? ` / ${calcDefHere(element)} ${exports.AttributeName.attrArray[2]._attrNickName}` : ``;

        tempString += `${name}${isEth}${sockets}${ed}${def}`;
        if (element._magicClass == null) { tempString = `${name}${isEth}${sockets}${ed}${def}` }
        //iterate through attribute array
        array.forEach(elementTwo => {
            (console.log("element two: ", elementTwo))
            if (elementTwo._attributeName._attrName != '% Enhanced Defense') {
                tempString += ` / ${elementTwo._attributeName._attrNickName} ${elementTwo._attrFloorActVal}`;
                if (elementTwo._attrType == 'skillAttribute') {
                    alert('hit')
                    tempString += ` / ${elementTwo._classOrTreeName} ${elementTwo._attributeName._attrNickName} ${elementTwo._attrFloorActVal}`;
                }
                if (elementTwo._attrType == 'twoFieldAttribute') {
                    tempString += ` / ${elementTwo._attributeName._attrNickName} ${elementTwo._attrFloorActVal}-${elementTwo._attrCeilActVal}`;
                }
            }
        })
        tradeThreadTextArea.value += `${tempString}\n`;

        //infoWindow.innerText = tempString;
    });
}

function calcDefHere(element) {
    let ethMultiplier = (element._base._isEth) ? 1.50 : 1.00;
    let ed = parseFloat(element._base._ed);
    let def = parseFloat(element._base._defActVal);
    let addedDef = parseFloat(element._base._addedDef);
    def += addedDef;
    if (ed != 0) { def = def + 1 }
    if (ed === null) return Math.floor(def * ethMultiplier);
    return Math.floor((parseFloat(def * ethMultiplier)) * ((parseFloat(ed) * 0.01) + 1));
}

function sortTradeList() {
    deleteFlag = false;
    myTradeItems.sort()
    myTradeItems.sort((a, b) => (a._name > b._name) ? 1 : ((b._name > a._name) ? -1 : 0))
    if (sortWithCategory) { myTradeItems.sort((a, b) => (a._base._itemClass > b._base._itemClass) ? 1 : ((b._base._itemClass > a._base._itemClass) ? -1 : 0)) }
    updateTradeList();
}

const classListArr = exports.Base.baseArray.map(element => {
    return element._itemClass;
})
let classList = [...new Set(classListArr)];
classList.sort();

classList.forEach(item => {
    const liItem = document.createElement("li");
    const liItemTextNode = document.createTextNode(item);
    liItem.appendChild(liItemTextNode);
    liItem.classList.add("dropdown-item");
    liItem.addEventListener("click", function () {
        chosenClass = item;
        document.getElementById('btnPushClassListID').textContent = `${item}`;
        populateItemBtn();
    })
    document.getElementById("ulPushClassListID").appendChild(liItem);
})

function populateItemBtn() {
    const result = exports.Unique.uniqueArr.filter(function (e) {
        return e._magicClass == chosenMagicClass;
    })

    const secondResult = result.filter(function (e) {
        return e._base._itemClass == chosenClass;
    })
    const itemListArr = secondResult.map(element => {
        return element._name;
    })
    let itemList = [...new Set(itemListArr)];
    itemList.sort();
    document.getElementById("ulPushPickItemListID").innerHTML = ``;
    itemList.forEach(item => {
        const liItem = document.createElement("li");
        const liItemTextNode = document.createTextNode(item);
        liItem.appendChild(liItemTextNode);
        liItem.classList.add("dropdown-item");
        liItem.addEventListener("click", function () {
            chosenName = item;
            sockRads.forEach(elem => {
                elem.checked = 'false'
            })
            sockRads[0].checked = "true"
            ethRads.forEach(elem => {
                elem.checked = 'false'
            })
            ethRads[0].checked = "true"

            document.getElementById('btnPickItemListID').textContent = `${item}`;
            setEditFields();
        })
        document.getElementById("ulPushPickItemListID").appendChild(liItem);
    })
}

function setEditFields() {
    //if unique
    if (chosenMagicClass == 'Unique') {
        const uniqListArr = exports.Unique.uniqueArr.map(element => {
            if (element._name == chosenName) return element;
        })
        let uniqList = [...new Set(uniqListArr)];

        attributeArea.innerHTML = ``;
        let grabInScope = (uniqList[0] === undefined) ? uniqList[1] : uniqList[0]

        currentItem = grabInScope;
        updateCurrentItemInfoWindow();


        grabInScope._arr.forEach(item => {

            let aa = generateRowForField(item);
            document.getElementById('attrAreaID').appendChild(aa)
        })


    }
    //if not unique (magical or base)
}

let floorActIndexer = 0;
function generateRowForField(attr) {
    console.log(attr)
    //1.create row
    const thisRow = document.createElement("div");
    thisRow.classList.add("row");
    thisRow.classList.add("removableAttrRowClass");
    //2.check and create if twofield attribute
    //f aFMinV aFMaxV aFAV
    //1.1F 0
    if (attr._attributeName._attrName != ``) {
        const attrNickCol = document.createElement("div");
        attrNickCol.classList.add("col");
        const attrNickText = document.createTextNode(`${attr._attributeName._attrNickName}`);
        attrNickCol.appendChild(attrNickText);
        thisRow.appendChild(attrNickCol)
    }
    if (attr instanceof SkillAttribute) {
        const attrClassOrTreeNameCol = document.createElement("div");
        attrClassOrTreeNameCol.classList.add("col");
        const classOrTreeNameTextNode = document.createTextNode(`${attr._classOrTreeName}`);
        attrClassOrTreeNameCol.appendChild(classOrTreeNameTextNode);
        thisRow.appendChild(attrClassOrTreeNameCol);
    }
    //1.2 aFinV 2
    const attrFloorMinCol = document.createElement("div");
    attrFloorMinCol.classList.add("col");
    const attrFloorMinText = document.createTextNode(`${attr._attrFloorMinVal}`);
    attrFloorMinCol.appendChild(attrFloorMinText);
    thisRow.appendChild(attrFloorMinCol)
    //1.3 aFMaxV 3
    const attrFloorMaxCol = document.createElement("div");
    attrFloorMaxCol.classList.add("col");
    const attrFloormaxText = document.createTextNode(`${attr._attrFloorMaxVal}`);
    attrFloorMaxCol.appendChild(attrFloormaxText);
    thisRow.appendChild(attrFloorMaxCol)
    //1.4 aFAV text area 4
    const attrFloorActTextArea = document.createElement("textarea");
    attrFloorActTextArea.classList.add("col-2");
    attrFloorActTextArea.setAttribute("type", "number");
    attrFloorActTextArea.setAttribute("rows", 1);
    attrFloorActTextArea.setAttribute("id", `attrFloorTextAreaID${floorActIndexer}`)
    attrFloorActTextArea.innerHTML = `${attr._attrFloorActVal}`;
    attrFloorActTextArea.style.resize = "none";
    attrFloorActTextArea.style.overflow = "hidden";
    attrFloorActTextArea.addEventListener("keyup", (e) => {
        attr._attrFloorActVal = (e.target.value)
        updateCurrentItemInfoWindow();
    })
    thisRow.appendChild(attrFloorActTextArea)
    if (attr instanceof TwoFieldAttribute) {
        alert('success')
        //1.5 aCMinVal
        const attrACMinValcol = document.createElement("div");
        attrACMinValcol.classList.add("col");
        const attrACMinValTextNode = document.createTextNode(`${attr._attrCeilMinVal}`);
        attrACMinValcol.appendChild(attrACMinValTextNode);
        thisRow.appendChild(attrACMinValcol);
        //1.6 aCMaxVal
        const attrACMaxValcol = document.createElement("div");
        attrACMaxValcol.classList.add("col");
        const attrACMaxValTextNode = document.createTextNode(`${attr._attrCeilMaxVal}`);
        attrACMaxValcol.appendChild(attrACMaxValTextNode);
        thisRow.appendChild(attrACMaxValcol);
        //1.7 aCActVal text area
        const attrCeilActTextArea = document.createElement("textarea");
        attrCeilActTextArea.classList.add("col-2");
        attrCeilActTextArea.setAttribute("type", "number");
        attrCeilActTextArea.setAttribute("rows", 1);
        attrCeilActTextArea.setAttribute("id", `attrCeilTextAreaID${floorActIndexer}`)
        attrCeilActTextArea.innerHTML = `${attr._attrFloorActVal}`;
        attrCeilActTextArea.style.resize = "none";
        attrCeilActTextArea.style.overflow = "hidden";
        attrCeilActTextArea.addEventListener("keyup", (e) => {
            attr._attrCeilActVal = (e.target.value)
            updateCurrentItemInfoWindow();
        })
        thisRow.classList.add("justify-content-center")
        thisRow.appendChild(attrCeilActTextArea);
    }

    floorActIndexer++;




    //?. return row
    return thisRow;
}

function updateAttr(attr, classID, index) {
    console.log(attr)
    let textBoxValue = document.getElementById(`${classID}${index}`);
    console.log(attr._attrFloorActVal)
    console.log("textboxvalue:", textBoxValue);
    attr._attrFloorActVal = textBoxValue.value
    console.log(attr._attrFloorActVal)
    updateCurrentItemInfoWindow();
    console.log(attr)
}

const sockRads = document.querySelectorAll('.classSocketQuery');
for (const radio of sockRads) {
    radio.addEventListener("click", (e) => {

        currentItem._base._sockets = parseInt(e.target.value);
        updateCurrentItemInfoWindow();

    })
}

const ethRads = document.querySelectorAll('.classEthQuery');
for (const radio of ethRads) {
    radio.addEventListener("click", (e) => {

        currentItem._base._isEth = (e.target.value == 'True');
        updateCurrentItemInfoWindow();

    })
}

function updateCurrentItemInfoWindow() {

    infoWindow.innerText = ``;
    let element = currentItem;

    element._arr.forEach(elementOne => {
        if (elementOne._attributeName._attrName == "% Enhanced Defense") { element._base._ed = elementOne._attrFloorActVal; }
        if (elementOne._attributeName._attrName == "Defense") { element._base._addedDef = elementOne._attrFloorActVal; }
    })


    let tempString = ``;
    let name = element._name;
    let isEth = (element._base._isEth) ? ` / Ethereal` : ``;
    let sockets = (element._base._sockets != 0 || element._magicClass == null) ? ` / ${element._base._sockets} OS` : ``;
    let ed = (element._base._ed != null && element._base._type == 'Armor') ? ` / ${element._base._ed}${exports.AttributeName.attrArray[0]._attrNickName}` : ` / ${element._base._ed}${exports.AttributeName.attrArray[1]._attrNickName}`;
    if (element._base._ed == 0) { ed = `` }
    let def = (element._base._type == 'Armor') ? ` / ${calcDefHere(element)} ${exports.AttributeName.attrArray[2]._attrNickName}` : ``;



    tempString += `${name}${isEth}${sockets}${ed}${def}`;
    if (element._magicClass == null) { tempString = `${name}${isEth}${sockets}${ed}${def}` }
    //iterate through attribute array
    let array = element._arr;
    array.forEach(elementTwo => {
        if (elementTwo._attributeName._attrName != '% Enhanced Defense') {
            tempString += ` / ${elementTwo._attributeName._attrNickName} ${elementTwo._attrFloorActVal}`;
            if (elementTwo._attrType == 'skillAttribute') {
                tempString += ` / ${elementTwo._classOrTreeName} ${elementTwo._attributeName._attrNickName} ${elementTwo._attrFloorActVal}`;
            }
            if (elementTwo._attrType == 'twoFieldAttribute') {
                tempString += ` / ${elementTwo._attributeName._attrNickName} ${elementTwo._attrFloorActVal}-${elementTwo._attrCeilActVal}`;
            }
        }
    })
    infoWindow.innerText = tempString;
}


let body = document.getElementsByTagName('body');
document.getElementById('moonIconID').addEventListener("click", setNightMode);
document.getElementById('sunIconID').addEventListener("click",setDayMode);

let isDay = false;
function checkNightDay() {
    const isDayJSONStr = localStorage.getItem('dayMode');
    isDay = JSON.parse(isDayJSONStr);
    if (isDay) { setDayMode(); }
    if (!isDay) { setNightMode(); }
}
checkNightDay();
function setDayMode() {
    body[0].classList.remove("bg-dark")
    body[0].classList.add('bg-success')
    body[0].classList.add("bg-gradient")
    body[0].classList.remove('text-warning')
    let g = document.getElementsByTagName('textarea');
    tradeThreadTextArea.classList.remove('bg-dark');
    tradeThreadTextArea.classList.remove('text-warning');
    isDay = true;
    const jsonArr = JSON.stringify(isDay);
    localStorage.setItem('dayMode', isDay);
}
function setNightMode() {
    body[0].classList.remove("bg-success")
    body[0].classList.add('bg-dark')
    body[0].classList.remove("bg-gradient")
    body[0].classList.add('text-warning')
    let g = document.getElementsByTagName('textarea');
    tradeThreadTextArea.classList.add('bg-dark');
    tradeThreadTextArea.classList.add('text-warning');
    isDay = false;
    const jsonArr = JSON.stringify(isDay);
    localStorage.setItem('dayMode', isDay);
}

sortTradeList();