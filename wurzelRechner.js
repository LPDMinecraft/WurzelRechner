async function calc() {
    var n = 0, g = 0, r = 0, rr = 0, amount = (window.document.querySelector("[number]").value * 1), currentAmount = 0;
    var sq = true, log = false, system = "procent";
    if(window.document.querySelector("[option-pro]").selected) system = "procent";
    if(window.document.querySelector("[option-las]").selected) system = "last";
    if(window.document.querySelector("[option-num]").selected) system = "number";
    var waiter = 0; 
    var nStats = [];
    var start = (window.document.querySelector("[start]").value * 1);
    var fAmount = start + amount;
    nStats.push(["Zahl", "Wert"]);
    var last = 100;
    if(system == "last") last = 100;
    if(system == "number") last = 0;
    for (let i = start; i <= fAmount; i++) {
        var current = Math.sqrt(i);
        if (!sq) current = i;
        if (Number.isInteger(current) && i > 0) {
            if (log) console.log(i + " N - " + current);
            if(system == "last") last = 100;
            if(system == "number") last++;
            n++;
        } else if (Number.isInteger(current)) {
            if (log) console.log(i + " G - " + current);
            if(system == "last") last = last - 1;
            g++;
        } else if (!Number.isInteger(current)) {
            if (log) console.log(i + " R - " + current);
            if(system == "last") last = last - 1;
            r++;
        } else if (!Number.isInteger(current) && isFinite(current)) {
            if(log) console.log(i + " RR - " + current);
            if(system == "last") last = last - 1;
            rr++;
        }
        currentAmount++;
        waiter++;
        if(system == "procent") nStats.push([i, procent(n, currentAmount)]);
        if(system == "last") nStats.push([i, last]);
        if(system == "number") nStats.push([i, last]);
        refresh(n, g, r, rr, currentAmount);
        if(waiter > 25000) {
            await timeout(200);
            waiter = 0;
        }
    }
    console.log(nStats);

    let csvContent = "data:text/csv;charset=utf-8," + nStats.map(e => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    var version = "v" + window.document.querySelector("[version]").value;
    link.setAttribute("href", encodedUri);
    if(system == "procent") link.setAttribute("download", "florish-procent-" + version + "-" + amount + ".csv");
    else if(system == "last") link.setAttribute("download", "florish-last-" + version + "-" + amount + ".csv");
    else if(system == "number") link.setAttribute("download", "florish-number-" + version + "-" + amount + ".csv");
    document.body.appendChild(link);
    link.click();
    //await timeout(2500);
    //saveIntoTable("even", nStats);
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

function refresh(n, g, r, rr, amount) {
    window.document.querySelector("[c-display]").textContent = "Anzahl:     " + amount;
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