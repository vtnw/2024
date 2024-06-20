let categories = [];
let tags = [];
let tag = { id: 0 };
let names = [];
let name = { id: 0 };
let selectedTags = [];
let selectedNames = [];

let isNumberMode = false;
let isTextMode = false;
const currencySymbol = "$";
const dateSymbol = "@";
const textSymbol = "text";
const spaces = "\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0";
const enter = ">>";
const back = "<<";
const numbers1 = ["1", "2", "3"];
const numbers2 = ["4", "5", "6"];
const numbers3 = ["7", "8", "9"];
const numbers4 = [".", "0", "/"];
const letters1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const letters2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const letters3 = ["Z", "X", "C", "V", "B", "N", "M", back];
const letters4 = [",", spaces, ".", enter];

let spn = document.getElementById("spn");
let dvUiHeader = document.getElementById("dvUiHeader");
let dvUiContent = document.getElementById("dvUiContent");
let dvTags = document.getElementById("dvTags");
let dvNames = document.getElementById("dvNames");
let dvFilters = document.getElementById("dvFilters");
let tbTag = document.getElementById("tbTag");
let tbName = document.getElementById("tbName");
let tb = document.getElementById("tb");
let dvActions = document.getElementById("dvActions");
let dvText = document.getElementById("dvText");
let dvNumber = document.getElementById("dvNumber");
let dvDate = document.getElementById("dvDate");
let dvClear = document.getElementById("dvClear");
let dvAdd = document.getElementById("dvAdd");
let dvNumbers = document.getElementById("dvNumbers");
let dvLetters = document.getElementById("dvLetters");
let numberElement = null;
let textElement = null;

window.addEventListener("load", () => {
    initialize();
    loadNumbers();
    loadLetters();
});

spn.addEventListener("click", (event) => {
    uiMode = !uiMode;
    setUiMode();
});

dvClear.addEventListener("click", (event) => initialize());

dvNumber.addEventListener("click", (event) => toggleNumberMode(event.target, currencySymbol));

dvDate.addEventListener("click", (event) => toggleNumberMode(event.target, dateSymbol));

dvText.addEventListener("click", (event) => toggleTextMode(event.target, textSymbol));

dvAdd.addEventListener("click", (event) => addNote());

tbTag.addEventListener("keyup", (event) => {
    if (event.key === "Enter" && !!tbTag.value && !!tbTag.value.trim()) {
        let value = tbTag.value.trim();
        tbTag.value = "";
        if (value.startsWith("-")) {
            removeCategory(tag.id, "tag", value.substring(1));
        } else {
            addCategory(tag.id, "tag", value);
        }
    } else {
        bindCategories();
    }
});

tbName.addEventListener("keyup", (event) => {
    if (event.key === "Enter" && !!tbName.value && !!tbName.value.trim()) {
        let value = tbName.value.trim();
        tbName.value = "";
        if (value.startsWith("-")) {
            removeCategory(tag.id, "name", value.substring(1));
        } else {
            addCategory(tag.id, "name", value);
        }
    } else {
        bindCategories();
    }
});

addCategory = (parentId, type, text) => {
    if (categories.some(c => c.text === text && c.type === type && c.parentId === parentId)) {
        return;
    }

    categories.push({
        id: new Date().getTime(),
        parentId,
        type,
        text,
    });
    categories.sort((a, b) => a.text.localeCompare(b.text));
    saveCategories();
    bindCategories();
}

removeCategory = (parentId, type, text) => {
    let index = categories.findIndex(c => c.text === text && c.type === type && c.parentId === parentId);
    categories.splice(index, 1);
    saveCategories();
    bindCategories();
}

bindCategories = () => {
    dvTags.innerText = "";
    tags.forEach(t => {
        addDiv(dvTags, t.text, t, "tag-selected", (event) => {
            tbTag.value = "";
            tbName.value = "";
            let category = JSON.parse(event.target.dataset.category);
            let index = tags.findIndex(t => t.id === category.id);
            tags.splice(index);
            tag = tags.length > 0 ? tags.at(-1) : { id: 0};
            names = [];
            bindCategories();
        });
    });

    let currTags = categories.filter(c => c.parentId === tag.id && c.type === "tag" && (!tbTag.value || c.text.includes(tbTag.value)));
    currTags.forEach(t => {
        let dvTag = addDiv(dvTags, "", "", "tag", null);
        addDiv(dvTag, t.text, t, "tag-open", (event) => {
            tbTag.value = "";
            tbName.value = "";
            tag = JSON.parse(event.target.dataset.category);
            tags.push(tag);
            names = [];
            bindCategories();
        });
        addDiv(dvTag, "+", t, "tag-add", (event) => {
            tag = JSON.parse(event.target.dataset.category);
            if (!selectedTags.includes(tag.text)) {
                selectedTags.push(tag.text);
            }
            bindFilters();
        });
    });

    dvNames.innerText = "";
    names.forEach(n => {
        addDiv(dvNames, n.text, n, "name-selected", (event) => {
            tbTag.value = "";
            tbName.value = "";
            let category = JSON.parse(event.target.dataset.category);
            let index = names.findIndex(n => n.id === category.id);
            names.splice(index);
            name = names.length > 0 ? names.at(-1) : { id: 0};
            names = [];
            bindCategories();
        });
    });

    let currNames = categories.filter(c => names.length === 0 && c.parentId === tag.id && c.type === "name" && (!tbName.value || c.text.includes(tbName.value)));
    currNames.forEach(n => {
        let dvName = addDiv(dvNames, "", "", "name", null);
        addDiv(dvName, n.text, n, "name-open", (event) => {
            tbTag.value = "";
            tbName.value = "";
            name = JSON.parse(event.target.dataset.category);
            names = [name];
            bindCategories();
        });
        addDiv(dvName, "+", n, "name-add", (event) => {
            name = JSON.parse(event.target.dataset.category);
            if (!selectedNames.includes(name.text)) {
                selectedNames.push(name.text);
            }
            bindFilters();
        });
    });
}

bindFilters = () => {
    dvFilters.innerText = "";

    selectedTags.forEach(t => {
        addDiv(dvFilters, `#${t}`, null, "filter", (event) => {
            selectedTags = selectedTags.filter(st => st !== event.target.innerText.substring(1));
            bindFilters();
        });
    });

    selectedNames.forEach(n => {
        addDiv(dvFilters, `!${n}`, null, "filter", (event) => {
            selectedNames = selectedNames.filter(sn => sn !== event.target.innerText.substring(1));
            bindFilters();
        });
    });

    listNotes();
    dvActions.style.display = selectedTags.length > 0 || selectedNames.length > 0 ? "inline" : "none";
}

addNote = () => {
    let command = ".add";
    selectedTags.forEach(t => command = `${command} #${t}`);
    selectedNames.forEach(n => command = `${command} !${n}`);
    if (dvText.innerText != textSymbol) {
        command = `${command} ${dvText.innerText.trim()}`;
    }

    if (dvNumber.innerText != currencySymbol) {
        command = `${command} ${dvNumber.innerText}`;
    }

    if (dvDate.innerText != dateSymbol) {
        command = `${command} ${dvDate.innerText}`;
    }

    processData(command);
    initialize();
}

listNotes = () => {
    let command = ".note";
    selectedTags.forEach(t => command = `${command} #${t}`);
    selectedNames.forEach(n => command = `${command} !${n}`);
    if (dvDate.innerText != dateSymbol) {
        let startDate = new Date(dvDate.innerText);
        let days = dvNumber.innerText != currencySymbol ? parseInt(dvNumber.innerText.substring(1)) : 0;
        startDate.setDate(startDate.getDate() - days);
        command = `${command} @${isoToString(startDate)} ${dvDate.innerText}`;
    }

    if (dvText.innerText != textSymbol) {
        command = `${command} ${dvText.innerText.trim()}`;
    }

    processData(command);
}

initialize = () => {
    uiMode = true;
    categories = [];
    tags = [];
    tag = { id: 0 };
    names = [];
    name = { id: 0 };
    selectedTags = [];
    selectedNames = [];
    tbTag.value = "";
    tbName.value = "";
    notes = [];
    command = "";

    dvNumber.innerText = currencySymbol;
    dvDate.innerText = dateSymbol;
    dvText.innerText = textSymbol;
    loadCategories();
    bindCategories();
    bindFilters();
    setUiMode();
    
    loadNotes();
    processData(".note");

    migrate();
}

getDate = () => {
    return dvDate.innerText == dateSymbol ? "" : new Date(dvDate.innerText);
}

getNumber = () => {
    return dvNumber.innerText == currencySymbol ? "" : dvNumber.innerText;
}

toggleNumberMode = (element, defaultChar) => {
    if (!!numberElement && numberElement != element) {
        return;
    }

    numberElement = element;
    isNumberMode = !isNumberMode;

    if (isNumberMode) {
        numberElement.innerText = defaultChar;
        dvNumbers.style.display = "inline-block";
    } else {
        dvNumbers.style.display = "none";
        numberElement = null;
        listNotes();
    }
}

toggleTextMode = (element, defaultChar) => {
    if (!!textElement && textElement != element) {
        return;
    }

    textElement = element;
    isTextMode = !isTextMode;

    if (isTextMode) {
        dvLetters.style.display = "inline-block";
    } else {
        dvLetters.style.display = "none";
        textElement = null;
        listNotes();
    }
}

loadNumbers = () => {
    let appendNumber = (event) => {
        let element = event.target;
        element.style.borderColor = "#999999";
        setTimeout(() => { element.style.borderColor = "#000000" }, 100);
        numberElement.innerText += element.innerText;
    };
    let row = addDiv(dvNumbers, "", "", "dvNumberRow", null);
    numbers1.forEach(n => {
        addDiv(row, n, "", "dvNumber", appendNumber);
    });
    row = addDiv(dvNumbers, "", "", "dvNumberRow", null);
    numbers2.forEach(n => {
        addDiv(row, n, "", "dvNumber", appendNumber);
    });
    row = addDiv(dvNumbers, "", "", "dvNumberRow", null);
    numbers3.forEach(n => {
        addDiv(row, n, "", "dvNumber", appendNumber);
    });
    row = addDiv(dvNumbers, "", "", "dvNumberRow", null);
    numbers4.forEach(n => {
        addDiv(row, n, "", "dvNumber", appendNumber);
    });
}

loadLetters = () => {
    let appendText = (event) => {
        let element = event.target;
        element.style.borderColor = "#999999";
        setTimeout(() => { element.style.borderColor = "#000000" }, 100);
        let letter = element.innerText;
        switch (letter) {
            case spaces: {
                letter = "\xA0";
                break;
            }
            case enter: {
                letter = "\n";
                break;
            }
            default: {
                letter = letter.toLowerCase();
            }
        }

        textElement.innerText = letter != back
            ? textElement.innerText == textSymbol ? letter : textElement.innerText + letter
            : textElement.innerText.length > 1 ? textElement.innerText.slice(0, -1) : textSymbol;
    };
    let row = addDiv(dvLetters, "", "", "dvLetterRow", null);
    letters1.forEach(l => {
        addDiv(row, l, "", "dvLetter", appendText);
    });
    row = addDiv(dvLetters, "", "", "dvLetterRow", null);
    letters2.forEach(l => {
        addDiv(row, l, "", "dvLetter", appendText);
    });
    row = addDiv(dvLetters, "", "", "dvLetterRow", null);
    letters3.forEach(l => {
        addDiv(row, l, "", "dvLetter", appendText);
    });
    row = addDiv(dvLetters, "", "", "dvLetterRow", null);
    letters4.forEach(l => {
        addDiv(row, l, "", "dvLetter", appendText);
    });
}

addDiv = (target, content, data, className, onClick) => {
    let dv = document.createElement("div");
    dv.innerText = content;
    dv.setAttribute("data-category", JSON.stringify(data));
    dv.setAttribute("class", className);
    dv.addEventListener("click", onClick);
    target.appendChild(dv);
    return dv;
}

setUiMode = () => {
    dvUiHeader.style.display = uiMode ? "block" : "none";
    dvUiContent.style.display = uiMode ? "block" : "none";
    tb.style.display = uiMode ? "none" : "block";

    if (uiMode) {
        processData(".note");
    } else {
        processData(".today");
    }
}

saveCategories = () => localStorage.setItem("tags", JSON.stringify(categories));

loadCategories = () => categories = JSON.parse(localStorage.getItem("tags") || "[]");

migrate = () => {
    let data = notes;
    let list = [];
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    data.forEach(d => {
        let date = `@${d.date.toLocaleDateString()}`;
        let tag = d.text.match(/#[a-z0-9-]+/g).join(" ");
        let text = d.text.replace(/#[a-z0-9-]+/g, "").replace(/@\S+/g, "").trim();
        list.push(`${date} ${tag} ${text}`);
    });
    saveAsFile(JSON.stringify(list), "notes_migrate_" + isoToString(new Date()));
}
