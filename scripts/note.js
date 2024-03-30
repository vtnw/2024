<script>
    var notes = [];
    
    processNotes = (action, content) => {
        switch (action) {
            case ".add": {
                showStatus(action);
                doAdd(content);
                break;
            }
            case ".list": {
                showStatus(action);
                doList(content);
                break;
            }
            case ".filter": {
                showStatus(action);
                doFilter(content);
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
        }

        command = text;
    }

    doAdd = (text) => {
        if (!text || !text.trim()) {
            showStatus("failed", true);
            return;
        }

        let pattern = /#[a-z0-9-]+/g;
        let defaultTag = "#note";
        let tags = text.match(pattern);
        let dates = text.match(/@\S+/g);
        let date = new Date();
        if (!(tags || []).some(t => t.length > 0)) {
            tags = [defaultTag];
            text = `${text} ${defaultTag}`;
        }

        let newDate = (dates || []).some(d => d.length > 0) ? dates[dates.length - 1].substring(1) : "";
        if (newDate.length >= 6
            && newDate.length <= 10
            && newDate.indexOf("/") > 0
            && !isNaN(new Date(newDate).getDate())) {
            date = new Date(newDate);
        }

        let toAdd = { date: date, tags: tags, text: text };
        notes.push(toAdd);
        saveNotes();

        showList([toAdd]);
    }

    doList = (content) => {
        if (!content || !content.trim()) {
            content = "notes";
        }

        switch (content) {
            case "notes": {
                showList(notes);
                break;
            }
            case "tags": {
                showTags();
                break;
            }
        }
    }

    doFilter = (content) => {
        if (!content || !content.trim()) {
            showStatus("failed", true);
            return;
        }

        showList(filterData(content));
    }

    doRemove = (content) => {
        if (!content || !content.trim()) {
            showStatus("failed", true);
            return;
        }

        let toRemove = filterData(content);
        notes = notes.filter(d => !toRemove.some(tr => tr.date == d.date && tr.text == d.text));
        showList(toRemove);
    }

    doReset = () => {
        notes = [];
        saveNotes();
        showData("");
        showStatus("done", true);
    }

    doExport = (content) => {
        let toExport = filterData(content);
        saveAsFile(JSON.stringify(toExport), "notes_backup_" + isoToString(new Date()));
        showStatus("done", true);
    }

    doPrint = (content) => {
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

    doImport = (content) => { if (content == "reset") { notes = []; } document.getElementById("fl").click(); }

    filterData = (content) => {
        let filters = !content || !content.trim() ? [] : content.split("+");
        let subData = [...notes];
        filters.forEach(f => {
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
                    let tagFilters = condition.split("&");
                    tagFilters.forEach(tf => {
                        subData = subData.filter(s => s.tags.includes(`#${tf}`));
                    });
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
                    if (!condition || !condition.trim()) {
                        condition = "1d";
                    }

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
                    if (!condition || !condition.trim()) {
                        condition = "1d";
                    }

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
            let importedData = JSON.parse(event.target.result);
            importedData.forEach(i => notes.push(i));
            saveNotes();
            showStatus("done", true);
            setTimeout(location.reload(), 1000);
        };
        fileReader.readAsText(document.getElementById("fl").files[0], "UTF-8");
    }

    showTags = () => {
        let tags = [];
        notes.forEach(d => {
            tags = [...tags, ...d.tags];
        });
        let tagList = [... new Set(tags)].sort();
        showData(tagList.join("\n"));
        showStatus(tagList.length, true);
    }

    showList = (list) => {
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

    saveNotes = () => localStorage.setItem("notes", JSON.stringify(notes));

    loadNotes = () => notes = JSON.parse(localStorage.getItem("notes") || "[]");
</script>
