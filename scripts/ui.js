let categories = [];
let tags = [];
let tag = null;
let names = [];
let name = null;
let dates = [];
let year = null;
let month = null;
let week = null;
let day = null;

let dvTags = document.getElementById("dvTags");
let dvNames = document.getElementById("dvNames");
let dvDates = document.getElementById("dvDates");
let tbTag = document.getElementById("tbTag");
let tbName = document.getElementById("tbName");
let tb = document.getElementById("tb");
let btnAdd = document.getElementById("btnAdd");
let btnSearch = document.getElementById("btnSearch");
let btnGo = document.getElementById("btnGo");
let btnClear = document.getElementById("btnClear");

window.addEventListener("load", () => {
    initializeDates();
    loadCategories();
    bindCategories();
    bindDates();
});

tbTag.addEventListener("keyup", (event) => {
    if (event.key === "Enter" && !!tbTag.value && !!tbTag.value.trim()) {
        addCategory(tag, "tag", tbTag.value);
        tbTag.value = "";
    }
});

tbName.addEventListener("keyup", (event) => {
    if (event.key === "Enter" && !!tbName.value && !!tbName.value.trim()) {
        addCategory(tag, "name", tbName.value);
        tbName.value = "";
    }
});

btnAdd.addEventListener("click", (event) => {
    editDiv(false);
    let command = "";
    tags.forEach(t => command = `${command} #${t}`);
    names.forEach(n => command = `${command} !${n}`);
    if (!tb.innerText) {
        command = `${command} ${tb.innerText.trim()}`;
    }

    if (!!year && !!month && !!day) {
        let date = isoToString(new Date(`${day}-${month}-${year}`));
        command = `${command} @${date}`
    }

    command = `.add ${command.trim()}`;
    processData(command);
});

btnGo.addEventListener("click", (event) => {
    editDiv(false);
    processData(tb.innerText.trim());
});

btnSearch.addEventListener("click", (event) => {
    editDiv(false);

    if (tags.length === 0) {
        return;
    }

    let command = "";
    command = `.${tags[0]}`;
    let tagFilter = tags.filter(t => t !== tags[0]).join("&");
    let nameFilter = names.join("&");
    let textFilter = tb.innerText ? tb.innerText.trim() : "";
    let dateFilter = !!year && !!month && !!day ? isoToString(new Date(`${day}-${month}-${year}`)) : "";

    let filters = [];
    if (!!tagFilter) filters.push(`#${tagFilter}`);
    if (!!nameFilter) filters.push(`!${nameFilter}`);
    if (!!textFilter) filters.push(textFilter);
    if (!!dateFilter) filters.push(`@${dateFilter}`);
    let filter = filters.join("+").trim();

    if (!!filter) {
        command = `${command} ${filter}`;    
    }

    processData(command);
});

btnClear.addEventListener("click", (event) => {
    editDiv(false);
    tags = [];
    names = [];
    tag = null;
    name = null;
    year = null;
    month = null;
    week = null;
    day = null;
    bindDates();
    bindCategories();
    tb.innerText = "";
});

addCategory = (parent, type, text) => {
    categories.push({
        parent,
        type,
        text,
    });
    categories.sort((a, b) => a.text.localeCompare(b.text));
    saveCategories();
    bindCategories();
}

bindCategories = () => {
    dvTags.innerText = "";
    tags.forEach(t => {
        addDiv(dvTags, t, "tag-selected", (event) => {
            let index = tags.indexOf(event.target.innerText);
            tags.splice(index);
            tag = tags.length > 0 ? tags.at(-1) : null;
            names = [];
            bindCategories();
        });
    });

    let currTags = categories.filter(c => c.parent === tag && c.type === "tag");
    currTags.forEach(t => {
        addDiv(dvTags, t.text, "tag", (event) => {
            tag = event.target.innerText;
            tags.push(event.target.innerText);
            names = [];
            bindCategories();
        });
    });

    dvNames.innerText = "";
    names.forEach(n => {
        addDiv(dvNames, n, "name-selected", null);
    });

    let currNames = categories.filter(c => names.length === 0 && c.parent === tag && c.type === "name");
    currNames.forEach(t => {
        addDiv(dvNames, t.text, "name", (event) => {
            name = event.target.innerText;
            names = [event.target.innerText];
            bindCategories();
        });
    });
}

bindDates = () => {
    dvDates.innerText = "";
    let dv = null;

    if (!year) {
        dates.forEach(y => {
            addDiv(dvDates, y.name, "date", (event) => {
                year = event.target.innerText;
                bindDates();
            });
        });
        return;
    }

    addDiv(dvDates, year, "date-selected", (event) => {
        year = null;
        bindDates();
    });

    if (!month) {
        dates.find(y => y.name == year).months.forEach(m => {
            addDiv(dvDates, m.name, "date", (event) => {
                month = event.target.innerText;
                bindDates();
            });
        });
        return;
    }
        
    addDiv(dvDates, month, "date-selected", (event) => {
        month = null;
        bindDates();
    });

    if (!week) {
        dates.find(y => y.name == year).months.find(m => m.name == month).weeks.forEach(w => {
            addDiv(dvDates, w.name, "date", (event) => {
                week = event.target.innerText;
                bindDates();
            });
        });
        return;
    }

    addDiv(dvDates, week, "date-selected", (event) => {
        week = null;
        bindDates();
    });

    if (!day) {
        dates.find(y => y.name == year).months.find(m => m.name == month).weeks.find(d => d.name == week).days.forEach(d => {
            addDiv(dvDates, d, "date", (event) => {
                day = event.target.innerText;
                bindDates();
            });
        });
        return;
    }

    addDiv(dvDates, day, "date-selected", (event) => {
        day = null;
        bindDates();
    });
}

initializeDates = () => {
    let date = new Date();
    let years = [date.getFullYear(), date.getFullYear() + 1];
    let months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    year = date.getFullYear();
    month = date.toLocaleString("default", { month: "short" }).toLowerCase();

    years.forEach(y => {
        let year = {name: y, months: []};
        months.forEach(m => {
            let month = {name: new Date(date.getFullYear(), m, 1).toLocaleString("default", { month: "short" }).toLowerCase(), weeks: []};
            let days = [];
            let w = 1;
            for (let d = new Date(y, m, 1); d <= new Date(y, m + 1, 0); d.setDate(d.getDate() + 1)) {
                days.push(d.getDate());
                if (d.getDay() == 0 || d.getDate() ==  new Date(y, m + 1, 0).getDate()) {
                    let week = {name: `${days[0]}-${days.at(-1)}`, days: days};
                    month.weeks.push(week);
                    week = m == date.getMonth() && days.includes(date.getDate()) ? week.name : week;
                    w++;
                    days = [];
                }
            }

            year.months.push(month);
        });
        dates.push(year);
    });        
}

addDiv = (target, content, className, onClick) => {
    let dv = document.createElement("div");
    dv.innerText = content;
    dv.setAttribute("class", className);
    dv.addEventListener("click", onClick);
    target.appendChild(dv);
}

saveCategories = () => localStorage.setItem("categories", JSON.stringify(categories));

loadCategories = () => categories = JSON.parse(localStorage.getItem("categories") || "[]");
