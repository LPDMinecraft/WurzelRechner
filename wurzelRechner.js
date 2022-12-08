async function calc() {
    var n = 0, g = 0, r = 0, rr = 0, amount = (window.document.querySelector("[number]").value * 1), currentAmount = 0;
    var sq = "sq", log = true, system = "procent", numType = "N";
    var maxFilePerSecound = 25000;
    if (window.document.querySelector("[option-pro]").selected) system = "procent";
    if (window.document.querySelector("[option-las]").selected) system = "last";
    if (window.document.querySelector("[option-num]").selected) system = "number";

    if (window.document.querySelector("[option-n]").selected) numType = "N";
    if (window.document.querySelector("[option-g]").selected) numType = "G";
    if (window.document.querySelector("[option-r]").selected) numType = "R";
    if (window.document.querySelector("[option-rr]").selected) numType = "RR";

    log = window.document.querySelector("[debbug]").checked;
    if (window.document.querySelector("[option-nro]").selected) sq = "nr";
    if (window.document.querySelector("[option-sqr]").selected) sq = "sq";

    var waiter = 0;
    var stats = [];
    var start = (window.document.querySelector("[start]").value * 1);
    var fAmount = start + amount;
    stats.push(["Zahl", "Wert"]);
    var last = 100;
    if (system == "last") last = 100;
    if (system == "number") last = 0;
    for (let i = start; i <= fAmount; i++) {
        var cTime = getCurrentDateByMilSec(new Date());
        var current;
        if (sq === "nr") current = i;
        if (sq === "sq") current = Math.sqrt(i);

        if (Number.isInteger(current) && i > 0) {
            if (log) console.log(i + " N - " + current);
            if (numType === "N") {
                if (system == "last") last = 100;
                if (system == "number") last++;
            } else {
                if (system == "last") last = last - 1;
            }
            n++;
        } else if (Number.isInteger(current)) {
            if (log) console.log(i + " G - " + current);
            if (numType == "G") {
                if (system == "last") last = 100;
                if (system == "number") last++;
            } else {
                if (system == "last") last = last - 1;
            }
            g++;
        } else if (!Number.isInteger(current)) {
            if (log) console.log(i + " R - " + current);
            if (numType == "R") {
                if (system == "last") last = 100;
                if (system == "number") last++;
            } else {
                if (system == "last") last = last - 1;
            }
            r++;
        } else if (!Number.isInteger(current) && isFinite(current)) {
            if (log) console.log(i + " RR - " + current);
            if (numType == "RR") {
                if (system == "last") last = 100;
                if (system == "number") last++;
            } else {
                if (system == "last") last = last - 1;
            }
            rr++;
        }
        currentAmount++;
        waiter++;
        if (system == "procent") {
            if (numType == "N") {
                stats.push([i, procent(n, currentAmount)]);
            } else if (numType == "G") {
                stats.push([i, procent(g, currentAmount)]);
            } else if (numType == "R") {
                stats.push([i, procent(r, currentAmount)]);
            } else if (numType == "RR") {
                stats.push([i, procent(rr, currentAmount)]);
            }
        }
        if (system == "last") stats.push([i, last]);
        if (system == "number") stats.push([i, last]);
        refresh(n, g, r, rr, currentAmount, maxFilePerSecound, fAmount);
        if (waiter > maxFilePerSecound) {
            waiter = 0;
            var time = getCurrentDateByMilSec(new Date()) - cTime;
            await timeout(1000 - time);
        }
    }
    console.log(stats);

    let csvContent = "data:text/csv;charset=utf-8," + stats.map(e => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    var version = "v" + window.document.querySelector("[version]").value;
    link.setAttribute("href", encodedUri);
    var fileName = "flourish-" + start + "-" + amount + "-";

    if (numType == "N") fileName = fileName + "N-";
    else if (numType == "G") fileName = fileName + "G-";
    else if (numType == "R") fileName = fileName + "R-";
    else if (numType == "RR") fileName = fileName + "RR-";

    if (system == "procent") fileName = fileName + "procent-";
    else if (system == "last") fileName = fileName + "last-";
    else if (system == "number") fileName = fileName + "number-";

    if (sq == "nr") fileName = fileName + "nr-";
    else if (sq == "sq") fileName = fileName + "sq-";

    fileName = fileName + version + ".csv";

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    //await timeout(2500);
    //saveIntoTable("even", nStats);
}

function getCurrentDateByMilSec(d) {
    return ((d.getHours() * 60 + d.getMinutes()) * 60 + d.getSeconds()) + d.milsec;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function saveIntoTable(id, data) {
    var table = window.document.getElementById(id);
    table.innerHTML = "";
    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    for (let i = 1; i < Object.values(data).length; i++) {
        console.log("");
        console.log("Create TD");

        var tr1 = document.createElement("tr");
        var tr2 = document.createElement("tr");

        tr1.textContent = Object.values(data)[i][0];
        console.log("Create TR1:");
        console.log(tr1);

        tr2.textContent = Object.values(data)[i][1];
        console.log("Create TR2:");
        console.log(tr2);

        td1.appendChild(tr1);
        td2.appendChild(tr2);
    }
    table.appendChild(td1);
    table.appendChild(td2);
}

function estimatedTime(totalAmount, amount, maxFilePerSecound) {
    var t = Math.round(((totalAmount - amount) / maxFilePerSecound) / 2);
    if (t < 0) t = 0;


    var d = new Date(t * 1000);
    console.log(t);
    var hr = (d.getHours() - 1);
    if (hr < 10) {
        hr = "0" + hr;
    }
    var min = d.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    var sec = d.getSeconds();
    if (sec < 10) {
        sec = "0" + sec;
    }
    var ampm = "am";
    if (hr > 12) {
        hr -= 12;
        ampm = "pm";
    }
    return hr + ":" + min + ":" + sec;
}

function refresh(n, g, r, rr, amount, maxFilePerSecound, totalAmount) {
    window.document.querySelector("[c-display]").textContent = amount;
    window.document.querySelector("[c-time]").textContent = estimatedTime(totalAmount, amount, maxFilePerSecound);
    window.document.querySelector("[n-amount-display]").textContent = n;
    window.document.querySelector("[g-amount-display]").textContent = g;
    window.document.querySelector("[r-amount-display]").textContent = r;
    window.document.querySelector("[rr-amount-display]").textContent = rr;

    window.document.querySelector("[n-procent-display]").textContent = procent(n, amount) + "%";
    window.document.querySelector("[g-procent-display]").textContent = procent(g, amount) + "%";
    window.document.querySelector("[r-procent-display]").textContent = procent(r, amount) + "%";
    window.document.querySelector("[rr-procent-display]").textContent = procent(rr, amount) + "%";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function procent(first, secound) {
    var num = (first / secound) * 100;
    return (Math.round(num * 1000000) / 1000000).toFixed(6);
}