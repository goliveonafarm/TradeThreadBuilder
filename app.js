import * as exports from './uniqs.js';
Object.entries(exports).forEach(([name, exported]) => window[name] = exported);
let myListIndex = 0;
let myTradeItems = [];
let sortWithCategory = false;
let deleteFlag = false;
let isDay = false;
let chosenMagicClass = 'Unique';
let chosenClass = null;
let chosenName = null;
let currentItem = null;
let floorActIndexer = 0;
let ethSockRadRow = document.getElementById('ethSockRadID');
let tradeThreadTextArea = document.getElementById('tradeThreadTextAreaID');
let infoWindow = document.getElementById('lblCurrentItemID');
let attributeArea = document.getElementById('attrAreaID');
let body = document.getElementsByTagName('body');
tradeThreadTextArea.style.resize = "none";
let openUp = 0;

document.getElementById('openUpID').addEventListener("click", () => {
    openUp++;
    if (openUp == 4) { document.getElementById('revealCounterID').hidden = false; }
})
//this is disabled until after figuring out custom items
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

document.getElementById('removeBtnID').addEventListener("click", () => {
    sortTradeList();
    deleteFlag = true;
    infoWindow.innerText = `Click on an item in the trade window to remove it`;
})

document.getElementById('btnSaveAttrNickID').addEventListener("click", () => {
    const jsonArr = JSON.stringify(exports.AttributeName.attrArray);
    localStorage.setItem("attrArray", jsonArr);
    infoWindow.innerText = "Saved custom attribute names";

});
document.getElementById('btnLoadAttrNickID').addEventListener('click', () => {
    loadAttrNickNames();
    infoWindow.innerText = "Loaded custom attribute names";
});

document.getElementById('saveBtnID').addEventListener('click', () => {
    const tradeJSONArr = JSON.stringify(myTradeItems);
    localStorage.setItem("tradeArray", tradeJSONArr);
    infoWindow.innerText = "Saved trade list";

})
document.getElementById('loadBtnID').addEventListener('click', () => {
    const tradeJSONStr = localStorage.getItem("tradeArray");
    if (tradeJSONStr != null) {
        const parsedTradeStr = JSON.parse(tradeJSONStr);
        myTradeItems = parsedTradeStr;
        updateTradeList();
        infoWindow.innerText = "Loaded trade list";
    }
})

tradeThreadTextArea.addEventListener("mouseup", e => {
    let selectStart = e.target.selectionStart;
    let myString = document.getElementById('tradeThreadTextAreaID').value.substring(0, selectStart);
    let mySplitArray = myString.split('\n');
    myListIndex = mySplitArray.length - 1;
    if (deleteFlag) {
        myTradeItems.splice(myListIndex, 1);
        sortTradeList();
        infoWindow.innerText = `Item # ${myListIndex + 1} removed`;
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

function loadAttrNickNames() {
    try {
        const attrJSONStr = localStorage.getItem("attrArray");
        if (attrJSONStr != null) {
            const parsedAttrArr = JSON.parse(attrJSONStr);
            if (parsedAttrArr.length != exports.AttributeName.attrArray.length) {
                exports.AttributeName.resetNickNames();
                localStorage.removeItem("attrArray");
                alert('An update or error has caused your attribute nick names to reset!')
            } else {
                exports.AttributeName.updateValues(parsedAttrArr)
            }
        };
    } catch (error) {
    }
    setAttrNickNames();
}

function updateAttrNickname(index) {
    let _index = index;
    let attrTextAreas = document.querySelector('#attrTextAreaID' + _index).value;
    exports.AttributeName.setAttrNickName(index, attrTextAreas)
}

document.getElementById('btnResetAttrNickID').addEventListener('click', resetAttrNickNames);
function resetAttrNickNames() {
    exports.AttributeName.resetNickNames();
    setAttrNickNames();
}
function setAttrNickNames() {
    let attrHTMLRows = document.querySelectorAll('.attrColID');
    attrHTMLRows.forEach(element => element.innerHTML = ``);
    exports.AttributeName.attrArray.forEach(element => {
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
        nickNameCol.appendChild(nickTxtArea);
        row.appendChild(nameCol);
        row.appendChild(nickNameCol);
        attrHTMLRows[index % 4].appendChild(row);
    });
    console.log('setAttrNickNames() successful')
}

function createItem(baseName) {
    let base = exports.Base.baseArray.filter(function (e) {
        return e._baseName == `${baseName}`
    })
    let Z = JSON.parse(JSON.stringify(base[0]))
    myTradeItems.push(new Item(Z));
}

document.getElementById('btnAddItemID').addEventListener("click", () => {
    try {
        addUnique(currentItem._name);
        sortTradeList();
        infoWindow.innerText = `Current item was added`;
    } catch (error) { infoWindow.innerText = `You do not currently have an item to add`; }
})

function addUnique(uniqName) {
    let unique = exports.Unique.uniqueArr.filter(function (e) {
        return e._name == `${uniqName}`
    })
    let base = exports.Base.baseArray.filter(function (e) {
        return e._baseName == `${unique[0]._base._baseName}`;
    })
    try {
        let G = {}
        let B = JSON.parse(JSON.stringify(unique[0]));
        let Z = JSON.parse(JSON.stringify(base[0]))
        Object.assign(G, B, { _base: Z });
        myTradeItems.push(G)
    }
    catch (error) { infoWindow.innerText = `There was some kind of error I dont know about` }
}

function removeItem(myListIndex) {
    console.log("Removed item:", myTradeItems[myListIndex]);
    myTradeItems.splice(myListIndex, 1);
}

//console.log(unique.constructor.name )
function addAttribute(attrNameClass, attrValue, index) {
    let _currentItem = myTradeItems[index];
    let _attr = exports.AttributeName.attrArray.filter(function (e) { return e._attrName == `${attrNameClass}` });
    let _attrValue = attrValue;
    _currentItem._arr.push(new exports.BasicAttribute(_attr, _attrValue));
}

function removeAttribute(index) {
    myTradeItems.splice(index, 1)
}

function updateTradeList() {
    tradeThreadTextArea.value = ``;
    let lastClassType = null;
    myTradeItems.forEach(element => {
        if (sortWithCategory) {
            if (lastClassType != element._base._itemClass) {
                if (lastClassType != null) { tradeThreadTextArea.value += `\n` }
                lastClassType = element._base._itemClass;
                tradeThreadTextArea.value += `${lastClassType}\n`;
            }
        }
        let myString = updateCurrentItemInfoWindow(element);
        tradeThreadTextArea.value += `${myString}\n`;
    });
}

function calcDefHere(element) {
    let ethMultiplier = (element._base._isEth) ? 1.50 : 1.00;
    let ed = parseFloat(element._base._ed);
    let def = parseFloat(element._base._defActVal);
    let addedDef = parseFloat(element._base._addedDef);
    if (ed === null || isNaN(ed)) return ((def * ethMultiplier) + addedDef);
    if (ed != 0 && ed != null) { def += 1 }
    return (addedDef + Math.floor((parseFloat(def * ethMultiplier)) * ((parseFloat(ed) * 0.01) + 1)));
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
        attributeArea.innerHTML = ``;
        infoWindow.innerText = ``;
        ethSockRadRow.hidden = true;
        populateItemBtn();
        document.getElementById('btnPickItemListID').textContent = 'Pick item'

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

//uniques only atm????????///////////////////////////////////////
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

        if (currentItem._base._type == `Weapon` || currentItem._base._type == `Armor`) { ethSockRadRow.hidden = false; }

        updateCurrentItemInfoWindow(currentItem);
        //add special row if no ed and no extra defense
        if (grabInScope._base._ed == null && grabInScope._base._addedDef == 0 && grabInScope._base._actDef != undefined) {
            let newRow = generateRowForDefOnly(currentItem)

            attributeArea.appendChild(newRow);
        }
        grabInScope._arr.forEach(item => {
            let newRow = generateRowForField(item);
            attributeArea.appendChild(newRow)
        })
    }
    //if not unique (magical or base)////////////////////////////////////////////////////////////
}

function generateRowForDefOnly(itemToGen) {
    let base = itemToGen._base;
    const thisRow = document.createElement("div");
    thisRow.classList.add("row");
    thisRow.classList.add("removableAttrRowClass");
    //1.1 f
    const attrNickCol = document.createElement("div");
    attrNickCol.classList.add("col");
    const attrNickText = document.createTextNode(`${exports.AttributeName.attrArray[2]._attrNickName}`);
    attrNickCol.appendChild(attrNickText);
    thisRow.appendChild(attrNickCol)
    //2.1 dMin
    const baseMinCol = document.createElement("div");
    baseMinCol.classList.add("col");
    const baseMinText = document.createTextNode(`${base._minDef}`);
    baseMinCol.appendChild(baseMinText);
    thisRow.appendChild(baseMinCol)
    //2.2 dmax
    const baseMaxCol = document.createElement("div");
    baseMaxCol.classList.add("col");
    const baseMaxText = document.createTextNode(`${base._maxDef}`);
    baseMaxCol.appendChild(baseMaxText);
    thisRow.appendChild(baseMaxCol)
    //2.3 dAct
    const defActTextArea = document.createElement("textarea");
    defActTextArea.classList.add("col-2");
    defActTextArea.setAttribute("type", "number");
    defActTextArea.setAttribute("rows", 1);
    defActTextArea.innerHTML = `${base._maxDef}`;
    defActTextArea.style.resize = "none";
    defActTextArea.style.overflow = "hidden";
    defActTextArea.addEventListener("keyup", (e) => { base._defActVal = (e.target.value) });
    thisRow.appendChild(defActTextArea);
    return thisRow;
}

function generateRowForField(attr) {
    console.log(attr)
    const thisRow = document.createElement("div");
    thisRow.classList.add("row");
    thisRow.classList.add("removableAttrRowClass");


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
    } else {

    }
    //1.2 aFinV 2
    const attrFloorMinCol = document.createElement("div");
    attrFloorMinCol.classList.add("col-1");
    const attrFloorMinText = document.createTextNode(`${attr._attrFloorMinVal}`);
    attrFloorMinCol.appendChild(attrFloorMinText);
    thisRow.appendChild(attrFloorMinCol)
    //1.3 aFMaxV 3
    const attrFloorMaxCol = document.createElement("div");
    attrFloorMaxCol.classList.add("col-1");
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
        updateCurrentItemInfoWindow(currentItem);
    })
    thisRow.appendChild(attrFloorActTextArea)
    if (attr instanceof TwoFieldAttribute) {
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
            updateCurrentItemInfoWindow(currentItem);
        })
        thisRow.classList.add("justify-content-center")
        thisRow.appendChild(attrCeilActTextArea);
    }
    floorActIndexer++;
    return thisRow;
}

function updateAttr(attr, classID, index) {
    console.log(attr)
    let textBoxValue = document.getElementById(`${classID}${index}`);
    console.log(attr._attrFloorActVal)
    console.log("textboxvalue:", textBoxValue);
    attr._attrFloorActVal = textBoxValue.value
    console.log(attr._attrFloorActVal)
    updateCurrentItemInfoWindow(currentItem);
    console.log(attr)
}

const sockRads = document.querySelectorAll('.classSocketQuery');
for (const radio of sockRads) {
    radio.addEventListener("click", (e) => {
        currentItem._base._sockets = parseInt(e.target.value);
        updateCurrentItemInfoWindow(currentItem);
    })
}

const ethRads = document.querySelectorAll('.classEthQuery');
for (const radio of ethRads) {
    radio.addEventListener("click", (e) => {
        currentItem._base._isEth = (e.target.value == 'True');
        updateCurrentItemInfoWindow(currentItem);
    })
}

function updateCurrentItemInfoWindow(element) {
    infoWindow.innerText = ``;
    element._arr.forEach(elementOne => {
        if (elementOne._attributeName._attrName == "% Enhanced Defense" || elementOne._attributeName._attrName == "% Enhanced Damage") { element._base._ed = elementOne._attrFloorActVal; }
        if (elementOne._attributeName._attrName == "Defense") { element._base._addedDef = elementOne._attrFloorActVal; }
    })

    let tempString = ``;
    let name = element._name;
    let isEth = (element._base._isEth) ? ` / Ethereal` : ``;
    let sockets = (element._base._sockets != 0 || element._magicClass == null) ? ` / ${element._base._sockets} OS` : ``;
    let ed = (element._base._ed != null && element._base._type == 'Armor') ? ` / ${element._base._ed}${exports.AttributeName.attrArray[0]._attrNickName}` : ` / ${element._base._ed}${exports.AttributeName.attrArray[1]._attrNickName}`;
    if (element._base._ed == 0 || element._base._ed == null) { ed = `` }
    let def = (element._base._type == 'Armor') ? ` / ${calcDefHere(element)} ${exports.AttributeName.attrArray[2]._attrNickName}` : ``;
    tempString += `${name}${isEth}${sockets}${ed}${def}`;
    if (element._magicClass == null) { tempString = `${name}${isEth}${sockets}${ed}${def}` }
    let array = element._arr;
    array.forEach(elementTwo => {
        if (elementTwo._attributeName._attrName != '% Enhanced Defense' && elementTwo._attributeName._attrName != '% Enhanced Damage') {
            tempString += ` / ${elementTwo._attributeName._attrNickName}`;
            if (elementTwo._attrType == 'skillAttribute') {
                tempString += ` ${elementTwo._classOrTreeName}`;
            }
            tempString += ` ${elementTwo._attrFloorActVal}`
            if (elementTwo._attrType == 'twoFieldAttribute') {
                tempString += ` - ${elementTwo._attrCeilActVal}`;
            }
        }
    })
    infoWindow.innerText = tempString;
    return (tempString);
}

document.getElementById('moonIconID').addEventListener("click", setNightMode);
document.getElementById('sunIconID').addEventListener("click", setDayMode);
function checkNightDay() {
    try {
        const isDayJSONStr = localStorage.getItem('dayMode');
        if (isDayJSONStr != null) { isDay = JSON.parse(isDayJSONStr) };
    } catch {
        console.error.error
    }
    (isDay) ? setDayMode() : setNightMode();
}

function setDayMode() {
    body[0].classList.remove("bg-dark")
    body[0].classList.add('bg-success')
    body[0].classList.add("bg-gradient")
    body[0].classList.remove('text-warning')
    let g = document.getElementsByTagName('textarea');
    tradeThreadTextArea.classList.remove('bg-dark');
    tradeThreadTextArea.classList.remove('text-warning');
    let q = document.getElementsByClassName('attrTextAreaClass');
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
document.getElementById('clearAllBtnID').addEventListener("click", clearLocalData);
function clearLocalData() {
    localStorage.removeItem("attrArray");
    localStorage.removeItem("tradeArray");
    localStorage.removeItem("dayMode");
    document.getElementById('clearAllBtnID');
    infoWindow.innerText = `Local storage cleared`
}
checkNightDay();
loadAttrNickNames();
sortTradeList();

