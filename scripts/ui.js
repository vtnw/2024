let categories = [];
let tags = [];
let tag = { id: 0 };
let names = [];
let name = { id: 0 };
let dates = [];
let year = null;
let month = null;
let week = null;
let day = null;
let selectedTags = [];
let selectedNames = [];
let selectedDates = [];

let spn = document.getElementById("spn");
let dvUi = document.getElementById("dvUi");
let dvTags = document.getElementById("dvTags");
let dvNames = document.getElementById("dvNames");
let dvDates = document.getElementById("dvDates");
let dvFilters = document.getElementById("dvFilters");
let tbTag = document.getElementById("tbTag");
let tbName = document.getElementById("tbName");
let tb = document.getElementById("tb");
let btnAdd = document.getElementById("btnAdd");
let btnSearch = document.getElementById("btnSearch");
let btnEdit = document.getElementById("btnEdit");
let btnCopy = document.getElementById("btnCopy");
let btnHide = document.getElementById("btnHide");
let btnRefresh = document.getElementById("btnRefresh");

window.addEventListener("load", () => {
    initializeDates();
    loadCategories();
    bindCategories();
    bindDates();
});

spn.addEventListener("click", (event) => {
    uiMode = !uiMode;
    dvUi.style.display = uiMode ? "block" : "none";
});

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

btnAdd.addEventListener("click", (event) => {
    editDiv(false);
    let command = "";
    selectedTags.forEach(t => command = `${command} #${t}`);
    selectedNames.forEach(n => command = `${command} !${n}`);
    if (!!tb.innerText) {
        command = `${command} ${tb.innerText.trim()}`;
    }

    if (selectedDates.length > 0) {
        command = `${command} @${selectedDates[0]}`
    }

    command = `${command.trim()}`;
    processData(command);
});

btnSearch.addEventListener("click", (event) => {
    editDiv(false);
    if (selectedTags.length === 0 && selectedNames.length === 0 && selectedDates.length === 0) {
        processData(!!tb.innerText && !!tb.innerText.trim() ? tb.innerText.trim() : ".log");
        return;
    }

    let command = `.${selectedTags[0]}`;
    let filter = getFilter(selectedTags[0]);
    if (!!filter) {
        command = `${command} ${filter}`;    
    }

    let text = tb.innerText ? tb.innerText.trim() : "";
    processData(command);
    tb.innerText = text;
});

btnEdit.addEventListener("click", (event) => {
    editDiv(false);

    let command = `.edit`;
    let filter = getFilter("");
    if (!!filter) {
        command = `${command} ${filter}`;    
    }

    processData(command);
    clearFilters();
});

btnCopy.addEventListener("click", (event) => {
    editDiv(false);

    let command = `.copy`;
    let filter = getFilter("");
    if (!!filter) {
        command = `${command} ${filter}`;    
    }

    processData(command);
});

btnHide.addEventListener("click", (event) => {
    editDiv(false);

    let command = `.hide`;
    let filter = getFilter("");
    if (!!filter) {
        command = `${command} ${filter}`;    
    }

    processData(command);
});

btnRefresh.addEventListener("click", (event) => {
    categories = [];
    tags = [];
    tag = { id: 0 };
    names = [];
    name = { id: 0 };
    dates = [];
    year = null;
    month = null;
    week = null;
    day = null;
    selectedTags = [];
    selectedNames = [];
    selectedDates = [];
    tbTag.value = "";
    tbName.value = "";
    initializeDates();
    loadCategories();
    bindCategories();
    bindDates();
    bindFilters();

    notes = [];
    command = "";
    editMode = false;
    textMode = false;
    uiMode = true;
    lastAdd = "";
    loadNotes();
    processData(".today");
});

getFilter = (skipTag) => {
    let tagFilter = selectedTags.filter(t => t !== skipTag).map(t => `#${t}`).join(" ");
    let nameFilter = selectedNames.map(t => `!${t}`).join(" ");
    let textFilter = tb.innerText ? tb.innerText.trim() : "";
    let dateFilter = selectedDates.map(t => `@${t}`).join(" ");

    let filters = [];
    if (!!tagFilter) filters.push(tagFilter);
    if (!!nameFilter) filters.push(nameFilter);
    if (!!textFilter) filters.push(textFilter);
    if (!!dateFilter) filters.push(dateFilter);
    return filters.join(" ").trim();
}

clearFilters = () => {
    selectedTags = [];
    selectedNames = [];
    selectedDates = [];
    bindFilters();
}

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
        addDiv(dvTags, t.text, t, "tag", (event) => {
            tbTag.value = "";
            tbName.value = "";
            tag = JSON.parse(event.target.dataset.category);
            tags.push(tag);
            if (!selectedTags.includes(tag.text)) {
                selectedTags.push(tag.text);
            }
            names = [];
            bindCategories();
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
        addDiv(dvNames, n.text, n, "name", (event) => {
            tbTag.value = "";
            tbName.value = "";
            name = JSON.parse(event.target.dataset.category);
            names = [name];
            if (!selectedNames.includes(tag.text)) {
                selectedNames.push(name.text);
            }
            bindCategories();
            bindFilters();
        });
    });
}

bindDates = () => {
    dvDates.innerText = "";

    if (!year) {
        dates.forEach(y => {
            addDiv(dvDates, y.name, null, "date", (event) => {
                year = event.target.innerText;
                month = null;
                week = null;
                day = null;
                bindDates();
            });
        });
        return;
    }

    addDiv(dvDates, year, null, "date-selected", (event) => {
        year = null;
        bindDates();
    });

    if (!month) {
        dates.find(y => y.name == year).months.forEach(m => {
            addDiv(dvDates, m.name, null, "date", (event) => {
                month = event.target.innerText;
                week = null;
                day = null;
                bindDates();
            });
        });
        return;
    }
        
    addDiv(dvDates, month, null, "date-selected", (event) => {
        month = null;
        bindDates();
    });

    if (!week) {
        dates.find(y => y.name == year).months.find(m => m.name == month).weeks.forEach(w => {
            addDiv(dvDates, w.name, null, "date", (event) => {
                week = event.target.innerText;
                day = null;
                bindDates();
            });
        });
        return;
    }

    addDiv(dvDates, week, null, "date-selected", (event) => {
        week = null;
        bindDates();
    });

    if (!day) {
        dates.find(y => y.name == year).months.find(m => m.name == month).weeks.find(w => w.name == week).days.forEach(d => {
            addDiv(dvDates, d, null, "date", (event) => {
                day = event.target.innerText;
                selectedDates.push(isoToString(new Date(`${parseInt(day)}-${month}-${year}`)))
                bindDates();
                bindFilters();
            });
        });
        return;
    }

    addDiv(dvDates, day, null, "date-selected", (event) => {
        day = null;
        bindDates();
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

    selectedDates.forEach(d => {
        addDiv(dvFilters, `@${d}`, null, "filter", (event) => {
            selectedDates = selectedDates.filter(sd => sd !== event.target.innerText.substring(1));
            bindFilters();
        });
    });
}

initializeDates = () => {
    let date = new Date();
    let years = [date.getFullYear(), date.getFullYear() + 1];
    let months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    year = date.getFullYear();
    month = date.toLocaleString("default", { month: "short" }).toLowerCase();

    years.forEach(y => {
        let currYear = {name: y, months: []};
        months.forEach(m => {
            let currMonth = {name: new Date(date.getFullYear(), m, 1).toLocaleString("default", { month: "short" }).toLowerCase(), weeks: []};
            let days = [];
            let weekdays = [];
            let w = 1;
            for (let d = new Date(y, m, 1); d <= new Date(y, m + 1, 0); d.setDate(d.getDate() + 1)) {
                days.push(d.getDate());
                weekdays.push(`${d.getDate().toString().padStart(2,"0")}\xA0\xA0${d.toLocaleString("default", { weekday: "short" }).toLowerCase().slice(0, -1)}`);
                if (d.getDay() == 0 || d.getDate() ==  new Date(y, m + 1, 0).getDate()) {
                    let currWeek = {name: `${days[0]}-${days.at(-1)}`, days: weekdays};
                    currMonth.weeks.push(currWeek);
                    if (y == date.getFullYear() && m == date.getMonth() && days.includes(date.getDate())) {
                        week = currWeek.name;
                        let currDayIndex = days.indexOf(date.getDate());
                        currWeek.days[currDayIndex] = `${currWeek.days[currDayIndex].replace("\xA0\xA0", "°\xA0")}`;
                    }
                    w++;
                    days = [];
                    weekdays = [];
                }
            }

            currYear.months.push(currMonth);
        });
        dates.push(currYear);
    });        
}

addDiv = (target, content, data, className, onClick) => {
    let dv = document.createElement("div");
    dv.innerText = content;
    dv.setAttribute("data-category", JSON.stringify(data));
    dv.setAttribute("class", className);
    dv.addEventListener("click", onClick);
    target.appendChild(dv);
}

saveCategories = () => localStorage.setItem("categories", JSON.stringify(categories));

loadCategories = () => categories = JSON.parse(localStorage.getItem("categories") || "[]");
