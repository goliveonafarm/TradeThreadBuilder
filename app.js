import * as exports from './uniqs.js';
Object.entries(exports).forEach(([name, exported]) => window[name] = exported);
let myListIndex = 0;
let myTradeItems = [];
let sortWithCategory = false;
let deleteFlag = false;
let editFlag = false;
let isDay = false;
let chosenMagicClass = null;
let chosenName = null;
let currentItem = null;
let floorActIndexer = 0;
let ethSockRadRow = document.getElementById('ethSockRadID');
let tradeThreadTextArea = document.getElementById('tradeThreadTextAreaID');
let infoWindow = document.getElementById('lblCurrentItemID');
let attributeArea = document.getElementById('attrAreaID');
let body = document.getElementsByTagName('body');
tradeThreadTextArea.style.resize = "none";

function addNewItemCopy() {
    let copyItem = currentItem;
    let copyBase = currentItem._base;
    let pushedBase = null;
    if (copyBase._type == 'Armor') pushedBase = new exports.Armor(copyBase._name, copyBase._itemClass, copyBase._tier, copyBase._minDef, copyBase._maxDef);
    if (copyBase._type == 'Weapon') pushedBase = new exports.Weapon(copyBase._name, copyBase._itemClass, copyBase._tier, copyBase._minDamage, copyBase._maxDamage);
    if (copyBase._type == 'Jewelry') pushedBase = new exports.Base(copyBase._name, copyBase._itemClass, copyBase._tier);
    pushedBase._isEth = copyBase._isEth;
    pushedBase._sockets = copyBase._sockets;
    pushedBase._magicClass = copyBase._magicClass
    let pushedItem = null;
    if (currentItem._magicClass != 'Base' && currentItem._magicClass != 'Magic' && currentItem._magicClass != 'Rare' && currentItem._magicClass != 'Crafted') {
        pushedItem = new exports.Unique(
            pushedBase,
            copyItem._name,
            copyItem._base._ed,
            copyItem._base._addedDef
        )
    } else { pushedItem = new exports.Item(pushedBase) };
    copyItem._arr.forEach(element => {
        let attrCopy = null;
        let fullNickAttrArray = exports.AttributeName.attrArray.sort();
        let filteredResult = fullNickAttrArray.filter((nickName) => {
            return nickName._attrName === element._attributeName._attrName;
        })
        filteredResult = filteredResult[0];
        if (element._attrType == 'attribute') attrCopy = new exports.Attribute(filteredResult, element._attrFloorMinVal, element._attrFloorMaxVal);
        if (element._attrType == 'skillAttribute') attrCopy = new exports.SkillAttribute(filteredResult, element._classOrTreeName, element._attrFloorMinVal, element._attrFloorMaxVal)
        if (element._attrType == 'twoFieldAttribute') {
            attrCopy = new exports.TwoFieldAttribute(filteredResult, element._attrFloorMinVal, element._attrFloorMaxVal, element._attrCeilMinVal, element._attrCeilMaxVal);
            attrCopy._attrCeilActVal = element._attrCeilActVal;
        }
        attrCopy._attrFloorActVal = element._attrFloorActVal;
        pushedItem.addAttr(attrCopy)
    })
    pushedItem._price = copyItem._price;
    copyItem._price = 0;
    myTradeItems.push(pushedItem);
    saveTradeList();
    sortTradeList();
}

document.getElementById('categBtnID').addEventListener("click", () => {
    sortWithCategory = true;
    sortTradeList();
    sortWithCategory = false;
    infoWindow.innerText = "Categorized by item class";
});

document.getElementById('removeBtnID').addEventListener("click", () => {
    if (myTradeItems.length > 0) {
        sortTradeList();
        deleteFlag = true;
        editFlag = false;
        infoWindow.innerText = `Click on an item in the trade window to remove it`;
    }
});

document.getElementById('editBtnID').addEventListener("click", () => {
    console.log('hit click event')
    if (myTradeItems.length > 0) {
        console.log('hit tradeItems > 0')
        sortTradeList();
        editFlag = true;
        deleteFlag = false;
        infoWindow.innerText = `Click on an item in the trade window to edit it.\nThis will delete your old item and queue up a copy!`;
    }
})

//document.getElementById('btnSaveAttrNickID').addEventListener("click", () => {
//    saveAttrArray();
//    infoWindow.innerText = "Saved custom attribute names";
//});

function saveAttrArray() {
    const jsonArr = JSON.stringify(exports.AttributeName.attrArray);
    localStorage.setItem("attrArray", jsonArr);
    //loadAttrNickNames();
}

//document.getElementById('btnLoadAttrNickID').addEventListener('click', () => {
//    loadAttrNickNames();
//    infoWindow.innerText = "Loaded custom attribute names";
//    updateTradeList();
//});

function saveTradeList() {
    const tradeJSONArr = JSON.stringify(myTradeItems);
    localStorage.setItem("tradeArray", tradeJSONArr);
}

function loadTradeList() {
    const tradeJSONStr = localStorage.getItem("tradeArray");
    if (tradeJSONStr != null) {
        const parsedTradeStr = JSON.parse(tradeJSONStr);
        myTradeItems = parsedTradeStr;
        updateTradeList();
        infoWindow.innerText = "Tab/enter will select the first item or click on any of them. Most buttons have mouse over tool tips. Attributes with values of 0 are hidden or removed"
    }
}

tradeThreadTextArea.addEventListener("mouseup", e => {
    let selectStart = e.target.selectionStart;
    let myString = tradeThreadTextArea.value.substring(0, selectStart);
    let mySplitArray = myString.split('\n');
    myListIndex = mySplitArray.length - 1;
    if (myTradeItems.length === 0) {
        if (editFlag && deleteFlag) {
            infoWindow.innerText = `You do not have any items in your list for that!`
            return;
        }
    }
    if (deleteFlag) {
        myTradeItems.splice(myListIndex, 1);
        sortTradeList();
        infoWindow.innerText = `Item # ${myListIndex + 1} removed`;
        saveTradeList();
    }
    if (editFlag) {
        currentItem = myTradeItems[myListIndex];
        myTradeItems.splice(myListIndex, 1)
        clearWindows();
        setEditFields();
        saveTradeList();
        sortTradeList();
        infoWindow.innerText = "";
        editFlag = false;
    }
})
document.getElementById('clearBtnID').addEventListener("click", () => {
    tradeThreadTextArea.value = ``;
    myTradeItems = [];
    saveTradeList();
    infoWindow.innerText = "Trade thread deleted.";
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
                errResetAttributes();
            } else {
                exports.AttributeName.updateValues(parsedAttrArr)
            }
        };
    } catch (error) {
        errResetAttributes()
    }
    setAttrNickNames();
}

function errResetAttributes() {
    infoWindow.innerText = `TypeError: A change was made to the attribute list and your attribute names were reset, sorry!`
    exports.AttributeName.resetNickNames();
    saveAttrArray();
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
    saveAttrArray();
    clearWindows();
    sortTradeList();
    if (currentItem != null) {
        setEditFields();
    } else {
        infoWindow.innerText = `Attribute names reset`
    }
}
function setAttrNickNames() {
    let attrHTMLRows = document.querySelectorAll('.attrColID');
    attrHTMLRows.forEach(element => element.innerHTML = ``);
    exports.AttributeName.attrArray.forEach(element => {
        let index = (exports.AttributeName.attrArray.indexOf(element));
        const row = document.createElement("div");
        row.style.fontSize = "11px"
        row.classList.add("row");

        let nameCol = document.createElement("div");
        nameCol.classList.add("col-6");
        nameCol.innerText = `${element._attrName}`;
        let nickNameCol = document.createElement("div");
        nickNameCol.classList.add("col-6");
        let nickTxtArea = document.createElement("textarea");
        nickTxtArea.classList.add('w-100', 'text-nowrap');
        nickTxtArea.setAttribute('id', 'attrTextAreaID' + index);
        nickTxtArea.setAttribute("rows", 1);
        nickTxtArea.style.overflow = "hidden";
        nickTxtArea.style.resize = "none";
        nickTxtArea.innerText = `${element._attrNickName}`;
        nickTxtArea.addEventListener("keyup", () => {
            updateAttrNickname(index);
            updateTradeList();
            saveAttrArray();
            if (currentItem != null) {
                clearWindows();
                setEditFields();
            }
        })
        nickTxtArea.addEventListener('focus', () => {
            nickTxtArea.select();
        })
        nickNameCol.appendChild(nickTxtArea);
        row.appendChild(nameCol);
        row.appendChild(nickNameCol);
        attrHTMLRows[index % 4].appendChild(row);
    });
    console.log('setAttrNickNames() successful')
}
document.getElementById("testBtnID").addEventListener("click", updateTradeList);
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


let fullNameListArray = exports.Unique.uniqueArr.concat(exports.Base.baseArray)
let mappedNameArray = fullNameListArray.map(element => {
    return element._name.toLowerCase();
});
mappedNameArray.sort();
let listGroup = document.getElementById("listGroupItemID");

const searchBar = document.getElementById('searchBarID');
searchBar.addEventListener("keyup", (e) => {
    currentItem = null;
    if (document.getElementById('listGroupAttrID')) {
        //document.getElementById('searchAttrBarID').value = ``;
        document.getElementById('listGroupAttrID').innerHTML = ``;
    }
    listGroupNamesGen(e, mappedNameArray, listGroup);
});
searchBar.addEventListener("keydown", (e) => {
    stopDefault(e)
});
searchBar.style.resize = "none";

function stopDefault(e) {
    if (e.key == 'Tab' || e.key == 'Enter') {
        e.preventDefault()
    }
}

function listGroupNamesGen(e, searchedArray, modiListGroup) {
    let _searchBar = e.target;
    let _listGroup = modiListGroup;
    _listGroup.style.zIndex = "2";
    let outPut = searchedArray;
    _listGroup.innerHTML = ``;
    const userInput = (_searchBar.value.toLowerCase());

    if (['key', 'rune', 'essence', 'potion', 'Gem',].indexOf(outPut) > -1) {
        name += ` - ${currentItem._magicClass}`
    }

    outPut = outPut.filter((name) => {
        if (name != "key" && name != "rune" && name != "essence" && name != "potion" && name != "gem" && name != "socket") {
            return name.includes(userInput)
        };
    });
    if (e.key != 'Tab' && e.key != 'Enter') {
        if (!outPut.length) {
            let g = listItemGen("no results, letters must be typed in order, including spaces, you dont have to start with the first letter(s) (capitalization does not matter).");

            _listGroup.appendChild(g);
        } else {//if clicked listeners
            for (let i = 0; i < 10 && i < outPut.length && userInput.length > 0; i++) {
                let g = listItemGen(outPut[i]);
                if (e.target.id == 'searchBarID') {
                    g.addEventListener('click', e => setChosenItem(e.target.outerText))
                } else {//if generated search bar
                    g.addEventListener('click', e => {
                        //document.getElementById('lblAttrResultID').innerText = e.target.outerText
                        //_listGroup.innerHTML = ``;
                        //document.getElementById('searchAttrBarID').value = e.target.outerText;
                        addAttributeSearch(outPut[i]);

                    })
                }
                _listGroup.appendChild(g);
            }
        }
    } else {
        if (e.target.id == 'searchBarID') {
            setChosenItem(outPut[0])
        }
        else {
            addAttributeSearch(outPut[0]);
            _listGroup.innerHTML = ``;
        }
    }
    
    if(outPut[0]) {
        return outPut[0]
    }else{
        return `Choose attribute`
    }
}

function addAttributeSearch(name) {
    let fullNickAttrArray = exports.AttributeName.attrArray.sort();
    let filteredResult = fullNickAttrArray.filter((nickName) => {
        return nickName._attrNickName.toLowerCase() === name
    })
    currentItem.addAttr(new exports.BasicAttribute(filteredResult[0], 0));
    clearWindows();
    setEditFields();
    document.getElementById('lblAttrResultID').innerText = 'Choose attribute';

}

function listItemGen(textString) {
    const listGroupItem = document.createElement("li");
    const listGroupItemTextNode = document.createTextNode(`${textString}`);
    listGroupItem.appendChild(listGroupItemTextNode);
    listGroupItem.classList.add("bg-white", 'list-group-item')

    return listGroupItem;
}

function setChosenItem(itemName) {
    let searchedItem = exports.Unique.uniqueArr.filter((item) => {
        return item._name.toLowerCase() == itemName;
    });
    if (searchedItem.length > 0) {
        currentItem = searchedItem[0];
        clearWindows();
    } else {
        searchedItem = exports.Base.baseArray.filter((item) => {
            return item._name.toLowerCase() == itemName;
        });
        clearWindows();
        currentItem = new exports.Item(searchedItem[0]);
        if (["Small Charm", "Large Charm", "Grand Charm"].indexOf(currentItem._base._name) > -1) {
            currentItem._magicClass = "Charm"
        }
        //(["Magic", "Rare", "Crafted"].indexOf(currentItem._magicClass) > -1)
        updateCurrentItemInfoWindow(currentItem);
    }
    setEditFields()

}

function displayAddItemBtn() {
    //add item button
    let addItemBtn = document.createElement("button");
    addItemBtn.classList.add("btn", "btn-sm", "btn-success", "text-nowrap", "text-dark", "removableAttrRowClass");
    let addItemBtnTextNode = document.createTextNode("Add item");
    addItemBtn.appendChild(addItemBtnTextNode);
    let addItemBtnImg = document.createElement("img");
    addItemBtnImg.src = "FontIcons/earmarkIcon.svg";
    addItemBtn.title = 'Adds the current item to your trade thread';
    addItemBtn.id = "";
    addItemBtn.appendChild(addItemBtnImg);
    addItemBtn.addEventListener("click", () => {
        try {
            document.getElementById("ethCheckBoxID").checked = false;
            addNewItemCopy();
            sortTradeList();
            clearWindows();
            infoWindow.innerText = `Added ${currentItem._name} to trade list`;
            currentItem = null;


        } catch (error) {
            infoWindow.innerText = `You do not currently have an item to add`;
            console.log(error);
        }
    })

    let modifyCol = returnCol(addItemBtn, 2);
    modifyCol.id = "addItemBtnID";

    document.getElementById("infoWindowRowID").appendChild(modifyCol);
}

function setEditFields() {
    if (currentItem == null) {
        console.log("null")
        console.log(currentItem)//wwwwwwwwwww
    }
    displayAddItemBtn();
    document.getElementById("displayEthCheckBoxID").hidden = false;
    let grabInScope = currentItem;
    //if unique
    if (chosenMagicClass == 'Unique' || chosenMagicClass == 'Misc') {
        const uniqListArr = exports.Unique.uniqueArr.map(element => {
            if (element._name == chosenName) return element;
        })
        let uniqList = [...new Set(uniqListArr)];
        attributeArea.innerHTML = ``;
        grabInScope = (uniqList[0] === undefined) ? uniqList[1] : uniqList[0]
        currentItem = grabInScope;
    }
    if (currentItem._base._type == `Weapon` || currentItem._base._type == `Armor`) { ethSockRadRow.hidden = false; }

    updateCurrentItemInfoWindow(currentItem);
    //display item name
    let nameRow = document.createElement("div");
    nameRow.classList.add("row", "removableAttrRowClass");
    let nameCol = document.createElement('h3');
    nameCol.classList.add("col")
    let nameColTextNode = document.createTextNode(currentItem._name)
    nameCol.appendChild(nameColTextNode);
    nameRow.appendChild(nameCol);

    attributeArea.appendChild(nameRow)

    //add buttons to upgrade base
    if (currentItem._magicClass === "Base") {
        //add magicClass buttons with listeners
        let btnClassRow = document.createElement("div");
        btnClassRow.classList.add("row", "removableAttrRowClass");

        let btnGroup = document.createElement("div");
        btnGroup.classList.add("btn-group")
        btnGroup.setAttribute("role", "group");

        btnGroup.appendChild(generateRadioButton('Magic'));
        btnGroup.appendChild(generateRadioButton('Rare'));
        btnGroup.appendChild(generateRadioButton('Crafted'));

        btnClassRow.appendChild(btnGroup);
        attributeArea.appendChild(btnClassRow)

        attributeArea.appendChild(createHeaderRow())
        //add row for superior input
        let superiorEditRow = document.createElement("div");
        superiorEditRow.classList.add("row", "removableAttrRowClass")

        let supCol = document.createElement("div");
        supCol.classList.add("col");
        supCol.innerText = `${exports.AttributeName.attrArray[0]._attrNickName}`
        superiorEditRow.appendChild(supCol);

        let supLowCol = document.createElement("div");
        supLowCol.classList.add("col-1");
        supLowCol.innerText = "0"
        superiorEditRow.appendChild(supLowCol);

        let supHighCol = document.createElement("div");
        supHighCol.classList.add("col-1");
        supHighCol.innerText = "15"
        superiorEditRow.appendChild(supHighCol);

        //add col for textbox
        let superActTextArea = document.createElement("textarea");
        superActTextArea.classList.add("w-100")
        superActTextArea.setAttribute("type", "number");
        superActTextArea.setAttribute("rows", 1);
        superActTextArea.innerHTML = `${currentItem._base._ed}`;
        superActTextArea.style.resize = "none";
        superActTextArea.style.overflow = "hidden";
        superActTextArea.id = 'needThis'
        superActTextArea.addEventListener("keyup", (e) => {
            if (e.target.value + 0 > 0) {
                currentItem._base._ed = e.target.value;
                currentItem._base._defActVal = currentItem._base._maxDef;
            } else {
                currentItem._base._ed = 0;
            }
            updateCurrentItemInfoWindow(currentItem);
            clearWindows();
            setEditFields();
            let g = document.getElementById('needThis');
            if (!currentItem._base._ed) {
                document.getElementById('needThis').innerHTML = ``
            }
            g.setSelectionRange(3, 3)
            if (e.key === "0") {
                g.value = 0;
            }

            g.focus();
        });
        superActTextArea.addEventListener('click', () => {
            superActTextArea.select();
        })
        superiorEditRow.appendChild(returnCol(superActTextArea, 2));
        attributeArea.appendChild(superiorEditRow);
    } else {
        attributeArea.appendChild(createCustomNameRow());

    }
    //add attribute searchbar
    if (["Magic", "Rare", "Crafted", "Charm"].indexOf(currentItem._magicClass) > -1) {
        let fullNickAttrArray = exports.AttributeName.attrArray.sort();
        let mappedNickArray = fullNickAttrArray.map(element => {
            return element._attrNickName.toLowerCase();
        });

        let searchAttrRow = document.createElement("div");
        searchAttrRow.classList.add("row", "removableAttrRowClass");

        let searchAttrCol = document.createElement("div");
        searchAttrCol.classList.add("col-5");

        let searchAttrBar = document.createElement("textarea");
        searchAttrBar.setAttribute("rows", 1);
        searchAttrBar.classList.add("w-100", "text-nowrap")
        searchAttrBar.placeholder = `Search and select an attribute`;
        searchAttrBar.style.resize = "none";
        searchAttrBar.style.overflow = "hidden";
        searchAttrBar.id = "searchAttrBarID";
        searchAttrBar.addEventListener('focus', () => {
            searchAttrBar.select();
        })

        searchAttrCol.appendChild(searchAttrBar);
        searchAttrRow.appendChild(searchAttrCol);
        let lblAttrResult = document.createElement("div");
        lblAttrResult.id = 'lblAttrResultID';
        lblAttrResult.innerText = 'Choose attribute'
        lblAttrResult.classList.add("col");
        searchAttrRow.appendChild(lblAttrResult);

        attributeArea.appendChild(searchAttrRow);

        let listGroupRow = document.createElement("div");
        listGroupRow.classList.add('row');

        let listGroupCol = document.createElement("div");
        listGroupCol.classList.add("col-12");

        let listGroupUl = document.createElement("ul");
        listGroupUl.classList.add("list-group", "position-absolute");
        listGroupUl.id = "listGroupAttrID"

        listGroupCol.appendChild(listGroupUl);
        listGroupRow.appendChild(listGroupCol);
        attributeArea.appendChild(listGroupRow);

        //line break row
        let lineBrkRow = document.createElement("br");
        attributeArea.appendChild(lineBrkRow)

        let listGroupAttr = document.getElementById("listGroupAttrID");
        searchAttrBar.addEventListener("keyup", (e) => {
            searchBar.value = ``;
            listGroup.innerHTML = ``;
            let thisValue = listGroupNamesGen(e, mappedNickArray, listGroupAttr);
            document.getElementById('lblAttrResultID').innerText = thisValue;
            if (!searchAttrBar.value) { document.getElementById('lblAttrResultID').innerText = "Choose attribute" };

        });
        searchAttrBar.addEventListener("keydown", (e) => { stopDefault(e) });

    }

    //add MinMax header row
    if (grabInScope._magicClass != "Base") {
        attributeArea.appendChild(createHeaderRow())
    }

    //add special row if no ed and no extra defense
    if (grabInScope._base._ed == 0 && /*grabInScope._base._addedDef == 0 && */grabInScope._base._defActVal != undefined) {
        let ethMult = (grabInScope._base._isEth) ? 1.5 : 1;
        let newRow = generateRowForDefOnly(currentItem, ethMult)
        attributeArea.appendChild(newRow);
    }
    //generate row for sockets only on bases
    if (currentItem._magicClass === "Base") {
        // let getThisRow = generateRowForField()
        attributeArea.appendChild(generateRowForSocketsOnly(currentItem));
    }
    grabInScope._arr.forEach(item => {
        let newRow = generateRowForField(item);
        attributeArea.appendChild(newRow)
    })
    let newRow = generateRowForPrice(currentItem);
    attributeArea.appendChild(newRow);
}

function generateRadioButton(lblText) {
    let colDiv = document.createElement("div");
    colDiv.classList.add("col-2")
    let genBtn = document.createElement("button");
    genBtn.classList.add("btn", "btn-sm", "btn-outline-primary", "text-light");

    let genBtnTextNode = document.createTextNode(`${lblText}`);
    genBtn.appendChild(genBtnTextNode);
    genBtn.addEventListener("click", e => {
        setMagicClass(e)
    })
    colDiv.appendChild(genBtn)

    return colDiv;
}

function createHeaderRow() {
    let headerRow = document.createElement("div");
    headerRow.classList.add("row", "removableAttrRowClass");

    let emptyHeaderLeaderCol = document.createElement("div");
    emptyHeaderLeaderCol.classList.add("col")
    headerRow.appendChild(emptyHeaderLeaderCol)

    let minHeaderCol = document.createElement("div");
    minHeaderCol.classList.add("col-1");
    let minHeaderColTextNode = document.createTextNode("Min")
    minHeaderCol.appendChild(minHeaderColTextNode);
    headerRow.appendChild(minHeaderCol);

    let maxHeaderCol = document.createElement("div");
    maxHeaderCol.classList.add("col-1");
    let maxHeaderColTextNode = document.createTextNode("Max");
    maxHeaderCol.appendChild(maxHeaderColTextNode);
    headerRow.appendChild(maxHeaderCol);

    let emptyHeaderEndCol = document.createElement("div");
    emptyHeaderEndCol.classList.add("col-2")
    headerRow.appendChild(emptyHeaderEndCol);

    return headerRow;
}

function createCustomNameRow() {
    let customNameRow = document.createElement("div");
    customNameRow.classList.add("row", "removableAttrRowClass", "pb-3");

    let customTextAreaCol = document.createElement("div");
    customTextAreaCol.classList.add("col-5");
    let customTextArea = document.createElement("textarea");
    customTextArea.classList.add("w-100", "text-nowrap");
    customTextArea.setAttribute("rows", 1);
    customTextArea.placeholder = "Optional"
    if (!currentItem._customName) { customTextArea.innerHTML = currentItem._customName }
    customTextArea.style.resize = "none";
    customTextArea.style.overflow = "hidden";
    customTextArea.id = "customTextAreaID";
    customTextArea.addEventListener('keyup', () => {
        let customTextAreaElem = document.getElementById("customTextAreaID");
        currentItem._customName = customTextAreaElem.value;
        clearWindows();
        setEditFields();
        document.getElementById("customTextAreaID").select();
        document.getElementById("customTextAreaID").value = currentItem._customName
    })
    customTextArea.addEventListener('focus', () => {
        //customTextArea.select();
    })
    customTextAreaCol.appendChild(customTextArea);
    customNameRow.appendChild(customTextAreaCol);

    let customNameLabel = document.createElement("div");
    customNameLabel.classList.add("col");
    let customNameLabelTextNode = document.createTextNode("Customize item name or add affixes")
    customNameLabel.appendChild(customNameLabelTextNode);
    customNameRow.appendChild(customNameLabel);

    return customNameRow;
}

function setMagicClass(e) {
    currentItem._magicClass = e.target.innerHTML;
    currentItem._base._ed = 0;
    clearWindows();
    setEditFields();
}

function generateRowForPrice(itemToGen) {
    //1.1 create row to hold price col
    const thisRow = document.createElement("div");
    thisRow.classList.add("row", "removableAttrRowClass");

    //1.2 create header col
    const priceHeaderCol = document.createElement("div");
    const attrNickText = document.createTextNode(`Price (optional)`);
    priceHeaderCol.appendChild(attrNickText);
    thisRow.appendChild(returnCol(priceHeaderCol, 0));

    //2.1 create price col
    const priceTextArea = document.createElement("textarea");
    priceTextArea.classList.add("w-100");
    priceTextArea.setAttribute("type", "number");
    priceTextArea.setAttribute("rows", 1);
    priceTextArea.innerHTML = `${itemToGen._price}`;
    priceTextArea.style.resize = "none";
    priceTextArea.style.overflow = "hidden";
    priceTextArea.addEventListener("keyup", (e) => {
        itemToGen._price = (e.target.value)
        updateCurrentItemInfoWindow(currentItem);
    });
    priceTextArea.addEventListener('focus', () => {
        priceTextArea.select();
    })
    thisRow.appendChild(returnCol(priceTextArea, 2));
    return thisRow;
}
function returnCol(divTag, colSize) {
    let insertIntoCol = divTag;
    let _colSize = `col-${colSize}`;
    if (colSize === 0) {
        _colSize = `col`;
    }

    let returnColumn = document.createElement("div");
    returnColumn.classList.add(_colSize)
    returnColumn.appendChild(insertIntoCol);

    return returnColumn;
}
function generateRowForSocketsOnly(itemToGen) {
    let base = itemToGen._base;
    const thisRow = document.createElement("div");
    thisRow.classList.add("row", "removableAttrRowClass");

    const attrNickCol = document.createElement("div");
    const attrNickText = document.createTextNode(`${exports.AttributeName.attrArray[86]._attrNickName}`);
    attrNickCol.appendChild(attrNickText);
    thisRow.appendChild(returnCol(attrNickCol, 0));

    const socketTextArea = document.createElement("textarea");
    socketTextArea.classList.add("w-100");
    socketTextArea.setAttribute("type", "number");
    socketTextArea.setAttribute("rows", 1);
    socketTextArea.innerHTML = `${base._sockets}`;
    socketTextArea.style.resize = "none";
    socketTextArea.style.overflow = "hidden";
    socketTextArea.addEventListener("keyup", (e) => {
        base._sockets = (e.target.value)
        console.log(currentItem)
        updateCurrentItemInfoWindow(currentItem);
    });
    socketTextArea.addEventListener('focus', () => {
        socketTextArea.select();
    })
    thisRow.appendChild(returnCol(socketTextArea, 2));

    return thisRow;
}
function generateRowForDefOnly(itemToGen, ethMult) {
    let base = itemToGen._base;
    const thisRow = document.createElement("div");
    thisRow.classList.add("row", "removableAttrRowClass");
    //1.1 f
    const attrNickCol = document.createElement("div");
    const attrNickText = document.createTextNode(`(Total) ${exports.AttributeName.attrArray[2]._attrNickName}`);
    attrNickCol.appendChild(attrNickText);
    thisRow.appendChild(returnCol(attrNickCol, 0))
    //2.1 dMin
    const baseMinCol = document.createElement("div");
    const baseMinText = document.createTextNode(`${Math.floor(base._minDef * ethMult)}`);
    baseMinCol.appendChild(baseMinText);
    thisRow.appendChild(returnCol(baseMinCol, 1));
    //2.2 dmax
    const baseMaxCol = document.createElement("div");
    const baseMaxText = document.createTextNode(`${Math.floor(base._maxDef * ethMult)}`);
    baseMaxCol.appendChild(baseMaxText);
    thisRow.appendChild(returnCol(baseMaxCol, 1))
    //2.3 dAct
    const defActTextArea = document.createElement("textarea");
    defActTextArea.classList.add("w-100");
    defActTextArea.setAttribute("type", "number");
    defActTextArea.setAttribute("rows", 1);
    defActTextArea.innerHTML = `${base._defActVal}`;
    defActTextArea.style.resize = "none";
    defActTextArea.style.overflow = "hidden";
    defActTextArea.addEventListener("keyup", (e) => {
        base._defActVal = (parseInt(e.target.value))
        updateCurrentItemInfoWindow(currentItem);
    });
    defActTextArea.addEventListener('focus', () => {
        defActTextArea.select();
    })
    thisRow.appendChild(returnCol(defActTextArea, 2));
    return thisRow;
}

function generateRowForField(attr) {
    const thisRow = document.createElement("div");
    thisRow.classList.add("row", "removableAttrRowClass");
    //1.1F 0
    if (attr._attributeName._attrNickName != ``) {
        const attrNickCol = document.createElement("div");
        attrNickCol.classList.add("col");

        const attrNickText = document.createTextNode(attr._attributeName._attrName == 'Quantity' ? `Amount -` : `${attr._attributeName._attrNickName}`);
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
    if (attr._attrFloorMinVal) {
        const attrFloorMinCol = document.createElement("div");
        attrFloorMinCol.classList.add("col-1");
        const attrFloorMinText = document.createTextNode(`${attr._attrFloorMinVal}`);
        attrFloorMinCol.appendChild(attrFloorMinText);
        thisRow.appendChild(attrFloorMinCol)
    }
    //1.3 aFMaxV 3
    if (attr._attrFloorMaxVal) {
        const attrFloorMaxCol = document.createElement("div");
        attrFloorMaxCol.classList.add("col-1");
        const attrFloormaxText = document.createTextNode(`${attr._attrFloorMaxVal}`);
        attrFloorMaxCol.appendChild(attrFloormaxText);
        thisRow.appendChild(attrFloorMaxCol)
    }
    //1.4 aFAV text area 4
    const attrFloorActTextArea = document.createElement("textarea");
    attrFloorActTextArea.classList.add("w-100");
    attrFloorActTextArea.setAttribute("type", "number");
    attrFloorActTextArea.setAttribute("rows", 1);
    attrFloorActTextArea.setAttribute("id", `attrFloorTextAreaID${floorActIndexer}`)
    attrFloorActTextArea.innerHTML = `${attr._attrFloorActVal}`;
    attrFloorActTextArea.style.resize = "none";
    attrFloorActTextArea.style.overflow = "hidden";
    attrFloorActTextArea.addEventListener("keyup", (e) => {
        attr._attrFloorActVal = (e.target.value)
        if (attr._attributeName._attrName === "Level Requirement") {
            currentItem._levelReq = attr._attrFloorActVal
        };
        if (attr._attributeName._attrName === "Enhanced Defense %") {
            clearWindows();
            setEditFields();
        }
        if (attr._attributeName._attrName === "Defense") {
            currentItem._base._addedDef = attr._attrFloorActVal;
        }
        if (attr._attrFloorActVal === '0' && !(currentItem instanceof exports.Unique)) {
            let removeIndexer = currentItem._arr.indexOf(attr);
            currentItem._arr.splice(removeIndexer, 1)
            clearWindows();
            setEditFields();
        }
        updateCurrentItemInfoWindow(currentItem);
    })
    attrFloorActTextArea.addEventListener('focus', () => {
        attrFloorActTextArea.select();
    })
    thisRow.appendChild(returnCol(attrFloorActTextArea, 2));

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
        attrCeilActTextArea.addEventListener('focus', () => {
            attrCeilActTextArea.select();
        })
        thisRow.classList.add("justify-content-center")
        thisRow.appendChild(attrCeilActTextArea);
    }
    floorActIndexer++;
    return thisRow;
}

document.getElementById("ethCheckBoxID").addEventListener("click", (e) => {
    if (e.currentTarget.checked) {
        currentItem._base._isEth = true
        console.log(true);
        console.log(currentItem);
    } else { currentItem._base._isEth = false };
    clearWindows();
    setEditFields();
    console.log(currentItem)
})

function returnAttributeNameObj(attrName) {
    let fullNickAttrArray = exports.AttributeName.attrArray.sort();
    let filteredResult = fullNickAttrArray.filter((name) => {
        return name._attrName === attrName;
    })
    filteredResult = filteredResult[0];
    return filteredResult;
}

function updateCurrentItemInfoWindow(element) {
    infoWindow.innerText = ``;
    element._arr.forEach(elementOne => {//wwwwwwwwwwwwwwwwwwwwwwww
        let g = returnAttributeNameObj(elementOne._attributeName._attrName);
        elementOne._attributeName = g;
        if (elementOne._attributeName._attrName == "Enhanced Defense %" /*|| elementOne._attributeName._attrName == "Enhanced Damage %"*/) { element._base._ed = elementOne._attrFloorActVal; }
        if (elementOne._attributeName._attrName == "Defense") { element._base._addedDef = elementOne._attrFloorActVal; }
        if (elementOne._attributeName._attrName == "Open Sockets") { element._base._sockets = elementOne._attrFloorActVal; }

    })
    let tempString = ``;
    let eachString = ``;
    let name = element._name;
    let isEth = (element._base._isEth) ? ` / Ethereal` : ``;
    let lvlReq = (element._levelReq != 0) ? ` / ${exports.AttributeName.attrArray[79]._attrNickName} ${element._levelReq}` : ``;
    let sockets = (element._base._sockets != 0 || element._magicClass == null) ? ` / ${element._base._sockets} ${exports.AttributeName.attrArray[86]._attrNickName}` : ``;
    let ed = (element._base._ed != null && element._base._type == 'Armor') ? ` / ${exports.AttributeName.attrArray[0]._attrNickName} ${element._base._ed}` : ` / ${exports.AttributeName.attrArray[1]._attrNickName}${element._base._ed}`;
    if (element._base._ed == 0 || element._base._ed == null) { ed = `` }
    let def = (element._base._type == 'Armor') ? ` / ${calcDefHere(element)} ${exports.AttributeName.attrArray[2]._attrNickName} ` : ``;
    if (element._base._defActVal == 0 || !Number.isInteger(element._base._defActVal)) { def = `` };
    if (element._base._ed > 0 && element._magicClass === "Base") {
        name += ` - ${exports.AttributeName.attrArray[85]._attrNickName}`;
    }
    if (['Magic', 'Rare', 'Crafted'].indexOf(element._magicClass) > -1) {
        name += ` - ${element._magicClass}`
    }
    if (element._customName) { name = element._customName };
    tempString += `${name}${isEth}${sockets}${ed}${def}${lvlReq}`;
    if (element._magicClass == null) { tempString = `${name}${isEth}${sockets}${ed}${def}` };
    let array = element._arr;
    array.forEach(elementTwo => {
        let shrtAttrName = elementTwo._attributeName._attrName;
        if (elementTwo._attrFloorActVal != 0) {
            if (shrtAttrName != 'Enhanced Defense %' && shrtAttrName != 'Open Sockets' /*&& shrtAttrName != 'Enhanced Damage %' */ && shrtAttrName != 'Quantity' && shrtAttrName != 'Defense' && shrtAttrName != 'Level Requirement') {
                tempString += ` / ${elementTwo._attributeName._attrNickName}`;
                if (elementTwo._attrType == 'skillAttribute') {
                    tempString += ` ${elementTwo._classOrTreeName}`;
                }
                tempString += ` ${elementTwo._attrFloorActVal}`
                if (elementTwo._attrType == 'twoFieldAttribute') {
                    tempString += ` - ${elementTwo._attrCeilActVal}`;
                }
            }
            if (shrtAttrName == 'Quantity') {
                if (elementTwo._attrFloorActVal > 1) {
                    tempString += ` ${elementTwo._attributeName._attrNickName} ${elementTwo._attrFloorActVal}`;
                    eachString = ` / each`
                }
            }
            if (shrtAttrName == 'Defense') {
                tempString += `/ +${elementTwo._attrFloorActVal} ${elementTwo._attributeName._attrNickName}`
            }
        }
    })
    if (element._price != 0) {
        tempString += ` - ${element._price} ${exports.AttributeName.attrArray[3]._attrNickName} ${eachString}`
    }
    infoWindow.innerText = tempString;
    return (tempString);
}

let moonIcon = document.getElementById('moonIconID');
moonIcon.addEventListener("click", setNightMode);
let sunIcon = document.getElementById('sunIconID');
sunIcon.addEventListener("click", setDayMode);
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
    body[0].classList.remove("bg-dark", 'text-light');
    body[0].classList.add('bg-success', "bg-gradient");
    tradeThreadTextArea.classList.remove('bg-dark', 'text-light');
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
    isDay = true;
    const jsonArr = JSON.stringify(isDay);
    localStorage.setItem('dayMode', isDay);
}
function setNightMode() {
    body[0].classList.remove("bg-success", "bg-gradient")
    body[0].classList.add('bg-dark', 'text-light')
    tradeThreadTextArea.classList.add('bg-dark', 'text-light');
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
    isDay = false;
    const jsonArr = JSON.stringify(isDay);
    localStorage.setItem('dayMode', isDay);
}
document.getElementById('clearAllBtnID').addEventListener("click", clearLocalData);
function clearLocalData() {
    let removeKeys = ["attrArray", "tradeArray", "dayMode"];
    removeKeys.forEach(k => localStorage.removeItem(k));
    document.getElementById('clearAllBtnID');
    clearWindows();//wwwwwwwwwwwwwwwwwww
    tradeThreadTextArea.value = ``
    infoWindow.innerText = `All page settings and saved trades were deleted`
}

function clearWindows() {
    attributeArea.innerHTML = ``;
    infoWindow.innerText = ``;
    listGroup.innerHTML = ``;
    searchBar.value = ``;
    document.getElementById("displayEthCheckBoxID").hidden = true;
    let tryMe = document.getElementById("addItemBtnID")
    if (tryMe) { tryMe.remove() }

}

checkNightDay();
loadAttrNickNames();
loadTradeList();

document.getElementsByTagName("body")[0].addEventListener("click", (e) => {
    console.log(e)
    //console.log(currentItem)
    console.log('LINE BREAK --------------------------------')
})


