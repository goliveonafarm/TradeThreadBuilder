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
let bgSecondaryIndexer = 0;
const noItemsStr = "You do not have anything for trade"
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
    if (copyBase._type == 'Armor') {
        pushedBase = new exports.Armor(copyBase._name, copyBase._itemClass, copyBase._tier, copyBase._minDef, copyBase._maxDef);
        pushedBase._defActVal = copyBase._defActVal;
        pushedBase._ed = copyBase._ed;
        pushedBase._maxDef = copyBase._maxDef;
        pushedBase._minDef = copyBase._minDef;
        pushedBase._addedDef = copyBase._addedDef;
    };
    if (copyBase._type == 'Weapon') pushedBase = new exports.Weapon(copyBase._name, copyBase._itemClass, copyBase._tier, copyBase._minDamage, copyBase._maxDamage);
    if (copyBase._type == 'Jewelry') pushedBase = new exports.Base(copyBase._name, copyBase._itemClass, copyBase._tier);
    pushedBase._isEth = copyBase._isEth;
    pushedBase._sockets = copyBase._sockets;
    pushedBase._magicClass = copyBase._magicClass;
    pushedBase._itemClass = copyBase._itemClass;
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
        if (element._attrType == 'basic') {
            attrCopy = new exports.BasicAttribute(filteredResult, element._attrFloorMaxVal)
        }
        try {
            attrCopy._attrFloorActVal = element._attrFloorActVal;
        } catch (err) { console.log(err) }
        pushedItem.addAttr(attrCopy)
    })

    pushedItem._price = copyItem._price;
    copyItem._price = 0;
    myTradeItems.unshift(pushedItem);
    saveTradeList();
    //sortTradeList();
}

document.getElementById('categBtnID').addEventListener("click", () => {
    if (myTradeItems.length > 0) {
        sortWithCategory = true;
        sortTradeList();
        sortWithCategory = false;
        infoWindow.innerText = "Categorized by item class";
    } else {
        infoWindow.innerText = noItemsStr;
    }
});

document.getElementById('removeBtnID').addEventListener("click", () => {
    if (myTradeItems.length > 0) {
        sortTradeList();
        deleteFlag = true;
        editFlag = false;
        infoWindow.innerText = `Click on an item in the trade window to remove it`;
    } else {
        infoWindow.innerText = noItemsStr;
    }
});

document.getElementById('editBtnID').addEventListener("click", () => {
    if (myTradeItems.length > 0) {
        sortTradeList();
        editFlag = true;
        deleteFlag = false;
        infoWindow.innerText = `Click on an item in the trade window to edit it.\nThis will delete your old item and queue up a copy!`;
    } else {
        infoWindow.innerText = noItemsStr;
    }
})

function saveAttrArray() {
    const jsonArr = JSON.stringify(exports.AttributeName.attrArray);
    localStorage.setItem("attrArray", jsonArr);
}

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
    if (myTradeItems.length > 0) {
        if (confirm("Delete trade list?")) {
            tradeThreadTextArea.value = ``;
            myTradeItems = [];
            saveTradeList();
            infoWindow.innerText = "Trade thread deleted.";
        }
    } else {
        infoWindow.innerText = noItemsStr;
    }
})
document.getElementById('clipboardBtnID').addEventListener("click", () => {
    if (myTradeItems.length > 0) {
        tradeThreadTextArea.select();
        document.execCommand("copy");
        infoWindow.innerText = "Copied to clipboard!"
    } else {
        infoWindow.innerText = noItemsStr;
    }
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
let rowNumber = 0;
function setAttrNickNames() {
    let attrHTMLRows = document.querySelectorAll('.attrColID');
    attrHTMLRows.forEach(element => element.innerHTML = ``);
    exports.AttributeName.attrArray.forEach((element, index) => {
        const row = document.createElement("div");
        row.style.fontSize = "11px"
        row.classList.add("row", "border", "border-secondary");
        if (bgSecondaryIndexer++ % 4 == 0) { rowNumber++ };
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
    let isRuneWordItem = (element instanceof exports.RuneWordItem)
    let ethMultiplier = (element._base._isEth) ? 1.50 : 1.00;
    let ed = parseFloat(element._base._ed);
    let def = parseFloat(element._base._defActVal);
    let addedDef = parseFloat(element._base._addedDef);
    if (ed === null || isNaN(ed)) return ((def * ethMultiplier) + addedDef);
    if (ed != 0 && ed != null) { def += 1 }
    if (isRuneWordItem) {
        let edAttr = element._arr.filter(attr => {
            return attr._attributeName._attrName === "Enhanced Defense %";
        })
        if (edAttr.length > 0) {
            ed += parseFloat(edAttr[0]._attrFloorActVal);
        }
    }
    let g = addedDef + Math.floor((parseFloat(def * ethMultiplier)) * ((parseFloat(ed) * 0.01) + 1));
    return g;
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
        if (!outPut.length) {//out array is empty
            let g = listItemGen("no results, letters must be typed in order, including spaces, you dont have to start with the first letter(s) (capitalization does not matter).");

            _listGroup.appendChild(g);
        } else {//this runs if there are things in output array
            for (let i = 0; i < 15 && i < outPut.length && userInput.length > 0; i++) {
                let g = listItemGen(outPut[i]);
                if (e.target.id === 'searchBarID') {//this runs if item search bar
                    g.addEventListener('click', e => setChosenItem(e.target.outerText))
                } else if (e.target.id === 'searchAttrBarID') {//this runs if attr search bar
                    g.addEventListener('click', e => {
                        addAttributeSearch(outPut[i]);
                    })
                    g.addEventListener('mouseover', e => {
                        document.getElementById('lblAttrResultID').innerText = e.target.innerText;
                    })
                } else {//this runs if NOT item search bar AND not in attr search bar
                    g.addEventListener('click', e => {
                        addRuneword(outPut[i]);
                    })
                    g.addEventListener('keydown', e => {
                        document.getElementById('lblRuneWordResultID').innerText = e.target.value
                    })
                    g.addEventListener('mouseover', e => {
                        document.getElementById('lblRuneWordResultID').innerText = e.target.innerText;
                    })
                }
                _listGroup.appendChild(g);
            }
        }
    } else {//if we hit enter or tab this will run
        if (e.target.id == 'searchBarID') {//this will run on item search bar
            setChosenItem(outPut[0])
        }
        else if (e.target.id == 'searchAttrBarID') {//this runs if NOT item search bar
            addAttributeSearch(outPut[0]);
            _listGroup.innerHTML = ``;
        }
        else {
            addRuneword(outPut[0]);
            _listGroup.innerHTML = ``;
        }
    }
    //this always runs
    //we dont always accept variable being returned?
    if (outPut[0]) {
        return outPut[0]
    } else {
        return `Choose attribute`
    }
}

function addRuneword(runewordName) {
    let fullRunewordArray = exports.RuneWord.RuneWordArray.sort();
    let filteredResult = fullRunewordArray.filter((runeword) => {
        return runeword._runeWordName.toLowerCase() === runewordName
    })
    const newRuneWord = new exports.RuneWordItem(currentItem._base, filteredResult[0]);
    currentItem = newRuneWord;

    clearWindows();
    setEditFields();
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

function addCustomAttribute(name) {
    currentItem.addAttr(new exports.SkillAttribute(exports.AttributeName.attrArray[87], name, 0, 0));
    clearWindows();
    setEditFields();
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
    clearWindows();
    if (searchedItem.length > 0) {
        currentItem = searchedItem[0];
    } else {
        searchedItem = exports.Base.baseArray.filter((item) => {
            return item._name.toLowerCase() == itemName;
        });
        currentItem = new exports.Item(searchedItem[0]);
        if (["Small Charm", "Large Charm", "Grand Charm"].indexOf(currentItem._base._name) > -1) {
            currentItem._magicClass = "Charm"
        }
    }
    setEditFields()
}

function displayAddItemBtn() {
    //add item button
    let addItemBtn = document.createElement("button");
    addItemBtn.classList.add("btn", "btn-sm", "btn-primary", "text-light", "bg-gradient", "removableAttrRowClass", "w-100", "text-nowrap");
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
            clearWindows();
            updateTradeList();
            infoWindow.innerText = `Added ${currentItem._name} to trade list`;
            currentItem = null;
        } catch {
            infoWindow.innerText = `You do not currently have an item to add`;
        }
    })

    let modifyCol = returnCol(addItemBtn, 2);
    modifyCol.classList.add("text-end")
    modifyCol.id = "addItemBtnID";

    document.getElementById("infoWindowRowID").appendChild(modifyCol);
}

function setEditFields() {
    floorActIndexer = 0;
    if (currentItem == null) {
    }
    displayAddItemBtn();
    if (!(currentItem instanceof exports.QuantizedItem)) {
        document.getElementById("displayEthCheckBoxID").hidden = false;

    }
    //if unique
    if (chosenMagicClass == 'Unique' || chosenMagicClass == 'Misc') {
        const uniqListArr = exports.Unique.uniqueArr.map(element => {
            if (element._name == chosenName) return element;
        })
        let uniqList = [...new Set(uniqListArr)];
        attributeArea.innerHTML = ``;
        currentItem = (uniqList[0] === undefined) ? uniqList[1] : uniqList[0]
        currentItem = currentItem;
    }
    if (currentItem._base._type == `Weapon` || currentItem._base._type == `Armor`) { ethSockRadRow.hidden = false; }

    updateCurrentItemInfoWindow(currentItem);
    //display item name

    attributeArea.appendChild(returnNameRow())

    //if base - add buttons to upgrade
    if (currentItem._magicClass === "Base" || currentItem._magicClass === "Jewel") {
        //add magicClass buttons with listeners
        let btnClassRow = document.createElement("div");
        btnClassRow.classList.add("row", "removableAttrRowClass", "justify-content-end");

        console.log(currentItem)
        btnClassRow.appendChild(generateRadioButton('Magic'));
        btnClassRow.appendChild(generateRadioButton('Rare'));
        btnClassRow.appendChild(generateRadioButton('Crafted'));
        if (!(currentItem._magicClass === "Jewel")) {
            btnClassRow.appendChild(generateRadioButton('Runeword'));
        }

        attributeArea.appendChild(btnClassRow)

        //insert search attribute row
        let fullNickAttrArray = exports.AttributeName.attrArray.sort();
        let mappedNickArray = fullNickAttrArray.map(element => {
            return element._attrNickName.toLowerCase();
        });

        //all variables
        let mappedAttrArray = mappedNickArray;
        let searchAttrBarID = "searchAttrBarID"
        let searchAttrBarPlaceholder = "Search and select an attribute"
        let lblAttrResultID = "lblAttrResultID"
        let lblAttrResultInnerText = "Search for an attribute to add to this item"
        //add search bar for attributes
        generateSearchBar(mappedAttrArray, searchAttrBarID, searchAttrBarPlaceholder, lblAttrResultID, lblAttrResultInnerText);
        attributeArea.appendChild(createHeaderRow())
        if (currentItem._base._type === "Armor") {
            let returnedEditRow = returnSuperiorEditRow();
            attributeArea.appendChild(returnedEditRow);
        }
    } else {
        attributeArea.appendChild(createCustomNameRow('customTextAreaID', "Customize item name or add affixes"));
    }

    //add attribute searchbar
    if (["Magic", "Rare", "Crafted", "Charm", "Runeword", "Jewel"].indexOf(currentItem._magicClass) > -1) {
        let fullNickAttrArray = exports.AttributeName.attrArray.sort();
        let mappedNickArray = fullNickAttrArray.map(element => {
            return element._attrNickName.toLowerCase();
        });
        //all variables
        let mappedAttrArray = mappedNickArray;
        let searchAttrBarID = "searchAttrBarID"
        let searchAttrBarPlaceholder = "Search and select an attribute"
        let lblAttrResultID = "lblAttrResultID"
        let lblAttrResultInnerText = "Search for an attribute to add to this item"
        //add search bar for attributes
        generateSearchBar(mappedAttrArray, searchAttrBarID, searchAttrBarPlaceholder, lblAttrResultID, lblAttrResultInnerText);
    }

    //add MinMax header row
    if (currentItem._magicClass != "Base") {
        //add custom attribute search bar
        attributeArea.appendChild(createCustomNameRow('customAttributeAreaID', "Add custom attribute"));
        attributeArea.appendChild(createHeaderRow())
    }

    //add special row if no ed and no extra defense
    let ethMult = (currentItem._base._isEth) ? 1.5 : 1;
    let filteredResult = currentItem._arr.filter((attr) => {
        return attr._attributeName._attrName === "Enhanced Defense %";
    })
    let runewordHasEDBasic = false
    if (filteredResult && currentItem._magicClass == "Runeword") {
        runewordHasEDBasic = true
    }
    if (currentItem._base._ed == 0 && currentItem._base._defActVal != undefined && !runewordHasEDBasic) {
        let newRow = generateRowForDefOnly(currentItem, ethMult)
        attributeArea.appendChild(newRow);
    }
    //insert superior row  & runeword search bar
    if (currentItem._magicClass == "Runeword") {
        if (filteredResult[0] instanceof exports.BasicAttribute) {
            let newRow = generateRowForDefOnly(currentItem, ethMult)
            attributeArea.appendChild(newRow);
        }
        if (currentItem._base._type === "Armor") {
            let returnedEditRow = returnSuperiorEditRow();
            attributeArea.appendChild(returnedEditRow);
        }
    }
    //generate row for sockets only on bases
    if (currentItem._magicClass === "Base") {
        // let getThisRow = generateRowForField()
        attributeArea.appendChild(generateRowForSocketsOnly(currentItem));
    }
    //iterate over all skills in item array
    currentItem._arr.forEach(item => {
        let newRow = generateRowForField(item);
        attributeArea.appendChild(newRow)
    })
    let newRow = generateRowForPrice(currentItem);
    attributeArea.appendChild(newRow);
}

//creates searchAttrRow & listgroup row
function generateSearchBar(mappedArray, searchBarID, searchBarPlaceholder, lblResultID, lblResultInnerText) {
    let searchAttrRow = document.createElement("div");
    searchAttrRow.classList.add("row", "removableAttrRowClass");
    let searchAttrCol = document.createElement("div");
    searchAttrCol.classList.add("col-6");
    let searchAttrBar = document.createElement("textarea");
    searchAttrBar.setAttribute("rows", 1);
    searchAttrBar.classList.add("w-100", "text-nowrap")
    searchAttrBar.placeholder = searchBarPlaceholder;
    searchAttrBar.style.resize = "none";
    searchAttrBar.style.overflow = "hidden";
    searchAttrBar.id = searchBarID;
    searchAttrBar.addEventListener('focus', () => {
        searchAttrBar.select();
    })

    searchAttrCol.appendChild(searchAttrBar);
    let lblAttrResult = document.createElement("div");
    lblAttrResult.id = lblResultID;
    lblAttrResult.innerText = lblResultInnerText
    lblAttrResult.classList.add("col-6", "text-end");

    searchAttrRow.appendChild(lblAttrResult);
    searchAttrRow.appendChild(searchAttrCol);

    //SECOND ROW FOR SEARCH RESULTS
    let listGroupRow = document.createElement("div");
    listGroupRow.classList.add('row', 'pb-3');
    let listGroupFillerCol = document.createElement("div");
    listGroupFillerCol.classList.add("col-6");
    listGroupRow.appendChild(listGroupFillerCol)
    let listGroupCol = document.createElement("div");
    listGroupCol.classList.add("col");
    let listGroupUl = document.createElement("ul");
    listGroupUl.classList.add("list-group", "position-absolute");
    listGroupUl.id = "listGroupAttrID"
    listGroupCol.appendChild(listGroupUl);
    listGroupRow.appendChild(listGroupCol);

    attributeArea.appendChild(searchAttrRow);
    attributeArea.appendChild(listGroupRow);

    searchAttrBar.addEventListener("keydown", (e) => { stopDefault(e) });

    searchAttrBar.addEventListener("keyup", (e) => {
        let listGroupAttr = document.getElementById("listGroupAttrID");
        searchBar.value = ``;
        listGroup.innerHTML = ``;
        let thisValue = listGroupNamesGen(e, mappedArray, listGroupAttr);
        if (document.getElementById(lblResultID)) {
            document.getElementById(lblResultID).innerText = thisValue;
        }
        if (!searchAttrBar.value) { document.getElementById(lblResultID).innerText = lblResultInnerText };
    });

}

function returnSuperiorEditRow() {
    //add row for superior input
    let superiorEditRow = document.createElement("div");
    superiorEditRow.classList.add("row", "removableAttrRowClass")
    if (bgSecondaryIndexer++ % 2 == 0) { superiorEditRow.classList.add("bg-secondary") }

    const formatCol = document.createElement("div");
    formatCol.classList.add("col-5","d-none","d-sm-block")
    superiorEditRow.appendChild(formatCol);

    let supCol = document.createElement("div");
    supCol.classList.add("col");
    supCol.innerText = `Base ${exports.AttributeName.attrArray[0]._attrNickName}`
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
        } else {//oooooooooooooooooooooooooooooo
            currentItem._base._ed = 0;
        }
        updateCurrentItemInfoWindow(currentItem);
        clearWindows();
        setEditFields();
        if (!currentItem._base._ed) {
            document.getElementById('needThis').innerHTML = ``
        }
        if (e.key === "0") {
            document.getElementById('needThis').value = 0;
        }
        let g = document.getElementById('needThis');
        g.setSelectionRange(3, 3)
        g.focus();
    });
    superActTextArea.addEventListener('click', () => {
        superActTextArea.select();
    })
    superiorEditRow.appendChild(returnCol(superActTextArea, 2));
    return superiorEditRow;
}

function generateRadioButton(lblText) {
    let colDiv = document.createElement("div");
    colDiv.classList.add("col-12", "col-sm-6", "col-md-3", "col-lg-2", "pb-1")
    let genBtn = document.createElement("button");
    genBtn.classList.add("btn", "btn-sm", "bg-gradient", "btn-primary", "text-light", "w-100");
    genBtn.type = "button"
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
    headerRow.classList.add("row", "removableAttrRowClass", "pt-1");

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

function createCustomNameRow(textAreaID, textAreaLblDes) {
    let _textAreaID = textAreaID;
    let _textAreaLblDesc = textAreaLblDes;
    let customNameRow = document.createElement("div");
    customNameRow.classList.add("row", "removableAttrRowClass", "pb-3", "text-end");

    let customTextAreaCol = document.createElement("div");
    customTextAreaCol.classList.add("col-6");
    let customTextArea = document.createElement("textarea");
    customTextArea.classList.add("w-100", "text-nowrap");
    customTextArea.setAttribute("rows", 1);
    customTextArea.placeholder = "Optional"
    if (!currentItem._customName) { customTextArea.innerHTML = currentItem._customName }
    customTextArea.style.resize = "none";
    customTextArea.style.overflow = "hidden";
    customTextArea.id = _textAreaID;
    customTextArea.addEventListener('keyup', (e) => {
        if (e.target.id === "customTextAreaID") {
            let customTextAreaElem = document.getElementById(_textAreaID);
            currentItem._customName = customTextAreaElem.value;
            clearWindows();
            setEditFields();
            document.getElementById(_textAreaID).select();
            document.getElementById(_textAreaID).value = currentItem._customName
        } else if (e.target.id === "customAttributeAreaID") {
            if (e.key === 'Tab' || e.key === 'Enter') {
                addCustomAttribute(e.target.value);
            }
        }
    })
    customTextArea.addEventListener('keydown', (e) => {
        if (e.target.id === "customAttributeAreaID") {
            stopDefault(e);
        }
    })
    customTextArea.addEventListener('focus', () => {
        //customTextArea.select();
    })
    customTextAreaCol.appendChild(customTextArea);

    let customNameLabel = document.createElement("div");
    customNameLabel.classList.add("col-6");
    let customNameLabelTextNode = document.createTextNode(_textAreaLblDesc)
    customNameLabel.appendChild(customNameLabelTextNode);

    customNameRow.appendChild(customNameLabel);
    customNameRow.appendChild(customTextAreaCol);

    return customNameRow;
}

function setMagicClass(e) {
    currentItem._magicClass = e.target.innerHTML;
    currentItem._base._ed = 0;
    clearWindows();
    if (currentItem._magicClass != "Runeword" || currentItem instanceof exports.RuneWordItem) {
        setEditFields();
    } else {
        attributeArea.appendChild(returnNameRow());
        let fullRunewordArray = exports.RuneWord.RuneWordArray.sort();
        let mappedRunewordArray = fullRunewordArray.map(element => {
            return element._runeWordName.toLowerCase();
        });
        //all variables
        let searchRunewordBarID = "searchRuneBarID"
        let searchRunewordBarPlaceholder = "Search and select a runeword"
        let lblRunewordResultID = "lblRuneWordResultID"
        let lblRunewordResultInnerText = "Choose Runeword"

        generateSearchBar(mappedRunewordArray, searchRunewordBarID, searchRunewordBarPlaceholder, lblRunewordResultID, lblRunewordResultInnerText);
    }
}

function returnNameRow() {
    let nameRow = document.createElement("div");
    nameRow.classList.add("row", "removableAttrRowClass");
    let nameCol = document.createElement('h3');
    nameCol.classList.add("col", "text-end")
    let nameColTextNode = document.createTextNode(currentItem._name)
    nameCol.appendChild(nameColTextNode);
    nameRow.appendChild(nameCol);

    return nameRow;
}

function generateRowForPrice(itemToGen) {
    //1.1 create row to hold price col
    const thisRow = document.createElement("div");
    thisRow.classList.add("row", "removableAttrRowClass");
    if (bgSecondaryIndexer++ % 2 == 0) { thisRow.classList.add("bg-secondary") }
    const formatCol = document.createElement("div");
    formatCol.classList.add("col-5","d-none","d-sm-block")
    thisRow.appendChild(formatCol);
    //1.2 create header col
    const priceHeaderCol = document.createElement("div");
    const attrNickText = document.createTextNode(`Price - optional`);
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
    if (bgSecondaryIndexer++ % 2 == 0) { thisRow.classList.add("bg-secondary") }
    const formatCol = document.createElement("div");
    formatCol.classList.add("col-5","d-none","d-sm-block")
    thisRow.appendChild(formatCol);

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
    if (bgSecondaryIndexer++ % 2 == 0) { thisRow.classList.add("bg-secondary") }
    const formatCol = document.createElement("div");
    formatCol.classList.add("col-5","d-none","d-sm-block")
    thisRow.appendChild(formatCol);
    //1.1 f
    const attrNickCol = document.createElement("div");
    const attrNickText = document.createTextNode(`Base ${exports.AttributeName.attrArray[2]._attrNickName}`);
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
    thisRow.classList.add("row", "removableAttrRowClass","justify-content-end");
    if (bgSecondaryIndexer++ % 2 == 0) { thisRow.classList.add("bg-secondary") }

    //1.1F 0
    //add col here to try to fix spacing
    //add delete button. this only shows up for our added attributes
    if (['Magic', 'Rare', 'Crafted'].indexOf(currentItem._magicClass) > -1) {
        const formatCol = document.createElement("div");
        formatCol.classList.add("col-5","d-none","d-sm-block")
        thisRow.appendChild(formatCol);
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn", "btn-sm", "text-light");
        if (attr._attributeName._attrName === "Enhanced Defense %") {
            console.log(currentItem)
            currentItem._base._ed = 0;
        }
        let deleteBtnTextNode = document.createTextNode("[Delete]");
        deleteBtn.addEventListener("click", () => {
            let removeIndexer = currentItem._arr.indexOf(attr);
            console.log(attr);
            if (attr._attributeName._attrName === "Enhanced Defense %") {
                console.log(currentItem._base._ed)
                if (["Magic", "Rare", "Crafted", "Runeword"].indexOf(currentItem._magicClass) > -1) {
                    currentItem._base._ed = 0;
                }
            }
            currentItem._arr[removeIndexer]._attrFloorActVal = 0;
            currentItem._arr.splice(removeIndexer, 1)
            clearWindows();
            setEditFields();
        })
        deleteBtn.addEventListener('mouseover', ()=>{
            console.log('hello there')
            deleteBtn.classList.add("bg-danger")
        })
        deleteBtn.addEventListener('mouseout', ()=> {
            deleteBtn.classList.remove("bg-danger")
          });
        deleteBtn.appendChild(deleteBtnTextNode);
        thisRow.appendChild(returnCol(deleteBtn, 2));
    } else {
        const formatCol = document.createElement("div");
        formatCol.classList.add("col-5","d-none","d-sm-block")
        thisRow.appendChild(formatCol);
    }
    if (attr._attributeName._attrNickName != ``) {
        const attrNickCol = document.createElement("div");

        const attrNickText = document.createTextNode(attr._attributeName._attrName == 'Quantity' ? `Amount -` : `${attr._attributeName._attrNickName}`);
        attrNickCol.appendChild(attrNickText);
        thisRow.appendChild(returnCol(attrNickCol, 0));
    }
    if (attr instanceof SkillAttribute) {
        const attrClassOrTreeNameCol = document.createElement("div");
        const classOrTreeNameTextNode = document.createTextNode(`${attr._classOrTreeName}`);
        attrClassOrTreeNameCol.appendChild(classOrTreeNameTextNode);
        let childRow = returnCol(attrClassOrTreeNameCol, 0);
        thisRow.appendChild(childRow);
    } else {

    }
    //1.2 aFinV 2
    if (attr._attrFloorMinVal) {
        const attrFloorMinCol = document.createElement("div");
        const attrFloorMinText = document.createTextNode(`${attr._attrFloorMinVal}`);
        attrFloorMinCol.appendChild(attrFloorMinText);
        thisRow.appendChild(returnCol(attrFloorMinCol, 1));
    }
    //1.3 aFMaxV 3
    if (attr._attrFloorMaxVal) {
        const attrFloorMaxCol = document.createElement("div");
        const attrFloormaxText = document.createTextNode(`${attr._attrFloorMaxVal}`);
        attrFloorMaxCol.appendChild(attrFloormaxText);
        thisRow.appendChild(returnCol(attrFloorMaxCol, 1));
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
            let quickID = e.target.id;
            let grabThisEle = document.getElementById(quickID)
            grabThisEle.setSelectionRange(3, 3)
            grabThisEle.focus();
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
    attrFloorActTextArea.addEventListener('click', () => {
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
    } else { currentItem._base._isEth = false };
    clearWindows();
    setEditFields();
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
    let itemHasEnhanDefAttr = false;
    let hideIfSpecialCirc = false;
    let addED = 0;
    element._arr.forEach(elementOne => {
        let g = returnAttributeNameObj(elementOne._attributeName._attrName);
        elementOne._attributeName = g;
        if (elementOne._attributeName._attrName == "Enhanced Defense %") {
            if (elementOne._attrFloorActVal != 0) { itemHasEnhanDefAttr = true };
            //if (!(element instanceof exports.RuneWordItem)) 
            if (!(["Magic", "Rare", "Crafted", "Charm", "Runeword", "Jewel"].indexOf(element._magicClass))) {
                element._base._ed = elementOne._attrFloorActVal;
                if (element instanceof exports.Unique) { element._base._defActVal = element._base._maxDef };
            } else {
                addED = elementOne._attrFloorActVal;
            }
            if (element._magicClass == "Runeword" && elementOne instanceof exports.BasicAttribute && element._base._ed === 0) {
                hideIfSpecialCirc = true;
            }
        }
        //special rule for ED on uniq armor. if there is a value here set
        if (elementOne._attributeName._attrName == "Defense") { element._base._addedDef = elementOne._attrFloorActVal; }
        if (elementOne._attributeName._attrName == "Open Sockets") { element._base._sockets = elementOne._attrFloorActVal; }
        elementOne
    })
    if (itemHasEnhanDefAttr == false && element._base._ed != 0) {
    }
    let tempString = ``;
    let eachString = ``;
    let name = element._name;
    if (element._magicClass == 'Runeword' && element._base._ed != 0) {
        name += " - Superior "
    }
    let isEth = (element._base._isEth) ? ` / Ethereal` : ``;
    let lvlReq = (element._levelReq != 0) ? ` / ${exports.AttributeName.attrArray[79]._attrNickName} ${element._levelReq}` : ``;
    let sockets = (element._base._sockets != 0 || element._magicClass == null) ? ` / ${element._base._sockets} ${exports.AttributeName.attrArray[86]._attrNickName}` : ``;
    let ed = (element._base._ed != null && element._base._type == 'Armor') ? ` / ${exports.AttributeName.attrArray[0]._attrNickName} ${parseFloat(element._base._ed) + parseFloat(addED)}` : ` / ${exports.AttributeName.attrArray[1]._attrNickName}${element._base._ed}`;
    if (!itemHasEnhanDefAttr) {
        if (element._magicClass != "Base" && element._magicClass != 0) {
            ed = ``
        }
    }
    if (hideIfSpecialCirc) { ed = `` }
    if (!itemHasEnhanDefAttr && element._base._ed == 0 || element._base._ed == null) { ed = `` }
    let def = (element._base._type == 'Armor') ? ` / ${calcDefHere(element)} ${exports.AttributeName.attrArray[2]._attrNickName} ` : ``;
    if (addED) {
        def = ` / ${element._base._defActVal} ${exports.AttributeName.attrArray[2]._attrNickName} `
    }
    if (element._base._defActVal == 0 || !Number.isInteger(element._base._defActVal)) { def = `` };
    if (element._base._ed > 0 && element._magicClass === "Base" && element._base._type === "Armor") {
        name += ` - ${exports.AttributeName.attrArray[85]._attrNickName}`;
    } else
        if (['Magic', 'Rare', 'Crafted'].indexOf(element._magicClass) > -1) {
            name += ` - ${element._magicClass}`
        }
    if (element._customName) { name = element._customName };
    tempString += `${name}${isEth}${sockets}${ed}${def}${lvlReq}`;
    if (element._magicClass == null) { tempString = `${name}${isEth}${sockets}${ed}${def}` };
    let array = element._arr;
    array.forEach(elementTwo => {
        let shrtAttrName = elementTwo._attributeName._attrName;
        if (elementTwo._attrFloorActVal != 0 || elementTwo._ /*&& (elementTwo._attrFloorMinVal)*/) {
            if (shrtAttrName != 'Enhanced Defense %' && shrtAttrName != 'Open Sockets' /*&& shrtAttrName != 'Enhanced Damage %' */ && shrtAttrName != 'Quantity' && shrtAttrName != 'Defense' && shrtAttrName != 'Level Requirement') {
                tempString += ` / ${elementTwo._attributeName._attrNickName}`;
                if (elementTwo._attrType == 'skillAttribute') {
                    if (!isNaN(elementTwo._attrFloorActVal)) {
                        if (elementTwo._attributeName._attrName != "Empty Value 2") {
                            tempString += ` ${elementTwo._classOrTreeName}`
                        }
                    }
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
        } else {
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
    body[0].classList.add("bg-success");
    tradeThreadTextArea.classList.remove('bg-dark', 'text-light');
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
    isDay = true;
    const jsonArr = JSON.stringify(isDay);
    localStorage.setItem('dayMode', jsonArr);
}
function setNightMode() {
    body[0].classList.remove('bg-success')
    body[0].classList.add('bg-dark', 'text-light')
    tradeThreadTextArea.classList.add('bg-dark', 'text-light');
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
    isDay = false;
    const jsonArr = JSON.stringify(isDay);
    localStorage.setItem('dayMode', jsonArr);
}
document.getElementById('clearAllBtnID').addEventListener("click", () => {
    if (confirm("Delete all saved settings?")) {
        clearLocalData()
    }
});

function clearLocalData() {
    let removeKeys = ["attrArray", "tradeArray", "dayMode"];
    removeKeys.forEach(k => localStorage.removeItem(k));
    resetAttrNickNames();

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

let wipeSetting = localStorage.getItem("checkSave");
if (wipeSetting === null) {
    clearLocalData();
    let wipeSettingJSON = JSON.stringify(wipeSetting);
    localStorage.setItem('checkSave', wipeSettingJSON);
    infoWindow.innerText = `Tab/enter will select the first item or click on any of them. Most buttons have mouse over tool tips. Attributes with values of 0 are hidden or removed`;
}

checkNightDay();
loadAttrNickNames();
loadTradeList();

document.getElementsByTagName("body")[0].addEventListener("click", e => {
    //if (e.altKey) return console.log(currentItem);
    //if (e.shiftKey) return console.log(myTradeItems[0]);
    //console.log(e)
    if(e.altKey){
        console.log(exports.AttributeName.attrArray)
    }
    console.log(e);
})
