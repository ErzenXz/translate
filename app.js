const fromText = document.querySelector(".from-text"),
toText = document.querySelector(".to-text"),
exchageIcon = document.querySelector(".exchange"),
selectTag = document.querySelectorAll("select"),
icons = document.querySelectorAll(".row i");
translateBtn = document.querySelector("button");
const PROXY = "https://erproxy.herokuapp.com/";


var getFirstBrowserLanguage = function () {
    var nav = window.navigator,
    browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
    i,
    language;

    // support for HTML 5.1 "navigator.languages"
    if (Array.isArray(nav.languages)) {
      for (i = 0; i < nav.languages.length; i++) {
        language = nav.languages[i];
        if (language && language.length) {
          return language;
        }
      }
    }

    // support for other well known properties in browsers
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
      language = nav[browserLanguagePropertyKeys[i]];
      if (language && language.length) {
        return language;
      }
    }

    return null;
  };


selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == getFirstBrowserLanguage() ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

exchageIcon.addEventListener("click", () => {
    let tempText = fromText.value,
    tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

fromText.addEventListener("keyup", () => {
    if(!fromText.value) {
        toText.value = "";
    }
});

translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim(),
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;
    if(!text) return;
    toText.setAttribute("placeholder", "Translating...");

    translateText(text, translateFrom, translateTo).then(translation => {
        toText.value = translation;
    });
    // let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}&key=763cdc04e7038c80319b`;
    // // fetch(apiUrl).then(res => res.json()).then(data => {
    // //     toText.value = data.responseData.translatedText;
    // //     data.matches.forEach(data => {
    // //         if(data.id === 0) {
    // //             toText.value = data.translation;
    // //         }
    // //     });
    // //     toText.setAttribute("placeholder", "Translation");
    // // });
});

icons.forEach(icon => {
    icon.addEventListener("click", ({target}) => {
        if(!fromText.value || !toText.value) return;
        if(target.classList.contains("fa-copy")) {
            if(target.id == "from") {
                navigator.clipboard.writeText(fromText.value);
            } else {
                navigator.clipboard.writeText(toText.value);
            }
        } else {
            let utterance;
            if(target.id == "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.lang = selectTag[1].value;
            }
            speechSynthesis.speak(utterance);
        }
    });
});

function translateText(text, translateFrom, translateTo) {
    // Split the text into n parts, where each part is at most 480 characters long
    const parts = [];
    let currentPart = "";
    for (let i = 0; i < text.length; i++) {
      currentPart += text[i];
      if (currentPart.length === 480) {
        parts.push(currentPart);
        currentPart = "";
      }
    }
    if (currentPart) {
      parts.push(currentPart);
    }
  
    // Translate each part using fetch
    const promises = parts.map(part => {
      const apiUrl = `https://api.mymemory.translated.net/get?q=${part}&langpair=${translateFrom}|${translateTo}&key=763cdc04e7038c80319b`;
      return fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
          return data.responseData.translatedText;
        });
    });
  
    // When all translations are complete, combine them into a single string
    return Promise.all(promises).then(translations => {
      return translations.join("");
    });
  }
  