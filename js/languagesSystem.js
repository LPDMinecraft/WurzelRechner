const defaultLocale = "de";
const supportedLocales = ["en", "de"];

var languagesManager_localesManagerClass, languagesManager_fileManagerClass, languagesManager_buttonManagerClass, languagesManager_translationSystemClass, languagesManager_utilsClass;

let locale;
let translations = {};

function initLangauages() {
    languagesManager_localesManagerClass = new languagesManager_LocalesManager();
    languagesManager_fileManagerClass = new languagesManager_FileManager();
    languagesManager_buttonManagerClass = new languagesManager_ButtonManager();
    languagesManager_translationSystemClass = new languagesManager_TranslationSystem();
    languagesManager_utilsClass = new Utils();
}

function languagesManager_getLocalesManager() {
    return languagesManager_localesManagerClass;
}
function languagesManager_getFileManager() {
    return languagesManager_fileManagerClass;
}
function languagesManager_getButtonManager() {
    return languagesManager_buttonManagerClass;
}
function languagesManager_getTranslationSystem() {
    return languagesManager_translationSystemClass;
}
function languagesManager_getUtils() {
    return languagesManager_utilsClass;
}

class languagesManager_LocalesManager {
    constructor() { }

    async setLocale(newLocale) {
        console.log("Starting Translation System");
    
        const newTranslations = await languagesManager_getFileManager().fetchTranslationsFor(newLocale);
    
        console.log("New translations:");
        console.log(newTranslations);
    
        translations = newTranslations;
        locale = newLocale;
    
        languagesManager_getTranslationSystem().translatePage();
        languagesManager_getButtonManager().bindLocaleSwitcher(locale);
    
        console.log("Loaded Translation System");

        setTimeout(() => {
            // Here you can set everything you want to reload after loading the translation system
            // Example: refresh();
            startSystem();
        }, 100);
    }
    
    
    
    // Supported Languages
    
    
    
    isSupported(locale) {
        return supportedLocales.indexOf(locale) > -1;
    }
    supportedOrDefault(locales) {
        return locales.find(isSupported) || defaultLocale;
    }
    browserLocales(languageCodeOnly = false) {
        return navigator.languages.map((locale) =>
            languageCodeOnly ? locale.split("-")[0] : locale,
        );
    }
}



// File System

class languagesManager_FileManager {
    constructor() { }

    // lang
// --> toolbar
//     --> de.json
//     --> en.json
// --> stats
//     --> de.json
//     --> en.json
// --> table
//     --> de.json
//     --> en.json
// --> footer
//     --> de.json
//     --> en.json
getAllCategories() {
    return ["toolbar", "stats", "table", "footer"];
}
getCategorieByID(id) {
    return this.getAllCategories()[id];
}
getIDByCategory(category) {
    for(var i = 0; i < this.sizeAllCategories(); i++) {
        var currentCat = this.getCategorieByID(i);
        if(category === currentCat) return i;
    }
    return 0;
}
sizeAllCategories() {
    return this.getAllCategories().length;
}



async fetchTranslationsFor(newLocale) {
    var categories = this.getAllCategories();
    var responses = {};

    for (var i = 0; i < this.sizeAllCategories(); i++) {
        var currentCategorie = categories[i];
        var defpath = `../lang/` + currentCategorie + `/${newLocale}.json`;
        var path = ``;
        var found = false;

        const response = await fetch(defpath);
        while (found) {
            response = fetch(path + defpath);
            if (this.doesFileExist(path + defpath)) {
                found = true;
            }
            path = path + `../`;
            response = fetch(path + defpath);
            if (this.doesFileExist(path + defpath)) {
                found = true;
            }
        }
        var json = await response.json();

        console.log("Working with file:");
        console.log(response.url);
        console.log("Working with response:");
        console.log(response);
        responses[currentCategorie] = json;
    }

    return responses;
}

doesFileExist(urlToFile) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, false);
    xhr.send();

    if (xhr.status == "404") {
        return false;
    } else {
        return true;
    }
}
}



// Translation System



class languagesManager_TranslationSystem {
    constructor() { }

    translatePage() {
        var allTranslableElements = this.getAllTranslableElements();
    
        console.log("Found translable Elements: " + allTranslableElements.length);
        console.log(allTranslableElements);
        console.log("Translating all Objects...");
        allTranslableElements.forEach(e => {
            this.translateElement(e);
        });
        console.log(" ");
        console.log("Translated all Objects");
        console.log(" ");
    }
    
    getAllTranslableElements() {
        console.log("");
        var getAllTranslableElements = document.querySelectorAll("[data-i18n]");
    
        document.querySelectorAll('iframe').forEach(currentIframe =>
            getAllTranslableElements = this.mergeTogether(getAllTranslableElements, this.searchInIframe(currentIframe)),
        );
    
        console.log("");
        return getAllTranslableElements;
    }
    mergeTogether(input, output) {
        var merged = [];
        for (var i = 0; output.length > i; i++) {
            merged[i] = output[i];
        }
        for (var i = 0; input.length > i; i++) {
            merged[i + output.length] = input[i];
        }
        return merged;
    }
    searchInIframe(iframe) {
        var allIFrames = [];
        var allI18n = [];
        allIFrames[0] = iframe;
    
        if (iframe.contentDocument.querySelectorAll('iframe').length > 0) {
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
    
        if (Object.keys(allIFrames).length > 1) {
            console.log("");
            for (var i = 1; i < Object.keys(allIFrames).length; i++) {
                var currentIframe = allIFrames[i];
                var currentIframeTranslations = this.searchInIframe(currentIframe);
                if (currentIframe.read != "no") {
                    allI18n = this.mergeTogether(allI18n, currentIframeTranslations);
                }
            }
        }
    
        return allI18n;
    }
    
    getTranslation(path) {
        const key = path.split(":")[0];
        const value = path.split(":")[1];
            
        var fileTranslationFinal = Object.values(translations)[languagesManager_getFileManager().getIDByCategory(key)];
        var fileTranslation = Object.values(translations)[languagesManager_getFileManager().getIDByCategory(key)];
        var translation = undefined;
        
         if (value.includes(".")) {
            var splittedValue = value.split(".");
        
            console.log("Finding Path");
            console.log("Key: " + key);
            console.log("Unproceeded Value: " + value);
            console.log("Splitted Value: " + splittedValue);
            console.log(" ");

            splittedValue[splittedValue.length] = undefined;
        
            for (var c of splittedValue) {
                if (fileTranslation[c] != undefined) {
                    fileTranslation = fileTranslation[c];
                } else {
                    translation = fileTranslation;
                    fileTranslation = fileTranslationFinal;
                    break;
                }
            }
            if(translation != undefined && !(translation instanceof Object)) {
                return translation;
            }
        } else if (fileTranslationFinal != undefined && fileTranslationFinal[value] != undefined && !(fileTranslationFinal[value] instanceof Object)) {
            translation = fileTranslationFinal[value];
            return translation;
        }
        if(translation != undefined && !(translation instanceof Object)) {
            return translation;
        }
        return undefined;
    }
    translateElement(element) {
        const path = element.getAttribute("data-i18n");
        
        var translation = this.getTranslation(path);
    
        console.log(" ");
        console.log("Translating Object");
        console.log("Path: | " + path);
        console.log("Normal text: " + element.innerText);
        console.log(" ");
    
        if(translation != undefined) {
            console.log("Translated text: " + translation);
            console.log(element.innerText);
            element.innerText = translation;
            console.log(element.innerText);
    
            return true;
        }
    
        console.log("Cannot translate Object");
        console.log("Path: | " + path);
        console.log("Element:");
        console.log(element);
    
        element.innerText = element.innerText + " (No right translation found)";
        return false;
    }
}

// Button System



class languagesManager_ButtonManager {
    constructor() { }
     
    bindLocaleSwitcher(initialValue) {
        console.log("Register all buttons...");
        this.getAllLocaleSwitcherButtons().forEach(button =>
            this.registerButton(button, initialValue),
        );
        console.log("Registered all buttons");
    }
    registerButton(currentButton, lang) {
        console.log(" ");
        console.log("Register new lang button");
        console.log("Current lang: " + lang);
        console.log("Current Button:");
        console.log(currentButton);
        console.log(" ");
        currentButton.value = lang;
        currentButton.onchange = (e) => {
            languagesManager_getLocalesManager().setLocale(e.target.value);
            setTimeout(() => {
                // Here you can set everything you want to reload after setting new languages
                // Example: refresh();
            }, 100);
        };
    }
    getAllLocaleSwitcherButtons() {
        console.log("");
        console.log("Searching all Buttons");
        var allButtons = document.querySelectorAll("[data-i18n-switcher]");
        console.log("Normal search done");
        console.log("Starting IFrame-Buttons search");
    
        document.querySelectorAll('iframe').forEach(currentIframe =>
            allButtons = languagesManager_getTranslationSystem().mergeTogether(allButtons, this.getAllLocaleSwitcherButtonsInIframes(currentIframe)),
        );
    
        console.log("IFrame-Button search done");
        console.log("");
        return allButtons;
    }
    getAllLocaleSwitcherButtonsInIframes(iframe) {
        var buttons = [];
    
        console.log("Search in IFrame:");
        console.log(iframe.contentDocument);
        console.log("Found: ");
        console.log(iframe.contentDocument.querySelectorAll("[data-i18n-switcher]"));
        buttons = iframe.contentDocument.querySelectorAll("[data-i18n-switcher]");
        console.log(buttons);
    
        var ownIframes = iframe.contentDocument.querySelectorAll('iframe');
        if (ownIframes.length > 0) {
            for (var currentFrame of ownIframes) {
                if (currentFrame.contentDocument.querySelectorAll("[data-i18n-switcher]").length > 0) {
                    buttons = languagesManager_getTranslationSystem().mergeTogether(buttons, this.getAllLocaleSwitcherButtonsInIframes(currentFrame));
                }
            }
        }
    
        return buttons;
    }
}

class languagesManager_Utils {
    constructor() {}
}