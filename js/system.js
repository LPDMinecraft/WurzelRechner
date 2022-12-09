var maxFilePerSecound, maxFileWriter, eTime, n, g, r, rr, amount, eTime, currentAmount, fAmount, npsStats, sq, log, system, numType, stats, waiter, cTime, current, start, last;
var numberManagerClass, timeManagerClass, waitManagerClass, utilsClass, typeManagerClass;



function getNumberManager() {
    return numberManagerClass;
}
function getTimeManager() {
    return timeManagerClass;
}
function getWaitManager() {
    return waitManagerClass;
}
function getUtils() {
    return utilsClass;
}
function getTypeManager() {
    return typeManagerClass;
}



window.addEventListener("load", (e) => {
    setLocale(defaultLocale);

    initVariables();
    windowRefresher();
});



function initVariables() {
    typeManagerClass = new TypeManager();
    numberManagerClass = new NumberManager();
    timeManagerClass = new TimeManager();
    waitManagerClass = new WaitManager();
    utilsClass = new Utils();



    eTime = getTimeManager().getCurrentDateByMilSec();
    n = 0, g = 0, r = 0, rr = 0,
        amount = (window.document.querySelector("[number]").value * 1),
        currentAmount = 0;
    sq = "sq",
        log = true,
        system = "procent",
        npsStats = [],
        numType = "N";
    maxFilePerSecound = getTimeManager().refreshMaxItemsPerSec();



    if (window.document.querySelector("[option-pro]").selected) system = "procent";
    if (window.document.querySelector("[option-las]").selected) system = "last";
    if (window.document.querySelector("[option-num]").selected) system = "number";

    if (window.document.querySelector("[option-n]").selected) numType = "N";
    if (window.document.querySelector("[option-g]").selected) numType = "G";
    if (window.document.querySelector("[option-r]").selected) numType = "R";
    if (window.document.querySelector("[option-rr]").selected) numType = "RR";

    log = window.document.querySelector("[loggin]").checked;
    if (window.document.querySelector("[option-nro]").selected) sq = "nr";
    if (window.document.querySelector("[option-sqr]").selected) sq = "sq";

    stats = [], start = (window.document.querySelector("[start]").value * 1);
    waiter = 0, maxFileWriter = 0, fAmount = start + amount, last = 100;
    stats.push(["Pos", "Number"]);

    if (system == "last") last = 100;
    if (system == "number") last = 0;
}

async function generateNumbers() {
    initVariables();

    if(system == "procent") getTypeManager().generateNumbers_Procent();
    else if(system == "last") getTypeManager().generateNumbers_Last();
    else if(system == "number") getTypeManager().generateNumbers_Number();
    else console.error("Did not find the System Type");
}

function createFile() {
    let
        csvContent = "data:text/csv;charset=utf-8," + stats.map(e => e.join(",")).join("\n"),
        encodedUri = encodeURI(csvContent);

    var
        version = "v" + window.document.querySelector("[version]").value,
        fileName = "flourish_____" + start + "_" + amount + "___";

    if (numType == "N") fileName = fileName + "N_";
    else if (numType == "G") fileName = fileName + "G_";
    else if (numType == "R") fileName = fileName + "R_";
    else if (numType == "RR") fileName = fileName + "RR_";

    if (system == "procent") fileName = fileName + "procent_";
    else if (system == "last") fileName = fileName + "last_";
    else if (system == "number") fileName = fileName + "number_";

    if (sq == "nr") fileName = fileName + "nr___";
    else if (sq == "sq") fileName = fileName + "sq___";

    fileName = fileName + version + ".csv";

    return [encodedUri, fileName];
}
function openFile() {
    var
        fileData = createFile(),
        link = document.createElement("a");

    link.setAttribute("href", fileData[0]);
    link.setAttribute("download", fileData[1]);

    document.body.appendChild(link);
    link.click();
    return fileData;
}
function createNPSFile() {
    let
        csvContent = "data:text/csv;charset=utf-8," + npsStats.map(e => e.join(",")).join("\n"),
        encodedUri = encodeURI(csvContent);

    var fileName = "npsFile-" + (getTimeManager().getCurrentDateByMilSec() * 1);

    return [encodedUri, fileName];
}
function openNPSFile() {
    var
        fileData = createNPSFile(),
        link = document.createElement("a");

    link.setAttribute("href", fileData[0]);
    link.setAttribute("download", fileData[1]);

    document.body.appendChild(link);
    link.click();
    return fileData;
}

async function windowRefresher() {
    refreshWindow();
    setTimeout(50, () => {
        windowRefresher();
    });
}

async function refreshWindow() {
    var currentMilSec = getTimeManager().getCurrentDateByMilSec();
    var etime = ((currentMilSec - eTime) / 2);

    if (etime > 0) window.document.querySelector("[c-etime]").textContent = getTimeManager().getHrMinSecMillisecFormat(etime);
    window.document.querySelector("[c-display]").textContent = currentAmount;
    window.document.querySelector("[c-time]").textContent = getTimeManager().calcRemainingTime(currentAmount, amount, maxFilePerSecound);
    window.document.querySelector("[n-amount-display]").textContent = n;
    window.document.querySelector("[g-amount-display]").textContent = g;
    window.document.querySelector("[r-amount-display]").textContent = r;
    window.document.querySelector("[rr-amount-display]").textContent = rr;

    window.document.querySelector("[n-procent-display]").textContent = getUtils().procent(n, currentAmount) + "%";
    window.document.querySelector("[g-procent-display]").textContent = getUtils().procent(g, currentAmount) + "%";
    window.document.querySelector("[r-procent-display]").textContent = getUtils().procent(r, currentAmount) + "%";
    window.document.querySelector("[rr-procent-display]").textContent = getUtils().procent(rr, currentAmount) + "%";
}



class Utils {
    constructor() { }

    procent(first, secound) {
        var num = (first / secound) * 100;
        return (Math.round(num * 1000000) / 1000000).toFixed(6);
    }
}

class NumberManager {
    constructor() { }

    countDecimals(value) {
        if (Math.floor(value) === value) return 0;
        return value.toString().split(".")[1].length || 0;
    }
    hasDecimals(value, lenght) {
        return this.countDecimals(value) == lenght;
    }

    number(current, i) {
        if (this.isNaturalNumber(current)) {
            if (log) console.log(i + " N - " + current);
            if (numType === "N") {
                if (system == "last") last = 100;
                if (system == "number") last++;
            } else {
                if (system == "last") last = last - 1;
            }
            n++;
        } else if (this.isWholeNumber(current)) {
            if (log) console.log(i + " G - " + current);
            if (numType == "G") {
                if (system == "last") last = 100;
                if (system == "number") last++;
            } else {
                if (system == "last") last = last - 1;
            }
            g++;
        } else if (this.isRationalNumber(current)) {
            if (log) console.log(i + " R - " + current);
            if (numType == "R") {
                if (system == "last") last = 100;
                if (system == "number") last++;
            } else {
                if (system == "last") last = last - 1;
            }
            r++;
        } else if (this.isReeleNumber(current)) {
            if (log) console.log(i + " RR - " + current);
            if (numType == "RR") {
                if (system == "last") last = 100;
                if (system == "number") last++;
            } else {
                if (system == "last") last = last - 1;
            }
            rr++;
        }
    }
    isNaturalNumber(current) {
        return Number.isInteger(current) && current > 0;
    }
    isWholeNumber(current) {
        return Number.isInteger(current);
    }
    isRationalNumber(current) {
        return !Number.isInteger(current) && !this.hasDecimals(current, 12);
    }
    isReeleNumber(current) {
        return !Number.isInteger(current) && this.hasDecimals(current, 12);
    }
}

class WaitManager {
    constructor() { }
    static done = true;

    timeoutWithAsync(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    timeoutWithoutAsync(ms) {
        WaitManager.done = false;
        setTimeout(ms, () => {
            done = true;
        });
    }
    isDone() {
        return done;
    }
}

class TimeManager {
    constructor() { }

    getDateByMilSec(date) {
        return date.getTime();
    }
    getCurrentDateByMilSec() {
        return new Date();
    }
    getHrMinSecFormat(milisecounds) {
        var d = new Date(milisecounds);
        var format = "";

        var hr = (d.getHours() - 1);
        if (hr < 10) {
            format = format + "0" + hr + ":";
        } else if (hr < 1) {
            format = format;
        } else {
            format = format + hr + ":";
        }

        var min = d.getMinutes();
        if (min < 10) {
            format = format + "0" + min + ":";
        } else if (min < 1 && hr < 1) {
            format = format;
        } else {
            format = format + min + ":";
        }

        var sec = d.getSeconds();
        if (sec < 10) {
            format = format + "0" + sec;
        } else if (sec < 1 && min < 1) {
            format = format;
        } else {
            format = format + sec;
        }
        return format;
    }
    getHrMinSecMillisecFormat(milisecounds) {
        var d = new Date(milisecounds);
        var format = this.getHrMinSecFormat(milisecounds);

        var milsec = d.getMilliseconds();
        if (milsec < 100) {
            format = format + ":0" + milsec;
        } else if (milsec < 10) {
            format = format + ":00" + milsec;
        } else if (milsec < 1) {
            format = format;
        } else {
            format = format + ":" + milsec;
        }

        return format;
    }
    calcRemainingTime(amount, totalAmount, maxFilePerSecound) {
        var t = Math.round(((totalAmount - amount) / maxFilePerSecound) / 1);
        if (t < 0) t = 0;
        return this.getHrMinSecFormat(t * 1000);
    }

    calcMaxItemsPerSec() {
        var eTime = this.getCurrentDateByMilSec(new Date()), log2 = false;
        let i = 0;

        if (log2) {
            console.log(" ");
            console.log(" ");
            console.log("You cannot disable this message:");
            console.log(" ");
        }

        for (i = 0; i < 1000000; i++) {
            var cTime = this.getCurrentDateByMilSec(new Date());
            var milSecsBetween = cTime - eTime;
            if (milSecsBetween < 325) {
                console.log(milSecsBetween + " - " + eTime + " - " + cTime);
            } else {
                if (log2) {
                    console.log(" ");
                    console.log("You cannot disable the message before");
                    console.log(" ");
                    console.log(" ");
                }

                var numbersPerSec = Math.round((i - 1) / 1.5);
                return numbersPerSec;
            }
        }
        return 2000;
    }

    refreshMaxItemsPerSec() {
        window.document.querySelector("[calcTime]").textContent = "Calculating...";
        var maxItemsPerSec = this.calcMaxItemsPerSec();
        window.document.querySelector("[calcTime]").textContent = "Numbers per secound: " + maxItemsPerSec;

        var pos = npsStats.length;
        npsStats.push([pos, maxItemsPerSec]);
        return maxItemsPerSec;
    }
}



class TypeManager {
    constructor() {}

    async generateNumbers_Procent() {
        initVariables();
    
        for (let i = start; i <= (fAmount - 1); i++) {
            cTime = getTimeManager().getCurrentDateByMilSec();
            if (sq === "nr") current = i;
            if (sq === "sq") current = Math.sqrt(i);
    
            maxFileWriter = maxFileWriter + (0.4 / maxFilePerSecound);
            // Normaly its 2.5
            if (maxFileWriter > 2.5) {
                maxFileWriter = 0;
                maxFilePerSecound = getTimeManager().refreshMaxItemsPerSec();
            }
            getNumberManager().number(current, i);
    
            currentAmount++;
            waiter++;
    
    
            if (numType == "N") {
                stats.push([i, getUtils().procent(n, currentAmount)]);
            } else if (numType == "G") {
                stats.push([i, getUtils().procent(g, currentAmount)]);
            } else if (numType == "R") {
                stats.push([i, getUtils().procent(r, currentAmount)]);
            } else if (numType == "RR") {
                stats.push([i, getUtils().procent(rr, currentAmount)]);
            }
    
    
            var currentMilSec = getTimeManager().getCurrentDateByMilSec();
            if (log) console.log(currentMilSec);
            refreshWindow();
            if (waiter > maxFilePerSecound) {
                waiter = 0;
                var time = currentMilSec - cTime;
                await getWaitManager().timeoutWithAsync(500 - time);
            }
        }
        if (log) console.log(stats);
        openFile();
        openNPSFile();
    
        //saveIntoTable("even", nStats);
    }
    async generateNumbers_Last() {
        initVariables();
    
        for (let i = start; i <= (fAmount - 1); i++) {
            cTime = getTimeManager().getCurrentDateByMilSec();
            if (sq === "nr") current = i;
            if (sq === "sq") current = Math.sqrt(i);
    
            maxFileWriter = maxFileWriter + (0.4 / maxFilePerSecound);
            // Normaly its 2.5
            if (maxFileWriter > 2.5) {
                maxFileWriter = 0;
                maxFilePerSecound = getTimeManager().refreshMaxItemsPerSec();
            }
            getNumberManager().number(current, i);
    
            currentAmount++;
            waiter++;
    
    
            stats.push([i, last]);
    
    
            var currentMilSec = getTimeManager().getCurrentDateByMilSec();
            if (log) console.log(currentMilSec);
            refreshWindow();
            if (waiter > maxFilePerSecound) {
                waiter = 0;
                var time = currentMilSec - cTime;
                await getWaitManager().timeoutWithAsync(500 - time);
            }
        }
        if (log) console.log(stats);
        openFile();
        openNPSFile();
    
        //saveIntoTable("even", nStats);
    }
    async generateNumbers_Number() {
        initVariables();
    
        for (let i = start; i <= (fAmount - 1); i++) {
            cTime = getTimeManager().getCurrentDateByMilSec();
            if (sq === "nr") current = i;
            if (sq === "sq") current = Math.sqrt(i);
    
            maxFileWriter = maxFileWriter + (0.4 / maxFilePerSecound);
            // Normaly its 2.5
            if (maxFileWriter > 2.5) {
                maxFileWriter = 0;
                maxFilePerSecound = getTimeManager().refreshMaxItemsPerSec();
            }
            getNumberManager().number(current, i);
    
            currentAmount++;
            waiter++;
    
    
            stats.push([i, last]);
    
    
            var currentMilSec = getTimeManager().getCurrentDateByMilSec();
            if (log) console.log(currentMilSec);
            refreshWindow();
            if (waiter > maxFilePerSecound) {
                waiter = 0;
                var time = currentMilSec - cTime;
                await getWaitManager().timeoutWithAsync(500 - time);
            }
        }
        if (log) console.log(stats);
        openFile();
        openNPSFile();
    
        //saveIntoTable("even", nStats);
    }
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