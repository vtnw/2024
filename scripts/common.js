var command = "";

window.addEventListener("load", () => loadNotes());

document.addEventListener("click", (event) => document.getElementById("tb").focus());

document.getElementById("tb").addEventListener("blur", (event) => processData(document.getElementById("tb").innerText));

document.getElementById("fl").addEventListener("change", () => importFile());

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

processData = (text) => {
    if (!text || /\s$/.test(text)) {
        return;
    }

    if (!text.startsWith(".")) {
        text = `.add ${text}`;
    }

    document.getElementById("tb").innerText = "";

    switch (action) {
        case "..": {
            document.getElementById("tb").innerText = command;
            break;
        }
        case ".add": case ".list": case ".filter": case ".clear": case ".reset": case ".export": case ".print": case ".import": case ".remove": {
            processNotes(action, content);
            break;
        }
        case ".expense": {
            showStatus(action);
            processExpenses(content);
            break;
        }
        default: {
            showStatus(`${action} - failed`);
            break;
        }
    }

    command = text;
}

doClear = () => { showData(""); showStatus("done", true); }

showData = (text) => document.getElementById("dv").innerText = text;

showStatus = (text, append) => document.getElementById("spn").innerText = `${append ? document.getElementById("spn").innerText + " - " : ""}${text}`;

isoToString = (date) => {
    date = new Date(date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}
