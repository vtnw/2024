let notes = [];
let command = "";
let editMode = false;
let textMode = false;
let uiMode = false;
let lastAdd = "";

const hiddenTag = "hidden";
const noteTag = "note";
const linkTag = "link";
const taskTag = "task";
const listTag = "list";
const expenseTag = "expense";
const timerTag = "timer";
const functionTag = "function";
const contactTag = "contact";
const diaryTag = "diary";
const eventTag = "event";
const skipTags = `-${linkTag}&-${expenseTag}&-${taskTag}&-${listTag}&-${functionTag}&-${contactTag}&-${diaryTag}&-${eventTag}&-${timerTag}`;

window.addEventListener("load", () => {
    loadNotes();
    processData(".today");
});

document.addEventListener("click", (event) => {
    if (!editMode && !uiMode) {
        document.getElementById("tb").focus();
    }
});

document.getElementById("tb").addEventListener("blur", (event) => {
    if (!uiMode) {
        editDiv(false);
        processData(document.getElementById("tb").innerText);
    }
});

document.getElementById("fl").addEventListener("change", () => {
    if (document.getElementById("fl").files.length > 0) {
        importFile();
    }
});

processData = (text) => {
    if (!text || /\s$/.test(text)) {
        return;
    }

    if (!text.startsWith(".")) {
        text = `.add ${text}`;
    }

    document.getElementById("tb").innerText = "";
    let all = text.split(" ");
    let action = all[0].trim();
    let content = text.substring(action.length + 1).trim();

    switch (action) {
        case "..": {
            document.getElementById("tb").innerText = command;
            break;
        }
        case ".add": {
            showStatus(action);
            doAdd(content);
            break;
        }
        case ".all": {
            showStatus(action);
            doAll();
            break;
        }
        case ".tag": {
            showStatus(action);
            doTag(content);
            break;
        }
        case ".name": {
            showStatus(action);
            doName(content);
            break;
        }
        case ".note": {
            showStatus(action);
            doNote(content);
            break;
        }
        case ".diary": {
            showStatus(action);
            doDiary(content);
            break;
        }
        case ".log": {
            showStatus(action);
            doLog(content);
            break;
        }
        case ".clear": {
            showStatus(action);
            doClear();
            break;
        }
        case ".reset": {
            showStatus(action);
            doReset();
            break;
        }
        case ".export": {
            showStatus(action);
            doExport(content);
            break;
        }
        case ".print": {
            showStatus(action);
            doPrint(content);
            break;
        }
        case ".import": {
            showStatus(action);
            doImport(content);
            break;
        }
        case ".remove": {
            showStatus(action);
            doRemove(content);
            break;
        }
        case ".edit": {
            showStatus(action);
            doEdit(content);
            break;
        }
        case ".copy": {
            showStatus(action);
            doCopy(content);
            break;
        }            
        case ".hide": {
            showStatus(action);
            doHide(content);
            break;
        }            
        case ".move": {
            showStatus(action);
            doMove(content);
            break;
        }
        case ".expense": {
            showStatus(action);
            doExpense(content);
            break;
        }
        case ".list": {
            showStatus(action);
            doList(content);
            break;
        }
        case ".task": {
            showStatus(action);
            doTask(content);
            break;
        }
        case ".link": {
            showStatus(action);
            doLink(content);
            break;
        }            
        case ".text": {
            showStatus(action);
            doText(content);
            break;
        }
        case ".timer": {
            showStatus(action);
            doTimer(content);
            break;
        }
        case ".calendar": {
            showStatus(action);
            doCalendar(content);
            break;
        }
        case ".today": {
            showStatus(action);
            doToday(content);
            break;
        }
        case ".calculate": {
            showStatus(action);
            doCalculate(content);
            break;
        }
        case ".function": {
            showStatus(action);
            doFunction(content);
            break;
        }
        case ".contact": {
            showStatus(action);
            doContact(content);
            break;
        }
        case ".event": {
            showStatus(action);
            doEvent(content);
            break;
        }
        default: {
            showStatus(`${action} - failed`);
        }
    }

    command = text;
}

doFunction = (content) => {
    if (!content) {
        showStatus("failed", true);
        return;
    }

    let all = content.split(" ");
    let functionName = all[0].replace("!", "");
    showStatus(functionName, true, " ")
    
    let param = content.substring(functionName.length + 1).trim();        
    let notes = filterData(`tag:${functionTag}+name:${functionName}`);

    if (notes.length == 0 || notes.length > 1) {
        showStatus("failed", true);
        return;
    }

    let text = notes[0].text.replace(`#${functionTag}`, "").replace(`!${functionName}`, "").trim();
    let fn = new Function("content", `${text}`);
    let result = fn(param);
    if (!!result) {
        showData(`[${content}]\n\n${result}`);
    }
    
    showStatus("done", true);
}

doCalculate = (content) => {
    if (!content || !/^[0-9+\-*/()^.]+$/g.test(content)) {
        showStatus("failed", true);
        return;
    }

    let fn = new Function(`return (${content})`);
    showData(`[${content}]\n\n${fn()}`);
    showStatus("done", true);
}

doToday = (content) => {
    let date = new Date();
    if (!content) {
        content = "recent:30d";
    } else {
        date = extractDate(content).date;
        content = `date:${isoToString(date)}`;
    }
    
    doTask(content);        
    doCalendar(`@${isoToString(date)}`, true);
}

doCalendar = (content, append = false) => {
    let date = new Date();
    let calendar = "";
    if (content.indexOf("&") > 0) {
        content.split("&").forEach(m => calendar = `${calendar}${getCalendar(new Date(date.getFullYear(), m-1, 1), eventTag)}\n\n`);
    } else if (content.length == 1 || content.length == 2) { 
        date.setDate(1);
        date.setMonth(parseInt(content)-1);
        calendar = getCalendar(date, eventTag);
    } else if (content.length == 4) {
        [0,1,2,3,4,5,6,7,8,9,10,11].forEach(m => calendar = `${calendar}${getCalendar(new Date(parseInt(content), m, 1), eventTag)}\n\n`);
    } else {
        date = extractDate(content).date;
        calendar = getCalendar(date, eventTag);
    }

    showData(calendar, append, "\n");

    if (!append) {
        showStatus("done", true);
    }
}

doTimer = (content) => {
    content = convertFilter(content);
    let condition = `tag:${timerTag}+${ !content ? "recent:1m" : content }`;
    showTimers(filterData(condition));
    return;
}

doAdd = (text) => {
    if (!text) {
        showStatus("failed", true);
        return;
    }

    let pattern = /#[a-z0-9-]+/g;
    let tags = text.match(pattern);
    let extracted = extractDate(text);
    let date = extracted.date;
    text = extracted.text;
    if (!(tags || []).some(t => t.length > 0)) {
        tags = [`#${noteTag}`];
        text = `${text} #${noteTag}`;
    }

    notes.push({ date: date, tags: tags, text: text });
    saveNotes();
    let tagList = tags.map(t => t.substring(1)).join("|");
    showNotes(filterData(`.filter recent:1m+tag:${tagList}`));
    lastAdd = text;
}

doList = (content) => {
    content = convertFilter(content);
    showLists(filterData(`tag:${listTag}&-${hiddenTag}+${content}`));
}

doTask = (content) => {
    content = convertFilter(content);
    showTasks(filterData(`tag:${taskTag}&-${hiddenTag}+${content}`));
}

doEvent = (content) => {
    content = convertFilter(content);
    showTasks(filterData(`tag:${eventTag}&-${hiddenTag}+${content}`));
}

doContact = (content) => {
    content = convertFilter(content);
    showContacts(filterData(`tag:${contactTag}&-${hiddenTag}+${content}`));
}

doNote = (content) => {
    content = convertFilter(content);
    let filter = `tag:${skipTags}+${!content ? "recent:1m" : content}`;
    showNotes(filterData(filter));
}

doDiary = (content) => {
    content = convertFilter(content);
    let filter = `tag:${diaryTag}+${!content ? "recent:1m" : content}`;
    showNotes(filterData(filter));
}

doLog = (content) => {
    content = convertFilter(content);
    showNotes(filterData(!content ? "recent:1m" : content));
}

doAll = () => showNotes(notes);

doTag = (content) => {
    let tags = [];
    notes.forEach(d => {
        if (!content || d.tags.includes(`#${content}`)) {
            tags = [...tags, ...d.tags];
        }
    });
    tags = [... new Set(tags)].sort();
    showData(tags.join("\n"));
    showStatus(tags.length, true);
}

doName = (content) => {
    if (!content) {
        showStatus("failed", true);
        return;
    }

    let names = [];
    let subList = filterData(`tag:${content}`);
    subList.forEach(sl => {
        let matches = sl.text.match(/![a-z0-9-]+/g);
        if (matches) {
            names = [...names, ...matches];
        }
    });
    
    names = [... new Set(names)].sort();
    showData(names.join("\n"));
    showStatus(names.length, true);
}

doRemove = (content) => {
    if (!content) {
        showStatus("failed", true);
        return;
    }

    content = convertFilter(content);
    let toRemove = filterData(content);
    notes = notes.filter(d => !toRemove.some(tr => tr.date == d.date && tr.text == d.text));
    saveNotes();
    showNotes(toRemove);
}

doHide = (content) => {
    if (!content) {
        showStatus("failed", true);
        return;
    }

    content = convertFilter(content);
    let filtered = filterData(`tag:-${hiddenTag}+${content}`);
    let toHide = notes.filter(n => filtered.some(f => f.date == n.date && f.text == n.text));
    toHide.forEach(th => {
        th.tags.push(`#${hiddenTag}`);
        th.text = `${th.text} #${hiddenTag}`;
    });
    
    saveNotes();
    showNotes(toHide);
}

doEdit = (content) => {
    if (!content && !lastAdd) {
        showStatus("failed", true);
        return;
    }

    content = convertFilter(content);        
    if (!content) {
        content = `text:${lastAdd}`;
    }

    let toRemove = filterData(content);
    if (toRemove.length != 1) {
        showStatus("failed", true);
        return;
    }

    notes = notes.filter(d => !toRemove.some(tr => tr.date == d.date && tr.text == d.text));
    saveNotes();
    document.getElementById("tb").innerText = toRemove[0].text;
    showNotes(toRemove);
}

doCopy = (content) => {
    if (!content && !lastAdd) {
        showStatus("failed", true);
        return;
    }

    content = convertFilter(content);        
    if (!content) {
        content = `text:${lastAdd}`;
    }

    let toCopy = filterData(content);
    if (toCopy.length != 1) {
        showStatus("failed", true);
        return;
    }

    document.getElementById("tb").innerText = toCopy[0].text;
    showNotes(toCopy);
}

doMove = (content) => {
    if (!content) {
        showStatus("failed", true);
        return;
    }

    content = convertFilter(content);
    let filter = `tag:${skipTags}+${content}`;
    doExport(filter);
    let toMove = filterData(filter);
    notes = notes.filter(d => !toMove.some(tr => tr.date == d.date && tr.text == d.text));
    saveNotes();
    showNotes(toMove);
}

doExpense = (content) => {
    content = convertFilter(content);
    let condition = `tag:${expenseTag}+${ !content ? "recent:1m" : content }`;
    showExpenses(filterData(condition));
}

doReset = () => {
    doExport();
    notes = [];
    saveNotes();
    showData("");
    showStatus("done", true);
}

doExport = (content) => {
    content = convertFilter(content);
    let toExport = filterData(content);
    saveAsFile(JSON.stringify(toExport), "notes_backup_" + isoToString(new Date()));
    showStatus("done", true);
}

doPrint = (content) => {
    content = convertFilter(content);
    let toPrint = filterData(content);
    toPrint.sort((a, b) => new Date(b.date) - new Date(a.date));
    let message = "";
    let currDate;
    toPrint.forEach(l => {
        if (currDate != isoToString(l.date)) {
            message = `${message}[${isoToString(l.date)}]\n\n`;
            currDate = isoToString(l.date);
        }

        message = `${message}${l.text}\n\n`;
    });
    saveAsFile(message, "notes_data_" + isoToString(new Date()));
    showStatus("done", true);
}

doImport = (content) => {
    if (content == "reset") {
        notes = [];
    } 
    
    document.getElementById("fl").click();
}

doLink = (content) => {
    if (!content) {
        content = "google";
    }

    let all = content.split(" ");
    let site = all[0];
    let param = all.length > 1 ? content.substring(site.length + 1) : "";
    let links = filterData(`tag:${linkTag}&-${hiddenTag}`);
    let link = links.find(n => new RegExp(`(^|\\s+)!${site}($|\\s+)`).test(n.text));
    
    if (!link) {
        showStatus("failed", true);
        return;
    }

    all = link.text.match(/\^\S+/g);
    let url = (all || []).length > 0 ? all[0] : null;
    if (!url) {
        showStatus("failed", true);
        return;
    }

    showData(link.text);
    showStatus("opened", true);
    window.open(url.substring(1).replace("<param>", param));
}

doClear = () => { showData(""); showStatus("done", true); }

doText = (content) => {
    if (!content) {
        showStatus("failed", true);
        return;
    }
    
    switch (content) {
        case "load": {
            textMode = true;
            document.getElementById("fl").click();
            break;
        }
        case "save": {
            saveAsFile(document.getElementById("dv").innerText, "data_" + isoToString(new Date()));
            showStatus("done", true);
            break;
        }
        case "edit": {
            editDiv(true);
            showStatus("done", true);
            break;
        }
        default: {
            editDiv(false);
            showStatus("done", true);
        }
    }
}

editDiv = (status) => {
    editMode = status;
    document.getElementById("dv").contentEditable = status;
}

filterData = (content) => {
    let filters = !content ? [] : content.split("+");
    let subData = [...notes];
    filters.forEach(f => {
        if (!f || !f.trim() || f.split(":").length < 2) {
            return;
        }
        
        let field = f.split(":")[0].trim();
        let condition = f.split(":")[1].trim();
        switch (field) {
            case "date": {
                let range = condition.split("-");
                let from = new Date(range[0]);
                let to = new Date(range[0]);
                if (range.length > 1) {
                    to = new Date(range[1]);
                }
                subData = subData.filter(s => new Date(isoToString(s.date)) >= from && new Date(isoToString(s.date)) <= to);
                break;
            }
            case "tag": {
                if (condition.indexOf("|") > 0) {
                    let tagFilters = condition.split("|");
                    subData = subData.filter(s => tagFilters.some(tf => s.tags.includes(`#${tf}`)));
                }
                else {
                    let tagFilters = condition.split("&");
                    tagFilters.forEach(tf => {
                        if (tf.startsWith("-")) {
                            subData = subData.filter(s => !s.tags.includes(`#${tf.substring(1)}`));
                        } else {
                            subData = subData.filter(s => s.tags.includes(`#${tf}`));
                        }
                    });
                }
                break;
            }
            case "name": {
                if (condition.indexOf("|") > 0) {
                    let nameFilters = condition.split("|");
                    subData = subData.filter(s => nameFilters.some(nf => new RegExp(`(^|\\s+)!${nf}($|\\s+)`).test(s.text)));
                }
                else {
                    let nameFilters = condition.split("&");
                    nameFilters.forEach(nf => {
                        subData = subData.filter(s => new RegExp(`(^|\\s+)!${nf}($|\\s+)`).test(s.text));
                    });
                }
                break;
            }
            case "text": {
                let textFilters = condition.split("&");
                textFilters.forEach(tf => {
                    subData = subData.filter(s => s.text.indexOf(tf) > -1);
                });
                break;
            }
            case "recent": {
                let today = new Date();
                let to = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                let mode = condition.substring(condition.length - 1);
                let number = condition.substring(0, condition.length - 1) - 1;
                let from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                switch (mode) {
                    case "d": {
                        from.setDate(from.getDate() - number);
                        break;
                    }
                    case "m": {
                        from.setMonth(from.getMonth() - number);
                        from.setDate(1);
                        break;
                    }
                }
                subData = subData.filter(s => new Date(isoToString(s.date)) >= from && new Date(isoToString(s.date)) <= to);
                break;
            }
            case "next": {
                let today = new Date();
                today.setDate(today.getDate() + 1);
                let from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                let mode = condition.substring(condition.length - 1);
                let number = condition.substring(0, condition.length - 1) - 1;
                let to = new Date(from.getFullYear(), from.getMonth(), from.getDate());
                switch (mode) {
                    case "d": {
                        to.setDate(to.getDate() + number);
                        break;
                    }
                    case "m": {
                        to = new Date(to.getFullYear(), to.getMonth() + 1 + number, 0)
                        break;
                    }
                }
                subData = subData.filter(s => new Date(isoToString(s.date)) >= from && new Date(isoToString(s.date)) <= to);
                break;
            }
        }
    });
    return subData;
}

importFile = () => {
    let fileReader = new FileReader();
    fileReader.onload = (event) => {
        if (textMode) {
            document.getElementById("dv").innerText = event.target.result;
            showStatus("done", true);
            textMode = false;
            return;
        }
        let importedData = JSON.parse(event.target.result);
        importedData.forEach(i => notes.push(i));
        saveNotes();
        showStatus(importedData.length, true);
    };
    fileReader.readAsText(document.getElementById("fl").files[0], "UTF-8");
    document.getElementById("fl").value = null;
}

showNotes = (list) => {
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    let message = "";
    let currDate;
    list.forEach(l => {
        if (currDate != isoToString(l.date)) {
            message = `${message}[${isoToString(l.date)}]\n\n`;
            currDate = isoToString(l.date);
        }
        message = `${message}${l.text}\n\n`;
    });
    showData(message);
    showStatus(list.length, true);
}

showExpenses = (list) => {
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    let summaryList = [];
    let minDate = new Date();
    let maxDate = new Date("3/1/24");
    list.forEach(l => {
        let categories = l.text.match(/![a-z0-9-]+/g);
        let category = (categories || []).length >= 1 ? categories[0].substring(1) : expenseTag;
        let values = l.text.match(/£[0-9.-]+/g) || [];
        let value = 0;
        values.map(v => (v || " ").substring(1)).forEach(v => {
            let num = parseFloat(v);
            value += isNaN(num) ? 0 : num;
        });
        let matchingEntry = summaryList.find(sl => sl.category == category);
        minDate = minDate > new Date(l.date) ? new Date(l.date) : minDate;
        maxDate = maxDate < new Date(l.date) ? new Date(l.date) : maxDate;
        let detail = `${isoToString(l.date)} ${l.text}`;
        if (!matchingEntry) {
            summaryList.push({ category, value, detail });
        } else {
            matchingEntry.value += value;
            matchingEntry.detail = `${matchingEntry.detail}\n${detail}`;
        }
    });
    let total = summaryList.reduce((accumulated, item) => accumulated + item.value, 0);
    summaryList.sort((a, b) => b.value == a.value ? b.category - a.category  : b.value - a.value);
    let message = `[${isoToString(minDate)} - ${isoToString(maxDate)}]\n\nTotal ${total.toFixed(2)}\n`;
    summaryList.forEach(sl => message = `${message}\n${sl.category} ${sl.value.toFixed(2)}`);
    message = `${message}\n`;
    summaryList.forEach(sl => message = `${message}\n${sl.category} ${sl.value}\n${sl.detail}\n`);
    showData(message);
    showStatus(summaryList.length, true);
}

showLists = (list) => {
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    let subList = [];
    list.forEach(l => {
        let names = l.text.match(/![a-z0-9-]+/g);
        let name = (names || []).length > 0 ? names[0].substring(1) : listTag;
        let item = l.text.replace(/![a-z0-9-]+/g, "").replace(/#[a-z0-9-]+/g, "");
        let matchingEntry = subList.find(sl => sl.name == name);
        if (!matchingEntry) {
            subList.push({ name, item: `- ${item}` });
        } else {
            matchingEntry.item = `${matchingEntry.item}\n- ${item}`;
        }
    });
    let message = "";
    subList.forEach(sl => message = `${message}[${sl.name}]\n\n${sl.item}\n\n`);
    showData(message);
    showStatus(list.length, true);
}

showTasks = (list) => {
    let subList = [];
    let currDate = new Date();
    let currName = "";
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    list.forEach(l => {
        let names = l.text.match(/![a-z0-9-]+/g);
        let name = (names || []).length > 0 ? names[0].substring(1) : "";
        let item = l.text.replace(/![a-z0-9-]+/g, "").replace(/#[a-z0-9-]+/g, "").replace(/@\S+/g, "");
        let date = isoToString(l.date);
        let matchingDate = subList.find(sl => sl.date == date);
        if (!matchingDate) {
            subList.push({ date, tasks: [ { name, item } ] });
        } else {
            matchingDate.tasks.push({ name, item });
        }
    });

    subList.forEach(d => {
        d.tasks.sort((a, b) => a.item - b.item);
    });
    let message = "";
    subList.forEach(d => {
        message = `${message}[${d.date}]\n\n`;
        d.tasks.forEach(t => {
            message = !!t.name ? `${message}- ${t.item} !${t.name}\n` : `${message}- ${t.item}\n`;
        });
        message = `${message}\n`;
    });
    message = message.length > 0 ? message.substring(0, message.length - 1) : message;
    showData(message);
    showStatus(list.length, true);
}

showTimers = (list) => {
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    let subList = [];
    let start = null;
    let prev = null;
    list.forEach(l => {
        if (l.text.match(/!start/g)) {
            start = l;
            prev = l;
            let startText = start.text.replace(/!start/g, "").replace(/#[a-z0-9-]+/g, "").trim();
            startText = !!startText ? `${startText} !start` : "!start";
            subList.push({ date: l.date, duration: 0, text: startText });
            return;
        }
        
        if (l.text.match(/!stop/g) && !!start) {
            let stopText = l.text.replace(/!stop/g, "").replace(/#[a-z0-9-]+/g, "").trim();
            stopText = !!stopText ? `${stopText} !stop` : "!stop";
            subList.push({ date: l.date, duration: new Date(l.date)-new Date(start.date), text: stopText });
            start = null;
            prev = null;
            return;
        }
        
        if (!!start) {
            let text = l.text.replace(/#[a-z0-9-]+/g, "").trim();
            subList.push({ date: l.date, duration: new Date(l.date)-new Date(prev.date), text });
            prev = l;
        }
    });

    if (!!prev) {
        let text = prev.text.replace(/!start/g, "").replace(/#[a-z0-9-]+/g, "").trim();
        subList.push({ date: new Date(), duration: new Date()-new Date(prev.date), text });
    }

    let message = "";
    let currDate;
    subList.sort((a, b) => new Date(b.date) - new Date(a.date));
    subList.forEach(l => {
        if (currDate != isoToString(l.date)) {
            message = `${message}${!!currDate ? "\n" : ""}[${isoToString(l.date)}]\n\n`;
            currDate = isoToString(l.date);
        }

        message = `${message}${formatMilliSeconds(l.duration)} ${l.text}\n`;
    });
    
    showData(message);
    showStatus(subList.length, true);
}

showContacts = (list) => {
    let subList = [];
    list.forEach(l => {
        let numbers = l.text.match(/\+[0-9a-z/]+/g) || ["?"];
        let categories = l.text.match(/![a-z0-9-]+/g) || [`#${contactTag}`];
        let category = categories[0].substring(1);
        let rest = l.text.replace(/\+[0-9a-z/]+/g, "").replace(/![a-z0-9-]+/g, "").replace(/#[a-z0-9-]+/g, "");
        let all = rest.split("^");
        let name = all[0].trim() ? all[0].trim() : "?";
        let context = all.length > 1 && all[1] ? all[1].trim() : ""
        let contact = { date: l.date, name, category, numbers: [], context };
        numbers.forEach(n => {
            all = n.split("/");
            comment = all.length > 1 ? all[1] : "";
            contact.numbers.push({ number: all[0], comment });
        });
        subList.push(contact);
    });
    subList.sort((a, b) => b.name == a.name ? new Date(b.date) - new Date(a.date)  : a.name.localeCompare(b.name));
    let message = "";
    let wrap = (text) => !text ? "" : ` (${text})`;
    subList.forEach(sl => {
        message = `${message}${sl.name}`;
        sl.numbers.forEach(n => message = `${message}\n${n.number}${wrap(n.comment)}`);
        message = !sl.context ? `${message}\n\n` : `${message}\n~ ${sl.context}\n\n`;
    });
    showData(message);
    showStatus(subList.length, true);
}

saveAsFile = (data, fileName) => {
    let a = document.createElement("a");
    a.download = fileName;
    a.innerHTML = "export";
    a.href = window.URL.createObjectURL(new Blob([data], { type: "text/plain" }));
    a.style.display = "none";
    a.onclick = function (event) { document.body.removeChild(event.target); };
    document.body.appendChild(a);
    a.click();
}

showData = (text, append = false, splitter = "") => {
    let existing = document.getElementById("dv").innerText;
    let newContent = append && !!existing ? `${splitter}${text}` : text;
    document.getElementById("dv").innerText = append ? `${existing}${newContent}` : text;
}

showStatus = (text, append, splitter = " - ") => document.getElementById("spn").innerText = `${append ? document.getElementById("spn").innerText + splitter : ""}${text}`;

saveNotes = () => localStorage.setItem("notes", JSON.stringify(notes));

loadNotes = () => notes = JSON.parse(localStorage.getItem("notes") || "[]");

isoToString = (date) => {
    date = new Date(date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

formatMilliSeconds = (ms) => {
    let s = ms/1000;
    return `${Math.floor(s/3600).toString().padStart(2,"0")}:${Math.floor(s%3600/60).toString().padStart(2,"0")}:${Math.floor(s%60).toString().padStart(2,"0")}`;
}

getCalendar = (date, tag = "") => {
    let title = date.toLocaleString("default", { month: "long", year: "numeric"});
    let columns = "mon tue wed thu fri sat sun";
    let day = date.getDay();
    let start = new Date(date.getFullYear(), date.getMonth(), 1);
    let end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let events = !!tag ? filterData(`tag:${tag}+date:${isoToString(start)}-${isoToString(end)}`) : [];

    let lines = "\xA0\xA0\xA0\xA0".repeat(start.getDay() == 0 ? 6 : start.getDay()-1);
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        let currDate = isoToString(d);
        let mark = "\xA0";
        if (currDate == isoToString(new Date())) {
            mark = "°";
        } else if (events.some(e => isoToString(e.date) == currDate)) {
            mark = "`";
        }
        
        lines = `${lines}${d.getDate().toString().padStart(3, "\xA0").padEnd(4, mark)}${d.getDay() == 0 && isoToString(d) != isoToString(end) ? "\n\n" : ""}`;
    }

    let evMessage = "";
    events = events.filter(e => new Date(isoToString(e.date)) >= new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    events.forEach(e => {
        let number = new Date(e.date).getDate().toString().padStart(2, "\xA0");
        let names = e.text.match(/![a-z0-9-]+/g) || [];
        let name = names.length > 0 ? names[0].substring(1) : "";
        let text = e.text.replace(/![a-z0-9-]+/g, "").replace(/#[a-z0-9-]+/g, "").replace(/@\S+/g, "");
        text = !!name ? `${text} !${name}` : text;
        evMessage = `${evMessage}${number} - ${text}\n`;
    });
    evMessage = !!evMessage ? `\n\n${evMessage}` : `\n${evMessage}`;

    return `[${title}]\n\n${columns}\n\n${lines}${evMessage}`;
}

extractDate = (text) => {
    let dates = text.match(/@\S+/g);
    let date = new Date();
    let dateString = (dates || []).some(d => d.length > 0) ? dates[dates.length - 1].substring(1) : "";
    switch (dateString) {
        case "tomorrow": {
            date.setDate(date.getDate() + 1);
            break;
        }
        case "yesterday": {
            date.setDate(date.getDate() - 1);
            break;
        }
        case "weekend": {
            let noOfDays = 6 - date.getDay();
            date.setDate(date.getDate() + (noOfDays > 0 ? noOfDays : 7));
            break;
        }
        case "month": {
            date.setMonth(date.getMonth() + 1);
            date.setDate(1);
            break;
        }
        case "year": {
            date.setFullYear(date.getFullYear() + 1);
            date.setMonth(0);
            date.setDate(1);
            break;
        }
        default: {
            if ((dateString.endsWith("d") || dateString.endsWith("m") || dateString.endsWith("y"))) {
                let mode = dateString.substring(dateString.length - 1);
                let number = parseInt(dateString.substring(0, dateString.length - 1));
                switch (mode) {
                    case "d": {
                        date.setDate(date.getDate() + number);
                        break;
                    }
                    case "m": {
                        date.setMonth(date.getMonth() + number);
                        break;
                    }
                    case "y": {
                        date.setYear(date.getFullYear() + number);
                        break;
                    }
                }
            }
            else if (dateString.length >= 6
                    && dateString.length <= 10
                    && dateString.indexOf("/") > 0
                    && !isNaN(new Date(dateString).getDate())) {
                date = new Date(dateString);
            }
        }
    }

    return { text: !dateString ? text : text.replace(dateString, isoToString(date)), date };
}

convertFilter = (content) => {
    if (!content) {
        return content;
    }

    if (["tag:", "text:", "date:", "name:", "recent:", "next:"].some(k => content.indexOf(k) >= 0)) {
        return content;
    }

    let filters = [];
    let tags = content.match(/#[a-z0-9-]+/g) || [];
    let names = content.match(/![a-z0-9-]+/g) || [];
    let dates = content.match(/@\S+/g) || [];
    let text = content.replace(/#[a-z0-9-]+/g, "").replace(/![a-z0-9-]+/g, "").replace(/@\S+/g, "");

    if (tags.length > 0) filters.push(`tag:${tags.join("&").replaceAll("#", "")}`);
    if (names.length > 0) filters.push(`name:${names.join("&").replaceAll("!", "")}`);
    if (dates.length > 0) filters.push(`date:${dates.join("-").replaceAll("@", "")}`);
    if (!!text && !!text.trim()) filters.push(`text:${text.trim()}`);
    
    return filters.join("+");
}
