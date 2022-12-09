const defaultLocale = "de";
const supportedLocales = ["en", "de"];

let locale;
let translations = {};

async function setLocale(newLocale) {
    console.log("Starting Translation System");

    const newTranslations = await fetchTranslationsFor(newLocale);

    console.log("New translations:");
    console.log(newTranslations);

    translations = newTranslations;
    locale = newLocale;
    
    translatePage();
    bindLocaleSwitcher(locale);

    console.log("Loaded Translation System");
}



// Supported Languages



function isSupported(locale) {
    return supportedLocales.indexOf(locale) > -1;
}
function supportedOrDefault(locales) {
    return locales.find(isSupported) || defaultLocale;
}
function browserLocales(languageCodeOnly = false) {
    return navigator.languages.map((locale) =>
      languageCodeOnly ? locale.split("-")[0] : locale,
    );
}



// Button System



function bindLocaleSwitcher(initialValue) {
    console.log("Register all buttons...");
    getAllLocaleSwitcherButtons().forEach(button =>
        registerButton(button, initialValue),
    );
    console.log("Registered all buttons");
}
function registerButton(currentButton, lang) {
    console.log(" ");
    console.log("Register new lang button");
    console.log("Current lang: " + lang);
    console.log("Current Button:");
    console.log(currentButton);
    console.log(" ");
    currentButton.value = lang;
    currentButton.onchange = (e) => {
        setLocale(e.target.value);
        setTimeout(() => {
            refresh();
        }, 100);
    };
}
function getAllLocaleSwitcherButtons() {
    console.log("");
    console.log("Searching all Buttons");
    var allButtons = document.querySelectorAll("[data-i18n-switcher]");
    console.log("Normal search done");
    console.log("Starting IFrame-Buttons search");

    document.querySelectorAll('iframe').forEach(currentIframe =>
        allButtons = mergeTogether(allButtons, getAllLocaleSwitcherButtonsInIframes(currentIframe)),
    );

    console.log("IFrame-Button search done");
    console.log("");
    return allButtons;
}
function getAllLocaleSwitcherButtonsInIframes(iframe) {
    var buttons = [];

    console.log("Search in IFrame:");
    console.log(iframe.contentDocument);
    console.log("Found: ");
    console.log(iframe.contentDocument.querySelectorAll("[data-i18n-switcher]"));
    buttons = iframe.contentDocument.querySelectorAll("[data-i18n-switcher]");
    console.log(buttons);

    var ownIframes = iframe.contentDocument.querySelectorAll('iframe');
    if(ownIframes.length > 0) {
        for(var currentFrame of ownIframes) {
            if(currentFrame.contentDocument.querySelectorAll("[data-i18n-switcher]").length > 0) {
                buttons = mergeTogether(buttons, getAllLocaleSwitcherButtonsInIframes(currentFrame));
            }
        }
    }

    return buttons;
}



// File System



async function fetchTranslationsFor(newLocale) {
    var defpath = `../lang/${newLocale}.json`;
    var path = ``;
    var found = false;

    const response = await fetch(defpath);
    while(found) {
        response = fetch(path + defpath);
        if(doesFileExist(path + defpath)) {
            found = true;
        }
        path = path + `../`;
        response = fetch(path + defpath);
        if(doesFileExist(path + defpath)) {
            found = true;
        }
    }
    console.log("Working with file:");
    console.log(response.url);
    console.log("Working with response:");
    console.log(response);
    return await response.json();
}

function doesFileExist(urlToFile) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, false);
    xhr.send();
     
    if (xhr.status == "404") {
        return false;
    } else {
        return true;
    }
}



// Translation System



function translatePage() {
    var allTranslableElements = getAllTranslableElements();

    console.log("Found translable Elements: " + allTranslableElements.length);
    console.log(allTranslableElements);
    console.log("Translating all Objects...");
    allTranslableElements.forEach(translateElement);
    console.log(" ");
    console.log("Translated all Objects");
    console.log(" ");
}

function getAllTranslableElements() {
    console.log("");
    var getAllTranslableElements = document.querySelectorAll("[data-i18n]");

    document.querySelectorAll('iframe').forEach(currentIframe =>
        getAllTranslableElements = mergeTogether(getAllTranslableElements, searchInIframe(currentIframe)),
    );

    console.log("");
    return getAllTranslableElements;
}
function mergeTogether(input, output) {
    var merged = [];
    for(var i = 0; output.length > i; i++) {
        merged[i] = output[i];
    }
    for(var i = 0; input.length > i; i++) {
        merged[i + output.length] = input[i];
    }
    return merged;
}
function searchInIframe(iframe) {
    var allIFrames = [];
    var allI18n = [];
    allIFrames[0] = iframe;

    if(iframe.contentDocument.querySelectorAll('iframe').length > 0) {
        iframe.contentDocument.querySelectorAll('iframe').forEach(currentIframe => 
            allIFrames[Object.keys(allIFrames).length] = currentIframe,
        );
    }
    console.log("Search in IFrame:");
    console.log(iframe.contentDocument);
    console.log("Found: ");
    console.log(iframe.contentDocument.querySelectorAll("[data-i18n]"));
    allI18n = iframe.contentDocument.querySelectorAll("[data-i18n]");
    console.log(allI18n);

    if(Object.keys(allIFrames).length > 1) {
        console.log("");
        for(var i = 1; i < Object.keys(allIFrames).length; i++) {
            var currentIframe = allIFrames[i];
            var currentIframeTranslations = searchInIframe(currentIframe);
            if(currentIframe.read != "no") {
                allI18n = mergeTogether(allI18n, currentIframeTranslations);
            }
        }
    }

    return allI18n;
}

function translateElement(element) {
    const path = element.getAttribute("data-i18n");
    if(path.includes(":")) {
        //const translation = translations[key][value];
        const key = path.split(":")[0];
        const value = path.split(":")[1];
        translation = translations[key][value];
        if(value.includes(".")) {
            var splittedValue = value.split(".");
            translation = translations[key];

            for(var c of splittedValue) {
                console.log(translation);
                console.log(c);
                if(translation[c] != undefined) {
                    translation = translation[c];
                } else {
                    translation = undefined;
                    break;
                }
            }

            console.log(" ");
            console.log("Finding Path");
            console.log("Key: " + key);
            console.log("Unproceeded Value: " + value);
            console.log("Splitted Value: " + splittedValue);
        }
    
        console.log(" ");
        console.log("Translating Object");
        console.log("Path: | " + path);
        console.log("Normal text: " + element.innerText);
        console.log("Translated text: " + translation);

        if(translation != undefined) {
            console.log(element.innerText);
            element.innerText = translation;
            console.log(element.innerText);

            return true;
        }
    }
    console.log(" ");
    console.log("Cannot translate Object");
    console.log("Path: | " + path);
    console.log("Element:");
    console.log(element);

    element.innerText = element.innerText + " (No right translation found)";
}